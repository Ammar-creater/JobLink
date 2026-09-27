const mongoose = require('mongoose');
const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────
// Helper — wrap async handlers
// ─────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const throwError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────
// @desc    Apply for a job (jobseeker only)
// @route   POST /api/applications
// @access  Private (jobseeker)
// ─────────────────────────────────────────
const createApplication = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, resumeUrl } = req.body;

  if (!jobId) {
    return throwError(400, 'jobId is required');
  }

  if (!isValidId(jobId)) {
    return throwError(400, 'Invalid job ID format');
  }

  // Ensure job exists and is approved
  const job = await JobPosting.findById(jobId);

  if (!job) {
    return throwError(404, 'Job posting not found');
  }

  if (job.status !== 'approved') {
    return throwError(400, 'You can only apply to approved jobs');
  }

  // Cannot apply to own job (if employer tries)
  if (job.employerId.toString() === req.user._id.toString()) {
    return throwError(400, 'You cannot apply to your own job posting');
  }

  // Prevent duplicate applications
  const existing = await Application.findOne({
    jobId,
    userId: req.user._id,
  });

  if (existing) {
    return throwError(409, 'You have already applied for this job');
  }

  const application = await Application.create({
    jobId,
    userId: req.user._id,
    resumeUrl: resumeUrl || '',
    coverLetter: coverLetter || '',
    status: 'pending',
  });

  // Notify the employer
  try {
    await Notification.create({
      userId: job.employerId,
      message: `New application received for "${job.title}".`,
    });
  } catch (notifErr) {
    console.error('Notification creation failed:', notifErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: application,
  });
});

// ─────────────────────────────────────────
// @desc    Get current user's applications
// @route   GET /api/applications/my
// @access  Private (jobseeker)
// ─────────────────────────────────────────
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ userId: req.user._id })
    .populate({
      path: 'jobId',
      select: 'title location salary type status employerId',
      populate: { path: 'employerId', select: 'name email' },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications,
  });
});

// ─────────────────────────────────────────
// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (owner or job employer)
// ─────────────────────────────────────────
const getApplicationById = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return throwError(400, 'Invalid application ID format');
  }

  const application = await Application.findById(req.params.id)
    .populate('userId', 'name email phone skills resumeUrl')
    .populate({
      path: 'jobId',
      select: 'title location salary type employerId',
    });

  if (!application) {
    return throwError(404, 'Application not found');
  }

  const isOwner = application.userId._id.toString() === req.user._id.toString();
  const isJobEmployer =
    application.jobId?.employerId?.toString() === req.user._id.toString();

  if (!isOwner && !isJobEmployer) {
    return throwError(403, 'Not authorized to view this application');
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
};