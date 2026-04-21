const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // 🔐 Recruiter Info
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏢 Company Info
    companyName: {
      type: String,
      required: true,
    },

    // 📄 Job Info
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    skills: [
      {
        type: String,
        required: true,
      },
    ],

    experienceLevel: {
      type: String,
      enum: ["fresher", "junior", "mid", "senior"],
      default: "fresher",
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time",
    },
    workMode: {
      type: String,
      enum: ["on-site", "remote", "hybrid"],
      default: "on-site",
    },

    salaryRange: {
      min: Number,
      max: Number,
    },

    location: {
      city: String,
      state: String,
      country: String,
      remote: {
        type: Boolean,
        default: false,
      },
    },

     // 🖼️ JOB IMAGES (NEW)
    images: [
      {
        type: String, // store relative path
      },
    ],


    // 📌 Status
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    // 📊 Stats
    totalApplicants: {
      type: Number,
      default: 0,
    },
    totalHired: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
