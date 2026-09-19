const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    type: {
      type: String,
      enum: ["job", "internship"],
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "closed"],
      default: "pending",
    },
  },
  { timestamps: true } // postedDate = createdAt
);

module.exports = mongoose.model("Job", jobSchema);