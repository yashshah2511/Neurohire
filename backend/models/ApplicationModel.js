const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
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

    // 📄 Resume
    resume: {
      type: String, // file path
      required: true,
    },

    // ✍️ Cover Letter
    coverLetter: {
      type: String,
      maxlength: 2000,
    },

    // 📌 Status
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    // 🔎 ML Match
    matchedSkills: [
      { type: String }
    ],
    matchScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
