const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['job', 'internship'],
      required: [true, 'Type must be either "job" or "internship"'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
      default: 'Negotiable',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'closed'],
      default: 'pending',
    },
    requirements: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

jobPostingSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('JobPosting', jobPostingSchema);