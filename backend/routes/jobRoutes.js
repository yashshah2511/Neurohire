const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/AuthMiddleware");
const jobController = require("../controllers/jobController");
const uploadJobImages = require("../middlewares/JobImageMulter");

// Recruiter
router.post("/create", verifyToken,uploadJobImages, jobController.createJob);
router.get("/recruiter", verifyToken, jobController.getRecruiterJobs);
router.put("/:jobId", verifyToken, uploadJobImages, jobController.updateJob);
router.delete("/:jobId", verifyToken, jobController.deleteJob);
router.get("/recruiter2", verifyToken, jobController.getRecruiterJobsV2);


// User
router.get("/", jobController.getAllJobs);
router.get("/filter", jobController.filterJobs);
router.get("/:jobId", jobController.getJobById);
router.post("/apply/:jobId", verifyToken, jobController.applyJob);


module.exports = router;
