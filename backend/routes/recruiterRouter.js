const express = require("express");
const router = express.Router();
const Job = require("../models/JobModel");
const Application = require("../models/ApplicationModel");
const { verifyToken } = require("../middlewares/AuthMiddleware");

/* ================= RECRUITER DASHBOARD ================= */
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const jobs = await Job.find({ recruiterId }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    const totalJobs = jobIds.length;
    const totalApplications = await Application.countDocuments({
      jobId: { $in: jobIds },
    });

    const shortlisted = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: "hired",
    });

    const rejected = await Application.countDocuments({
      jobId: { $in: jobIds },
      status: "rejected",
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalApplications,
        shortlisted,
        rejected,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
});


/* ================= DASHBOARD CHARTS ================= */
router.get("/dashboard/charts", verifyToken, async (req, res) => {
  try {
    const recruiterId = req.user && req.user.userId;

    if (!recruiterId) {
      return res.status(400).json({ success: false, message: 'Missing recruiter id' });
    }

    // ---- STATUS DISTRIBUTION ----
    // Ensure recruiterId is treated as ObjectId in aggregation
    const mongoose = require('mongoose');
    if (!mongoose.isValidObjectId(recruiterId)) {
      console.warn('Invalid recruiterId in token:', recruiterId);
      return res.status(400).json({ success: false, message: 'Invalid recruiter id' });
    }

    const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId);

    const statusAgg = await Application.aggregate([
      { $match: { recruiterId: recruiterObjectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = { pending: 0, shortlisted: 0, rejected: 0, hired: 0 };
    statusAgg.forEach(s => (statusMap[s._id] = s.count));

    // ---- MONTHLY APPLICATIONS (LAST 6 MONTHS) ----
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const monthlyAgg = await Application.aggregate([
      {
        $match: {
          recruiterId: recruiterObjectId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthly = monthlyAgg.map(m => ({
      label: `${m._id.month}/${m._id.year}`,
      count: m.count,
    }));

    res.json({
      success: true,
      data: {
        status: statusMap,
        monthly,
      },
    });
  } catch (err) {
    console.error('Recruiter charts error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
