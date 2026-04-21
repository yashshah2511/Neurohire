const mongoose = require("mongoose");

const recruiterFeedbackSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true, // One feedback per application from recruiter
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    // ⭐ Candidate Rating
    candidateRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // 💬 Skills Feedback
    skillsFeedback: {
      type: String,
      maxlength: 2000,
      trim: true,
    },

    // 📝 Selection Reason
    selectionReason: {
      type: String,
      maxlength: 2000,
      trim: true,
    },

    // 🎯 Tags (for quick categorization)
    tags: [
      {
        type: String,
        enum: [
          "strong_technical",
          "strong_soft_skills",
          "good_communication",
          "leadership_potential",
          "problem_solver",
          "team_player",
          "lacks_experience",
          "lacking_skills",
          "cultural_fit",
          "hire_immediately",
          "keep_for_future",
          "needs_development",
        ],
      },
    ],

    // 💡 Improvement Areas (for rejected candidates)
    improvementAreas: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecruiterFeedback", recruiterFeedbackSchema);
