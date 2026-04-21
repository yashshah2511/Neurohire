const Job = require("../models/JobModel");
const fs = require("fs");
const path = require("path");
const Application = require("../models/ApplicationModel");
const mongoose = require("mongoose");


exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can post jobs",
      });
    }
    // Validate required fields to give a friendly error
    const { title, companyName, description } = req.body;
    const missing = [];
    if (!title || String(title).trim() === "") missing.push("title");
    if (!companyName || String(companyName).trim() === "") missing.push("companyName");
    if (!description || String(description).trim() === "") missing.push("description");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // 1️⃣ Create job first (without images)
    const job = await Job.create({
      recruiterId: req.user.userId,
      title: String(req.body.title).trim(),
      companyName: String(req.body.companyName).trim(),
      description: String(req.body.description).trim(),
      skills: req.body.skills
        ? String(req.body.skills).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      experienceLevel: req.body.experienceLevel,
      employmentType: req.body.employmentType,
      workMode: req.body.workMode,
      salaryRange: {
        min: req.body.minSalary,
        max: req.body.maxSalary,
      },
      location: {
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
      },
    });

    // 2️⃣ Handle images (if any)
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      const jobDir = path.join(
        "upload",
        "jobposts",
        job._id.toString()
      );

      if (!fs.existsSync(jobDir)) {
        fs.mkdirSync(jobDir, { recursive: true });
      }

      req.files.forEach((file) => {
        const newPath = path.join(jobDir, file.filename);
        fs.renameSync(file.path, newPath);

        imagePaths.push(newPath.replace(/\\/g, "/"));
      });

      job.images = imagePaths;
      await job.save();
    }

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

/* ================= GET ALL JOBS (USER) ================= */
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .populate("recruiterId", "companyName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};

/* ================= GET SINGLE JOB ================= */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate("recruiterId", "companyName email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};

/* ================= RECRUITER JOBS ================= */
exports.getRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const jobs = await Job.find({ recruiterId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter jobs",
    });
  }
};

/* ================= UPDATE JOB ================= */
exports.updateJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // merge fields (support skills as comma string for compatibility)
    const updates = { ...req.body };
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    Object.assign(job, updates);

    // Handle uploaded images (if any) - move from temp to job folder
    if (req.files && req.files.length > 0) {
      const jobDir = path.join('upload', 'jobposts', job._id.toString());
      if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });

      const imagePaths = job.images ? [...job.images] : [];

      req.files.forEach((file) => {
        const newPath = path.join(jobDir, file.filename);
        try {
          fs.renameSync(file.path, newPath);
          imagePaths.push(newPath.replace(/\\/g, '/'));
        } catch (e) {
          console.error('Failed to move uploaded job image', e);
        }
      });

      job.images = imagePaths;
    }

    await job.save();

    res.json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

/* ================= DELETE JOB ================= */
exports.deleteJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // remove job assets (images) if present
    try {
      const jobDir = path.join('upload', 'jobposts', job._id.toString());
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.error('Failed to remove job assets', e);
    }

    // delete related applications
    try {
      await Application.deleteMany({ jobId: job._id });
    } catch (e) {
      console.error('Failed to delete related applications', e);
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .populate("recruiterId", "companyName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};


exports.filterJobs = async (req, res) => {
  try {
    const {
      city,
      experienceLevel,
      employmentType,
      workMode,
    } = req.query;

    const filter = {
      status: "open", // show only open jobs to users
    };

    // ✅ Apply filters ONLY if present
    if (city) {
      filter["location.city"] = city;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (workMode) {
      filter.workMode = workMode;
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .populate('recruiterId', 'companyName');

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });

  } catch (error) {
    console.error("Filter Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
};


exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(jobId)
      .populate("recruiterId", "companyName email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get Job Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};


exports.applyJob = async (req, res) => {
  const userId = req.user.userId;
  const jobId = req.params.jobId;

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ success: false });

  const alreadyApplied = await Application.findOne({ jobId, userId });
  if (alreadyApplied)
    return res.status(400).json({ message: "Already applied" });

  await Application.create({
    jobId,
    userId,
    recruiterId: job.recruiterId
  });

  job.totalApplicants += 1;
  await job.save();

  res.json({ success: true, message: "Applied successfully" });
};


exports.getRecruiterJobsV2 =  async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const jobs = await Job.find({ recruiterId }).lean();

    if (!jobs.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // ✅ ENSURE ObjectId conversion
    const jobIds = jobs.map((job) =>
      new mongoose.Types.ObjectId(job._id)
    );

    const counts = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
        },
      },
      {
        $group: {
          _id: "$jobId",
          count: { $sum: 1 },
          avgMatch: { $avg: "$matchScore" },
        },
      },
    ]);

    // Map jobId → count
    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = {
        count: item.count,
        avgMatch: item.avgMatch ? Math.round(item.avgMatch) : null,
      };
    });

    const jobsWithCounts = jobs.map((job) => ({
      ...job,
      applicantCount: (countMap[job._id.toString()] || {}).count || 0,
      avgMatch: (countMap[job._id.toString()] || {}).avgMatch || null,
    }));

    res.status(200).json({
      success: true,
      data: jobsWithCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter jobs",
    });
  }
};
