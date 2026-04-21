const Application = require("../models/ApplicationModel");
const Job = require("../models/JobModel");
const User = require("../models/UserModel");
const sendEmail = require("../utils/SendEmail");
const fs = require('fs');
const { computeMatchFromBuffer } = require('./mlUtils');


exports.applyJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const jobId = req.params.jobId;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") {
      return res.status(404).json({ success: false, message: "Job not available" });
    }

    // ❌ Prevent duplicate apply
    const alreadyApplied = await Application.findOne({ jobId, userId });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    let resumePath;

    if (req.file) {
      resumePath = req.file.path;
    } else {
      // fallback: use profile resume from user document
      const applicant = await User.findById(userId);
      if (applicant && applicant.resume) {
        resumePath = applicant.resume;
      }
    }

    if (!resumePath) {
      return res.status(400).json({ success: false, message: "Resume required" });
    }

    // compute match using mlUtils (do not delete uploaded resume here)
    const buffer = fs.readFileSync(resumePath);
    const match = await computeMatchFromBuffer(job, buffer);

    const application = await Application.create({
      jobId,
      userId,
      recruiterId: job.recruiterId,
      resume: resumePath.replace(/\\/g, "/"),
      coverLetter,
      matchedSkills: match.matchedSkills,
      matchScore: match.score,
    });

    // update user's skills (merge unique)
    try {
      const user = await User.findById(userId);
      if (user) {
        const existing = (user.skills || []).map((s) => s.toLowerCase());
        const incoming = (match.matchedSkills || []).map((s) => s.toLowerCase());
        const union = Array.from(new Set([...existing, ...incoming]));
        user.skills = union;
        await user.save();
      }
    } catch (e) {
      console.error('Failed to update user skills', e);
    }

    job.totalApplicants += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: "Applied successfully",
      data: application,
    });
  } catch (error) {
    console.error("Apply Job Error:", error);
    res.status(500).json({ success: false, message: "Apply failed" });
  }
};

