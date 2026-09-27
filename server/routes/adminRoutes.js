const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getAllJobs,
  updateJobStatus,
  getReports,
} = require('../controllers/adminController');

// Real JWT auth + role check (from Noreen's authMiddleware)
const { protect, authorize } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// All admin routes require: valid JWT + role = admin
// ─────────────────────────────────────────
router.use(protect);
router.use(authorize('admin'));

// ─────────────────────────────────────────
// @route   GET /api/admin/reports
// ─────────────────────────────────────────
router.get('/reports', getReports);

// ─────────────────────────────────────────
// @route   GET /api/admin/users
// ─────────────────────────────────────────
router.get('/users', getAllUsers);

// ─────────────────────────────────────────
// @route   GET /api/admin/jobs
// ─────────────────────────────────────────
router.get('/jobs', getAllJobs);

// ─────────────────────────────────────────
// @route   PUT /api/admin/jobs/:id/status
// ─────────────────────────────────────────
router.put('/jobs/:id/status', updateJobStatus);

module.exports = router;