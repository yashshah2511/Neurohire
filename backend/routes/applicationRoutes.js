const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/AuthMiddleware");
const uploadResume = require("../middlewares/ResumeMulter");
const applicationController = require("../controllers/applicationController");

// USER
router.post(
  "/apply/:jobId",
  verifyToken,
  uploadResume,
  applicationController.applyJob
);

// RECRUITER
router.get(
  "/job/:jobId",
  verifyToken,
  applicationController.getApplicantsByJob
);

// RECRUITER: recompute match scores for all applicants for a job
router.post(
  "/job/:jobId/score",
  verifyToken,
  applicationController.scoreAllApplicantsByJob
);

// RECRUITER: export applicants for a job as CSV
router.get(
  "/job/:jobId/export",
  verifyToken,
  applicationController.exportApplicantsCsv
);

router.put(
  "/status/:applicationId",
  verifyToken,
  applicationController.updateApplicationStatus
);

/* ================= GET USER APPLICATIONS ================= */
router.get(
  "/user", 
  verifyToken, 
  applicationController.getUserApplications);

module.exports = router;
