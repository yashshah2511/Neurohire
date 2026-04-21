const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/AuthMiddleware");
const feedbackController = require("../controllers/feedbackController");

/* ================= USER FEEDBACK (User → Recruiter) ================= */

// User submit feedback about recruiter/company (after application status update)
router.post("/user-feedback", verifyToken, feedbackController.createUserFeedback);

// Get feedback for specific application
router.get(
  "/user-feedback/:applicationId",
  verifyToken,
  feedbackController.getUserFeedback
);

// Recruiter get all feedback they received from users
router.get(
  "/user-feedback-received",
  verifyToken,
  feedbackController.getRecruiterFeedbackReceived
);

// Delete user feedback
router.delete(
  "/user-feedback/:feedbackId",
  verifyToken,
  feedbackController.deleteUserFeedback
);

/* ================= RECRUITER FEEDBACK (Recruiter → User) ================= */

// Recruiter submit feedback about candidate
router.post(
  "/recruiter-feedback",
  verifyToken,
  feedbackController.createRecruiterFeedback
);

// Get feedback for specific application
router.get(
  "/recruiter-feedback/:applicationId",
  verifyToken,
  feedbackController.getRecruiterFeedback
);

// User get all feedback they received from recruiters
router.get(
  "/recruiter-feedback-received",
  verifyToken,
  feedbackController.getUserFeedbackReceived
);

// Delete recruiter feedback
router.delete(
  "/recruiter-feedback/:feedbackId",
  verifyToken,
  feedbackController.deleteRecruiterFeedback
);

/* ================= PUBLIC/GENERAL ================= */

// Get recruiter ratings and reviews (public - helps users see company reviews)
router.get("/recruiter-ratings/:recruiterId", feedbackController.getRecruiterRatings);

/* ================= ADMIN ONLY ================= */

// Admin: Get all user feedback with pagination
router.get(
  "/admin/all-user-feedback",
  verifyToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    return feedbackController.adminGetAllUserFeedback(req, res);
  }
);

// Admin: Get all recruiter feedback with pagination
router.get(
  "/admin/all-recruiter-feedback",
  verifyToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    return feedbackController.adminGetAllRecruiterFeedback(req, res);
  }
);

// Admin: Get all feedback (combined view)
router.get(
  "/admin/all-feedback",
  verifyToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    return feedbackController.adminGetAllFeedback(req, res);
  }
);

// Admin: Delete user feedback
router.delete(
  "/admin/user-feedback/:feedbackId",
  verifyToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    return feedbackController.adminDeleteUserFeedback(req, res);
  }
);

// Admin: Delete recruiter feedback
router.delete(
  "/admin/recruiter-feedback/:feedbackId",
  verifyToken,
  async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    return feedbackController.adminDeleteRecruiterFeedback(req, res);
  }
);

module.exports = router;