exports.getApplicantsByJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job || job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const applications = await Application.find({ jobId })
      .populate("userId", "fullname email profileImage")
      .sort({ createdAt: -1 });

    // compute status counts
    const stats = applications.reduce(
      (acc, a) => {
        acc.total += 1;
        if (a.status === 'pending') acc.pending += 1;
        if (a.status === 'shortlisted') acc.shortlisted += 1;
        if (a.status === 'rejected') acc.rejected += 1;
        if (a.status === 'hired') acc.hired += 1;
        return acc;
      },
      { total: 0, pending: 0, shortlisted: 0, rejected: 0, hired: 0 }
    );

    res.json({
      success: true,
      count: applications.length,
      stats,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};


exports.updateApplicationStatus = async (req, res) => {
  try {
    console.log("===== UPDATE APPLICATION STATUS API HIT =====");

    /* ================= GET DATA ================= */
    const recruiterId = req.user.userId;
    const { status } = req.body;

    console.log("Recruiter ID:", recruiterId);
    console.log("Requested Status:", status);
    console.log("Application ID:", req.params.applicationId);

    /* ================= VALIDATE STATUS ================= */
    const allowedStatuses = ["pending", "shortlisted", "rejected", "hired"];

    if (!allowedStatuses.includes(status)) {
      console.log("❌ Invalid Status Received:", status);

      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    console.log("✅ Status validation passed");

    /* ================= FIND APPLICATION ================= */
    console.log("🔍 Fetching application from DB...");

    const application = await Application.findById(req.params.applicationId)
      .populate("userId", "fullname email")
      .populate("jobId", "title");

    if (!application) {
      console.log("❌ Application not found in DB");

      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    console.log("✅ Application found");
    console.log("Application Recruiter ID:", application.recruiterId);
    console.log("Applicant Name:", application.userId.fullname);
    console.log("Applicant Email:", application.userId.email);
    console.log("Job Title:", application.jobId.title);
    console.log("Old Status:", application.status);

    /* ================= AUTHORIZATION CHECK ================= */
    console.log("🔐 Checking recruiter authorization...");

    if (application.recruiterId.toString() !== recruiterId) {
      console.log("❌ Unauthorized recruiter access attempt");

      return res.status(403).json({
        success: false,
        message: "Unauthorized action",
      });
    }

    console.log("✅ Recruiter authorized");

    /* ================= UPDATE STATUS ================= */
    const oldStatus = application.status;
    application.status = status;
    await application.save();

    console.log("✅ Application status updated successfully");
    console.log("New Status:", application.status);

    /* ================= SEND EMAIL ================= */
    if (status === "shortlisted" || status === "rejected" || status === "hired") {
      console.log("📧 Preparing email notification...");

      let subject = "";
      let html = "";

      if (status === "shortlisted") {
        subject = "🎉 You’ve been Shortlisted – NeuroHire";
        html = `
          <h2>Hello ${application.userId.fullname},</h2>
          <p>Great news! 🎉</p>
          <p>You have been <b>shortlisted</b> for the position of 
          <b>${application.jobId.title}</b>.</p>
          <p>The recruiter will contact you soon.</p>
        `;

        console.log("📩 Shortlist email prepared");
      }

      if (status === "rejected") {
        subject = "Application Update – NeuroHire";
        html = `
          <h2>Hello ${application.userId.fullname},</h2>
          <p>Thank you for applying for 
          <b>${application.jobId.title}</b>.</p>
          <p>Unfortunately, your application was not selected.</p>
        `;

        console.log("📩 Rejection email prepared");
      }

      if (status === "hired") {
        subject = "🎉 Offer from NeuroHire — You're Hired";
        html = `
          <h2>Congratulations ${application.userId.fullname}!</h2>
          <p>We are pleased to inform you that you have been <b>hired</b> for the role of
          <b>${application.jobId.title}</b> at <b>${application.jobId.companyName}</b>.</p>
          <p>The recruiter will reach out with next steps.</p>
        `;

        console.log("📩 Hired email prepared");

        // increment job hires (best-effort)
        try {
          const job = await Job.findById(application.jobId._id);
          if (job) {
            job.totalHired = (job.totalHired || 0) + 1;
            await job.save();
          }
        } catch (e) {
          console.error('Failed to increment job.totalHired', e);
        }
      }

      console.log("📤 Sending email to:", application.userId.email);

      await sendEmail({
        to: application.userId.email,
        subject,
        html,
      });

      console.log("✅ Email sent successfully");
    } else {
      console.log("ℹ️ No email required for status:", status);
    }

    /* ================= RESPONSE ================= */
    console.log("🚀 API completed successfully");

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });

  } catch (error) {
    console.error("🔥 Update Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    // console.log("USER FROM TOKEN:", req.user.userId);

    const applications = await Application.find({
      userId: req.user.userId,
    })
      .populate("jobId", "title company location salaryRange")
      .sort({ createdAt: -1 });

    // console.log("FOUND APPLICATIONS:", applications.length);

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// Recompute match scores for all applicants of a job (recruiter only)
exports.scoreAllApplicantsByJob = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job || job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const applications = await Application.find({ jobId });
    const updated = [];

    for (const app of applications) {
      try {
        if (!app.resume) {
          updated.push({ id: app._id, ok: false, reason: 'no resume' });
          continue;
        }

        const resumePath = app.resume.replace(/\//g, "\\");
        if (!fs.existsSync(resumePath)) {
          // try without conversion
          if (!fs.existsSync(app.resume)) {
            updated.push({ id: app._id, ok: false, reason: 'file not found' });
            continue;
          }
        }

        const buffer = fs.readFileSync(app.resume);
        const match = await computeMatchFromBuffer(job, buffer);

        app.matchedSkills = match.matchedSkills || [];
        app.matchScore = match.score || null;
        await app.save();

        // Optionally merge skills into user profile
        try {
          const user = await User.findById(app.userId);
          if (user) {
            const existing = (user.skills || []).map((s) => s.toLowerCase());
            const incoming = (match.matchedSkills || []).map((s) => s.toLowerCase());
            const union = Array.from(new Set([...existing, ...incoming]));
            user.skills = union;
            await user.save();
          }
        } catch (e) {
          // non-fatal
          console.error('Failed to merge skills for user', app.userId, e);
        }

        updated.push({ id: app._id, ok: true, score: app.matchScore });
      } catch (e) {
        console.error('Failed scoring application', app._id, e);
        updated.push({ id: app._id, ok: false, reason: e.message });
      }
    }

    // return refreshed list
    const refreshed = await Application.find({ jobId }).populate("userId", "fullname email profileImage").sort({ createdAt: -1 });

    res.status(200).json({ success: true, updated, data: refreshed });
  } catch (error) {
    console.error('Score All Applicants Error:', error);
    res.status(500).json({ success: false, message: 'Scoring failed' });
  }
};

// Export applicants for a job as CSV (sorted by matchScore desc)
exports.exportApplicantsCsv = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job || job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const applications = await Application.find({ jobId })
      .populate('userId', 'fullname email')
      .sort({ matchScore: -1, createdAt: -1 });

    const escapeCsv = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    };

    const header = ['Full Name', 'Email', 'Status', 'MatchScore', 'MatchedSkills', 'AppliedAt', 'ResumeURL'];
    const rows = [header.join(',')];

    for (const app of applications) {
      const name = app.userId?.fullname || '';
      const email = app.userId?.email || '';
      const status = app.status || '';
      const score = (typeof app.matchScore === 'number' && !isNaN(app.matchScore)) ? Math.round(app.matchScore) : '';
      const skills = (app.matchedSkills || []).join('; ');
      const appliedAt = app.createdAt ? app.createdAt.toISOString() : '';
      const resumeUrl = app.resume ? `${req.protocol}://${req.get('host')}/${app.resume}` : '';

      const line = [name, email, status, score, skills, appliedAt, resumeUrl].map(escapeCsv).join(',');
      rows.push(line);
    }

    const csv = rows.join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="applicants-${jobId}.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('Export Applicants CSV Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};






