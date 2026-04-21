const UserFeedback = require("../models/UserFeedbackModel");
const RecruiterFeedback = require("../models/RecruiterFeedbackModel");
const Application = require("../models/ApplicationModel");

/* ================= USER FEEDBACK (User → Recruiter) ================= */

exports.createUserFeedback = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { applicationId, interviewRating, companyRating, comments, tags } = req.body;

    // Validate input
    if (!applicationId || !interviewRating || !companyRating) {
      return res.status(400).json({
        success: false,
        message: "Application ID and ratings are required",
      });
    }

    // Check if application exists and belongs to user
    const application = await Application.findById(applicationId).populate("jobId");
    if (!application || application.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if feedback already exists
    const existingFeedback = await UserFeedback.findOne({ applicationId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "You have already given feedback for this application",
      });
    }

    // Create feedback
    const feedback = await UserFeedback.create({
      applicationId,
      userId,
      recruiterId: application.recruiterId,
      jobId: application.jobId._id,
      interviewRating,
      companyRating,
      comments: comments || "",
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("User Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
};

exports.getUserFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const feedback = await UserFeedback.findOne({ applicationId })
      .populate("userId", "fullname email profileImage")
      .populate("jobId", "title companyName");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found",
      });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Get User Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

exports.getRecruiterFeedbackReceived = async (req, res) => {
  try {
    const recruiterId = req.user.userId;

    const feedbacks = await UserFeedback.find({ recruiterId })
      .populate("userId", "fullname email profileImage")
      .populate("jobId", "title companyName")
      .sort({ createdAt: -1 });

    // Calculate recruiter stats
    const stats = {
      totalFeedback: feedbacks.length,
      avgInterviewRating:
        feedbacks.length > 0
          ? (
              feedbacks.reduce((sum, f) => sum + f.interviewRating, 0) /
              feedbacks.length
            ).toFixed(1)
          : 0,
      avgCompanyRating:
        feedbacks.length > 0
          ? (
              feedbacks.reduce((sum, f) => sum + f.companyRating, 0) /
              feedbacks.length
            ).toFixed(1)
          : 0,
    };

    res.json({
      success: true,
      data: feedbacks,
      stats,
    });
  } catch (error) {
    console.error("Get Recruiter Feedback Received Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

/* ================= RECRUITER FEEDBACK (Recruiter → User) ================= */

exports.createRecruiterFeedback = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const {
      applicationId,
      candidateRating,
      skillsFeedback,
      selectionReason,
      tags,
      improvementAreas,
    } = req.body;

    // Validate input
    if (!applicationId || !candidateRating) {
      return res.status(400).json({
        success: false,
        message: "Application ID and rating are required",
      });
    }

    // Check if application exists and recruiter owns it
    const application = await Application.findById(applicationId).populate("jobId");
    if (!application || application.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if feedback already exists
    const existingFeedback = await RecruiterFeedback.findOne({ applicationId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "You have already given feedback for this candidate",
      });
    }

    // Create feedback
    const feedback = await RecruiterFeedback.create({
      applicationId,
      userId: application.userId,
      recruiterId,
      jobId: application.jobId._id,
      candidateRating,
      skillsFeedback: skillsFeedback || "",
      selectionReason: selectionReason || "",
      tags: tags || [],
      improvementAreas: improvementAreas || "",
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Recruiter Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to submit feedback" });
  }
};

exports.getRecruiterFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const feedback = await RecruiterFeedback.findOne({ applicationId })
      .populate("recruiterId", "fullname email companyName profileImage")
      .populate("jobId", "title");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found",
      });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error("Get Recruiter Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

exports.getUserFeedbackReceived = async (req, res) => {
  try {
    const userId = req.user.userId;

    const feedbacks = await RecruiterFeedback.find({ userId })
      .populate("recruiterId", "fullname email companyName profileImage")
      .populate("jobId", "title companyName")
      .sort({ createdAt: -1 });

    // Calculate user stats (learning feedback)
    const stats = {
      totalFeedback: feedbacks.length,
      avgCandidateRating:
        feedbacks.length > 0
          ? (
              feedbacks.reduce((sum, f) => sum + f.candidateRating, 0) /
              feedbacks.length
            ).toFixed(1)
          : 0,
    };

    res.json({
      success: true,
      data: feedbacks,
      stats,
    });
  } catch (error) {
    console.error("Get User Feedback Received Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

/* ================= GET COMPANY/RECRUITER RATINGS ================= */

exports.getRecruiterRatings = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const feedbacks = await UserFeedback.find({ recruiterId }).select(
      "interviewRating companyRating comments tags"
    );

    const stats = {
      totalReviews: feedbacks.length,
      avgInterviewRating:
        feedbacks.length > 0
          ? (
              feedbacks.reduce((sum, f) => sum + f.interviewRating, 0) /
              feedbacks.length
            ).toFixed(1)
          : 0,
      avgCompanyRating:
        feedbacks.length > 0
          ? (
              feedbacks.reduce((sum, f) => sum + f.companyRating, 0) /
              feedbacks.length
            ).toFixed(1)
          : 0,
    };

    res.json({
      success: true,
      stats,
      feedbacks,
    });
  } catch (error) {
    console.error("Get Recruiter Ratings Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ratings" });
  }
};

/* ================= DELETE FEEDBACK ================= */

exports.deleteUserFeedback = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { feedbackId } = req.params;

    const feedback = await UserFeedback.findById(feedbackId);
    if (!feedback || feedback.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await UserFeedback.findByIdAndDelete(feedbackId);

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete User Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete feedback" });
  }
};

exports.deleteRecruiterFeedback = async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const { feedbackId } = req.params;

    const feedback = await RecruiterFeedback.findById(feedbackId);
    if (!feedback || feedback.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await RecruiterFeedback.findByIdAndDelete(feedbackId);

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete Recruiter Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete feedback" });
  }
};

