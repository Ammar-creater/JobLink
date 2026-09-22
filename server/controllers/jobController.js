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
// Helper — escape special regex characters
// Prevents ReDoS and 500 errors on inputs like "("
// ─────────────────────────────────────────
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ─────────────────────────────────────────
// Helper — extract first numeric value from a salary string
// "70000 PKR/month" → 70000
// "Negotiable" → 0
// ─────────────────────────────────────────
const extractSalaryValue = (salaryStr) => {
  if (!salaryStr) return 0;
  const match = String(salaryStr).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

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

  // Reject past deadlines
  if (deadline && new Date(deadline) < new Date()) {
    return throwError(400, 'Deadline cannot be in the past');
  }

  const job = await JobPosting.create({
    employerId: req.user._id,
    title,
    description,
    type,
    category,
    location,
    salary,
    salaryValue: extractSalaryValue(salary),
    requirements,
    deadline,
    status: 'pending', // always pending — admin must approve
  });

  res.status(201).json({
    success: true,
    message: 'Job posting created successfully',
    data: job,
  });
});

// ─────────────────────────────────────────
// @desc    Get all approved job postings (with search, filters, sort & pagination)
// @route   GET /api/jobs
// @access  Public
// ─────────────────────────────────────────
const getJobs = asyncHandler(async (req, res) => {
  const { keyword, category, location, type, salary, page, limit, sort } =
    req.query;

  const filter = {};

  // Always only return approved jobs — ignore any ?status= param
  filter.status = 'approved';

  // Keyword search across title and description (regex-escaped)
  if (keyword) {
    const safe = escapeRegex(keyword);
    filter.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
    ];
  }

  if (category) {
    if (!isValidId(category)) {
      return throwError(400, 'Invalid category ID format');
    }
    filter.category = category;
  }
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (type) filter.type = type;
  if (salary) filter.salary = { $regex: escapeRegex(salary), $options: 'i' };

  // ─── Sort options ─────────────────────────
  // Default: newest first
  let sortOption = { createdAt: -1 };
  if (sort === 'salary_desc') {
    sortOption = { salaryValue: -1, createdAt: -1 };
  } else if (sort === 'salary_asc') {
    sortOption = { salaryValue: 1, createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  // ─── Pagination ───────────────────────────
  // Defaults: page=1, limit=9. Max limit=50 to prevent abuse.
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);

  const total = await JobPosting.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const jobs = await JobPosting.find(filter)
    .populate('category', 'name')
    .populate('employerId', 'name email')
    .sort(sortOption)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: jobs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

// ─────────────────────────────────────────
// @desc    Get single approved job posting by ID
// @route   GET /api/jobs/:id
// @access  Public
// ─────────────────────────────────────────
const getJobById = asyncHandler(async (req, res) => {
  // Validate ID format first
  if (!isValidId(req.params.id)) {
    return throwError(400, 'Invalid job ID format');
  }

  // Only return approved jobs — reject non-approved
  const job = await JobPosting.findOne({
    _id: req.params.id,
    status: 'approved',
  })
    .populate('category', 'name')
    .populate('employerId', 'name email');

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

  // Validate new category if provided
  if (req.body.category !== undefined) {
    if (!isValidId(req.body.category)) {
      return throwError(400, 'Invalid category ID format');
    }
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return throwError(404, 'Category not found');
    }
  }

  // Reject past deadlines if provided
  if (req.body.deadline && new Date(req.body.deadline) < new Date()) {
    return throwError(400, 'Deadline cannot be in the past');
  }

  // Fields that can be updated — NOTE: 'status' is NOT here
  // Employers cannot approve/close their own jobs
  const updatableFields = [
    'title',
    'description',
    'type',
    'category',
    'location',
    'salary',
    'requirements',
    'deadline',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  // Update salaryValue whenever salary is changed
  if (req.body.salary !== undefined) {
    job.salaryValue = extractSalaryValue(req.body.salary);
  }

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