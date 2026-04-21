const User = require('../models/UserModel');
const Job = require('../models/JobModel');
const Application = require('../models/ApplicationModel');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// GET /api/admin/users/:userId
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -otp -otpExpiresAt').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Get user by id error', err);
    return res.status(500).json({ success: false });
  }
};

// GET /api/admin/hiring/company/:recruiterId
exports.getCompanyHiringAnalytics = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId;

    // find company/profile
    const company = await User.findById(recruiterId).select('companyName companyWebsite companyDescription industry companySize companyAddress foundedYear profileImage fullname mission values skills contactEmail contactPhone companyLogo').lean();

    // aggregate applications for jobs by this recruiter
    const apps = await Application.aggregate([
      {
        $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' }
      },
      { $unwind: '$job' },
      { $match: { 'job.recruiterId': mongoose.Types.ObjectId(recruiterId) } },
      {
        $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'applicant' }
      },
      { $unwind: '$applicant' },
      { $project: { jobId: '$job._id', jobTitle: '$job.title', status: 1, userId: '$applicant._id', fullname: '$applicant.fullname', email: '$applicant.email', appliedAt: '$createdAt' } },
      { $sort: { appliedAt: -1 } }
    ]);

    const stats = apps.reduce((acc, a) => {
      acc.total += 1;
      if (a.status === 'pending') acc.pending += 1;
      if (a.status === 'shortlisted') acc.shortlisted += 1;
      if (a.status === 'rejected') acc.rejected += 1;
      if (a.status === 'hired') acc.hired += 1;
      // track per-job counts
      acc.perJob[a.jobId] = acc.perJob[a.jobId] || { jobTitle: a.jobTitle, total: 0, pending: 0, shortlisted: 0, rejected: 0, hired: 0 };
      acc.perJob[a.jobId].total += 1;
      if (a.status === 'pending') acc.perJob[a.jobId].pending += 1;
      if (a.status === 'shortlisted') acc.perJob[a.jobId].shortlisted += 1;
      if (a.status === 'rejected') acc.perJob[a.jobId].rejected += 1;
      if (a.status === 'hired') acc.perJob[a.jobId].hired += 1;
      // collect hired users
      if (a.status === 'hired') acc.hiredUsers.push({ userId: a.userId, fullname: a.fullname, email: a.email, jobId: a.jobId, jobTitle: a.jobTitle });
      // collect applicants
      acc.applicants.push(a);
      return acc;
    }, { total: 0, pending: 0, shortlisted: 0, rejected: 0, hired: 0, perJob: {}, hiredUsers: [], applicants: [] });

    return res.status(200).json({ success: true, data: { company, stats } });
  } catch (err) {
    console.error('Company hiring analytics error', err);
    return res.status(500).json({ success: false, message: 'Failed to compute company hiring analytics' });
  }
};

// Helper to build pagination response
function buildPaginationResult(docs, page, limit, total) {
  return {
    docs,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const recruiters = await User.countDocuments({ role: 'recruiter' });
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const pendingVerifications = await User.countDocuments({ role: 'recruiter', isRecruiterVerified: false });

    // Monthly signups (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const signupAgg = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const signups = signupAgg.map(s => ({ label: `${s._id.month}/${s._id.year}`, count: s.count }));

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        recruiters,
        activeJobs,
        pendingVerifications,
        signups,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error', err);
    return res.status(500).json({ success: false, message: 'Failed to load admin dashboard' });
  }
};