/* ================= ADMIN VIEWS ================= */

// Admin: Get all user feedback (Users → Recruiters)
exports.adminGetAllUserFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await UserFeedback.find()
      .populate("userId", "fullname email profileImage")
      .populate("recruiterId", "fullname companyName email profileImage")
      .populate("jobId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await UserFeedback.countDocuments();

    // Aggregate stats
    const allFeedbacks = await UserFeedback.find();
    const stats = {
      totalFeedback: totalCount,
      avgInterviewRating:
        allFeedbacks.length > 0
          ? (
              allFeedbacks.reduce((sum, f) => sum + f.interviewRating, 0) /
              allFeedbacks.length
            ).toFixed(2)
          : 0,
      avgCompanyRating:
        allFeedbacks.length > 0
          ? (
              allFeedbacks.reduce((sum, f) => sum + f.companyRating, 0) /
              allFeedbacks.length
            ).toFixed(2)
          : 0,
    };

    res.json({
      success: true,
      data: feedbacks,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin Get User Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

// Admin: Get all recruiter feedback (Recruiters → Users/Candidates)
exports.adminGetAllRecruiterFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await RecruiterFeedback.find()
      .populate("userId", "fullname email profileImage")
      .populate("recruiterId", "fullname companyName email profileImage")
      .populate("jobId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await RecruiterFeedback.countDocuments();

    // Aggregate stats
    const allFeedbacks = await RecruiterFeedback.find();
    const stats = {
      totalFeedback: totalCount,
      avgCandidateRating:
        allFeedbacks.length > 0
          ? (
              allFeedbacks.reduce((sum, f) => sum + f.candidateRating, 0) /
              allFeedbacks.length
            ).toFixed(2)
          : 0,
    };

    res.json({
      success: true,
      data: feedbacks,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin Get Recruiter Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

// Admin: Get all feedback combined view
exports.adminGetAllFeedback = async (req, res) => {
  try {
    const userFeedbacks = await UserFeedback.find()
      .populate("userId", "fullname email")
      .populate("recruiterId", "fullname companyName email")
      .populate("jobId", "title");

    const recruiterFeedbacks = await RecruiterFeedback.find()
      .populate("userId", "fullname email")
      .populate("recruiterId", "fullname companyName email")
      .populate("jobId", "title");

    const stats = {
      totalUserFeedback: userFeedbacks.length,
      totalRecruiterFeedback: recruiterFeedbacks.length,
      totalFeedback: userFeedbacks.length + recruiterFeedbacks.length,
      avgInterviewRating:
        userFeedbacks.length > 0
          ? (
              userFeedbacks.reduce((sum, f) => sum + f.interviewRating, 0) /
              userFeedbacks.length
            ).toFixed(2)
          : 0,
      avgCompanyRating:
        userFeedbacks.length > 0
          ? (
              userFeedbacks.reduce((sum, f) => sum + f.companyRating, 0) /
              userFeedbacks.length
            ).toFixed(2)
          : 0,
      avgCandidateRating:
        recruiterFeedbacks.length > 0
          ? (
              recruiterFeedbacks.reduce((sum, f) => sum + f.candidateRating, 0) /
              recruiterFeedbacks.length
            ).toFixed(2)
          : 0,
    };

    res.json({
      success: true,
      userFeedbacks,
      recruiterFeedbacks,
      stats,
    });
  } catch (error) {
    console.error("Admin Get All Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

// Admin: Delete any feedback
exports.adminDeleteUserFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await UserFeedback.findByIdAndDelete(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Admin Delete User Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete feedback" });
  }
};

exports.adminDeleteRecruiterFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await RecruiterFeedback.findByIdAndDelete(feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Admin Delete Recruiter Feedback Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete feedback" });
  }
};
