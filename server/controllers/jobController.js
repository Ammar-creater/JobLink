const mongoose = require('mongoose');
const JobPosting = require('../models/JobPosting');
const Category = require('../models/Category');

// ─────────────────────────────────────────
// Helper — wrap async handlers for error catching
// ─────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─────────────────────────────────────────
// Helper — throw an error with a status code
// (so the error middleware knows what to return)
// ─────────────────────────────────────────
const throwError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

// ─────────────────────────────────────────
// Helper — validate a MongoDB ObjectId
// ─────────────────────────────────────────
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────
// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
// ─────────────────────────────────────────
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    category,
    location,
    salary,
    requirements,
    deadline,
  } = req.body;

  // Validation
  if (!title || !description || !type || !category || !location) {
    return throwError(
      400,
      'Please provide title, description, type, category, and location'
    );
  }

  // Validate category ID format
  if (!isValidId(category)) {
    return throwError(400, 'Invalid category ID format');
  }

  // Ensure category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return throwError(404, 'Category not found');
  }

  const job = await JobPosting.create({
    employerId: req.user._id, // set by auth middleware
    title,
    description,
    type,
    category,
    location,
    salary,
    requirements,
    deadline,
    status: 'pending', // default — admin must approve
  });

  res.status(201).json({
    success: true,
    message: 'Job posting created successfully',
    data: job,
  });
});

// ─────────────────────────────────────────
// @desc    Get all job postings (with search & filters)
// @route   GET /api/jobs
// @access  Public
// ─────────────────────────────────────────
const getJobs = asyncHandler(async (req, res) => {
  const { keyword, category, location, type, salary, status } = req.query;

  const filter = {};

  // Only show approved jobs by default (unless admin queries)
  filter.status = status || 'approved';

  // Keyword search across title and description
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category) {
    if (!isValidId(category)) {
      return throwError(400, 'Invalid category ID format');
    }
    filter.category = category;
  }
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (type) filter.type = type;
  if (salary) filter.salary = { $regex: salary, $options: 'i' };

  const jobs = await JobPosting.find(filter)
    .populate('category', 'name')
    // .populate('employerId', 'name email')   // TODO: enable after feature/auth merges
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

// ─────────────────────────────────────────
// @desc    Get single job posting by ID
// @route   GET /api/jobs/:id
// @access  Public
// ─────────────────────────────────────────
const getJobById = asyncHandler(async (req, res) => {
  // Validate ID format first
  if (!isValidId(req.params.id)) {
    return throwError(400, 'Invalid job ID format');
  }

  const job = await JobPosting.findById(req.params.id).populate(
    'category',
    'name'
  );
  // .populate('employerId', 'name email');   // TODO: enable after feature/auth merges

  if (!job) {
    return throwError(404, 'Job posting not found');
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

// ─────────────────────────────────────────
// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Owner employer only)
// ─────────────────────────────────────────
const updateJob = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return throwError(400, 'Invalid job ID format');
  }

  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return throwError(404, 'Job posting not found');
  }

  // Only owner can update
  if (job.employerId.toString() !== req.user._id.toString()) {
    return throwError(403, 'Not authorized to update this job posting');
  }

  // Fields that can be updated
  const updatableFields = [
    'title',
    'description',
    'type',
    'category',
    'location',
    'salary',
    'requirements',
    'deadline',
    'status',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  const updatedJob = await job.save();

  res.status(200).json({
    success: true,
    message: 'Job posting updated successfully',
    data: updatedJob,
  });
});

// ─────────────────────────────────────────
// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Owner employer only)
// ─────────────────────────────────────────
const deleteJob = asyncHandler(async (req, res) => {
  if (!isValidId(req.params.id)) {
    return throwError(400, 'Invalid job ID format');
  }

  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return throwError(404, 'Job posting not found');
  }

  if (job.employerId.toString() !== req.user._id.toString()) {
    return throwError(403, 'Not authorized to delete this job posting');
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Job posting deleted successfully',
  });
});

// ─────────────────────────────────────────
// @desc    Get all jobs posted by current employer
// @route   GET /api/jobs/my
// @access  Private (Employer)
// ─────────────────────────────────────────
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await JobPosting.find({ employerId: req.user._id })
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};