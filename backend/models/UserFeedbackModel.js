const mongoose = require("mongoose");

const userFeedbackSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true, // One feedback per application from user
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

    // ⭐ Rating
    interviewRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    companyRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // 💬 Comments
    comments: {
      type: String,
      maxlength: 2000,
      trim: true,
    },

    // 📝 Tags (checkbox options)
    tags: [
      {
        type: String,
        enum: [
          "good_interview",
          "tough_questions",
          "good_culture",
          "poor_communication",
          "slow_process",
          "fair_assessment",
          "rejected_for_role",
          "rejected_no_reason",
          "positive_experience",
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserFeedback", userFeedbackSchema);
