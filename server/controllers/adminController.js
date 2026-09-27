const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
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

const isValidId = (id) =>
  require('mongoose').Types.ObjectId.isValid(id);

// ─────────────────────────────────────────
// @desc    Get all users (with search, role filter, pagination)
// @route   GET /api/admin/users
// @access  Private (Admin only)
// ─────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { keyword, role, page, limit } = req.query;

  const filter = {};

  if (role && ['jobseeker', 'employer', 'admin'].includes(role)) {
    filter.role = role;
  }

  if (keyword) {
    const escaped = String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    data: users,
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
// @desc    Get all job listings (any status)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
// ─────────────────────────────────────────
const getAllJobs = asyncHandler(async (req, res) => {
  const { status, keyword, page, limit } = req.query;

  const filter = {};

  if (status && ['pending', 'approved', 'rejected', 'closed'].includes(status)) {
    filter.status = status;
  }

  if (keyword) {
    const escaped = String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const total = await JobPosting.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const jobs = await JobPosting.find(filter)
    .populate('category', 'name')
    .populate('employerId', 'name email')
    .sort({ createdAt: -1 })
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
// @desc    Approve or reject a job listing
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin only)
// ─────────────────────────────────────────
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!isValidId(req.params.id)) {
    return throwError(400, 'Invalid job ID format');
  }

  if (!status || !['approved', 'rejected', 'closed', 'pending'].includes(status)) {
    return throwError(400, 'Status must be one of: pending, approved, rejected, closed');
  }

  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return throwError(404, 'Job posting not found');
  }

  job.status = status;
  const updatedJob = await job.save();

  // Notify employer about the approval decision
  if (status === 'approved' || status === 'rejected') {
    try {
      await Notification.create({
        userId: job.employerId,
        message:
          status === 'approved'
            ? `Your job posting "${job.title}" has been approved and is now live.`
            : `Your job posting "${job.title}" has been rejected by an admin.`,
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `Job ${status} successfully`,
    data: updatedJob,
  });
});

// ─────────────────────────────────────────
// @desc    Get basic platform reports / stats
// @route   GET /api/admin/reports
// @access  Private (Admin only)
// ─────────────────────────────────────────
const getReports = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalJobseekers,
    totalEmployers,
    totalJobs,
    pendingJobs,
    approvedJobs,
    rejectedJobs,
    totalApplications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'jobseeker' }),
    User.countDocuments({ role: 'employer' }),
    JobPosting.countDocuments(),
    JobPosting.countDocuments({ status: 'pending' }),
    JobPosting.countDocuments({ status: 'approved' }),
    JobPosting.countDocuments({ status: 'rejected' }),
    Application.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        jobseekers: totalJobseekers,
        employers: totalEmployers,
      },
      jobs: {
        total: totalJobs,
        pending: pendingJobs,
        approved: approvedJobs,
        rejected: rejectedJobs,
      },
      applications: {
        total: totalApplications,
      },
    },
  });
});

module.exports = {
  getAllUsers,
  getAllJobs,
  updateJobStatus,
  getReports,
};