// GET /api/admin/hiring-analytics
exports.getHiringAnalytics = async (req, res) => {
  try {
    // Pagination + filtering params for the candidates table
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '25'));
    const search = (req.query.search || '').trim();
    const sort = req.query.sort || '-appliedAt';
    const status = req.query.status; // 'hired' | 'not_hired'

    // Overall recruiter stats
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const activeRecruiters = await Job.distinct('recruiterId', { status: 'open' }).then((ids) => ids.length);

    // Candidate stats (unique candidates across applications)
    const candidateStats = await Application.aggregate([
      {
        $group: {
          _id: '$userId',
          hasHired: { $max: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
        },
      },
      {
        $group: {
          _id: null,
          totalCandidates: { $sum: 1 },
          hiredCandidates: { $sum: '$hasHired' },
        },
      },
    ]);

    const stats = {
      totalRecruiters,
      activeRecruiters,
      totalCandidates: 0,
      hiredCandidates: 0,
      notHiredCandidates: 0,
      totalHires: 0,
    };

    if (candidateStats.length > 0) {
      stats.totalCandidates = candidateStats[0].totalCandidates;
      stats.hiredCandidates = candidateStats[0].hiredCandidates;
      stats.notHiredCandidates = stats.totalCandidates - stats.hiredCandidates;
    }

    stats.totalHires = await Application.countDocuments({ status: 'hired' });

    // Build candidate listing with pagination / search / sort
    const matchStage = {};

    if (status === 'hired') {
      matchStage.status = 'hired';
    } else if (status === 'not_hired') {
      matchStage.status = { $ne: 'hired' };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      matchStage.$or = [
        { 'applicant.fullname': regex },
        { 'applicant.email': regex },
        { 'job.title': regex },
        { 'job.companyName': regex },
      ];
    }

    // Allowed sort keys for security
    const sortFieldMap = {
      fullname: 'applicant.fullname',
      email: 'applicant.email',
      status: 'status',
      company: 'job.companyName',
      jobTitle: 'job.title',
      appliedAt: 'createdAt',
    };

    let sortField = 'createdAt';
    let sortDirection = -1;
    if (sort) {
      const direction = sort.startsWith('-') ? -1 : 1;
      const key = sort.replace(/^-/, '');
      if (sortFieldMap[key]) {
        sortField = sortFieldMap[key];
        sortDirection = direction;
      }
    }

    const basePipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'applicant',
        },
      },
      { $unwind: '$applicant' },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
    ];

    if (Object.keys(matchStage).length > 0) {
      basePipeline.push({ $match: matchStage });
    }

    const facetPipeline = [
      { $sort: { [sortField]: sortDirection } },
      {
        $facet: {
          docs: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                userId: '$applicant._id',
                fullname: '$applicant.fullname',
                email: '$applicant.email',
                status: 1,
                appliedAt: '$createdAt',
                jobId: '$job._id',
                jobTitle: '$job.title',
                companyName: '$job.companyName',
                recruiterId: '$job.recruiterId',
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const listAgg = await Application.aggregate([...basePipeline, ...facetPipeline]);
    const candidates = listAgg[0]?.docs || [];
    const total = listAgg[0]?.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        stats,
        candidates: buildPaginationResult(candidates, page, limit, total),
      },
    });
  } catch (err) {
    console.error('Hiring analytics error', err);
    return res.status(500).json({ success: false, message: 'Failed to compute hiring analytics' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '10'));
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search || '';

    const filter = {};
    if (search) {
      filter.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: buildPaginationResult(users, page, limit, total) });
  } catch (err) {
    console.error('Get users error', err);
    res.status(500).json({ success: false });
  }
};

// GET /api/admin/recruiters
exports.getRecruiters = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '10'));
    const sort = req.query.sort || '-createdAt';
    const verified = req.query.verified; // 'true' | 'false' | undefined

    const filter = { role: 'recruiter' };
    if (verified === 'true') filter.isRecruiterVerified = true;
    if (verified === 'false') filter.isRecruiterVerified = false;

    const total = await User.countDocuments(filter);
    const recruiters = await User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: buildPaginationResult(recruiters, page, limit, total) });
  } catch (err) {
    console.error('Get recruiters error', err);
    res.status(500).json({ success: false });
  }
};

// GET /api/admin/jobs
exports.getJobs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, parseInt(req.query.limit || '10'));
    const sort = req.query.sort || '-createdAt';
    const status = req.query.status; // open|closed
    const search = req.query.search || '';

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { companyName: { $regex: search, $options: 'i' } }];

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('recruiterId', 'fullname email companyName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, data: buildPaginationResult(jobs, page, limit, total) });
  } catch (err) {
    console.error('Get jobs error', err);
    res.status(500).json({ success: false });
  }
};

// PUT /api/admin/users/:userId - update role or verification
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const update = req.body;

    if (update.role && !['admin', 'user', 'recruiter'].includes(update.role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Update user error', err);
    res.status(500).json({ success: false });
  }
};

// DELETE /api/admin/users/:userId
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete applications made by the user
    try {
      await Application.deleteMany({ userId: user._id });
    } catch (e) {
      console.error('Failed to delete user applications', e);
    }

    // If recruiter, delete their jobs + assets + related applications
    if (user.role === 'recruiter') {
      try {
        const jobs = await Job.find({ recruiterId: user._id });
        for (const job of jobs) {
          // remove job assets
          try {
            const jobDir = path.join('upload', 'jobposts', job._id.toString());
            if (fs.existsSync(jobDir)) fs.rmSync(jobDir, { recursive: true, force: true });
          } catch (e) {
            console.error('Failed to remove job assets for', job._id, e);
          }
          // delete related applications
          try {
            await Application.deleteMany({ jobId: job._id });
          } catch (e) {
            console.error('Failed to delete applications for job', job._id, e);
          }
          await Job.findByIdAndDelete(job._id);
        }
      } catch (e) {
        console.error('Failed to cleanup recruiter jobs', e);
      }
    }

    // finally remove user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete user error', err);
    res.status(500).json({ success: false });
  }
};

// PUT /api/admin/jobs/:jobId - update job (status etc)
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const update = req.body;
    const job = await Job.findByIdAndUpdate(jobId, update, { new: true }).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    console.error('Update job error', err);
    res.status(500).json({ success: false });
  }
};

// DELETE /api/admin/jobs/:jobId
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // remove job assets
    try {
      const jobDir = path.join('upload', 'jobposts', job._id.toString());
      if (fs.existsSync(jobDir)) fs.rmSync(jobDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to remove job assets', e);
    }

    // delete related applications
    try {
      await Application.deleteMany({ jobId: job._id });
    } catch (e) {
      console.error('Failed to delete related applications', e);
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete job error', err);
    res.status(500).json({ success: false });
  }
};
