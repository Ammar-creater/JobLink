const express = require('express');
const router = express.Router();

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');

// Real JWT auth + role-based authorization (from feature/auth — Noreen's Module 1)
const { protect, authorize } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// Public routes (no auth needed)
// ─────────────────────────────────────────
router.get('/', getJobs);            // GET    /api/jobs

// ─────────────────────────────────────────
// Protected routes (must be BEFORE /:id)
// ─────────────────────────────────────────
router.get('/my', protect, authorize('employer'), getMyJobs);        // GET    /api/jobs/my
router.post('/', protect, authorize('employer'), createJob);         // POST   /api/jobs
router.put('/:id', protect, authorize('employer'), updateJob);       // PUT    /api/jobs/:id
router.delete('/:id', protect, authorize('employer'), deleteJob);    // DELETE /api/jobs/:id

// ─────────────────────────────────────────
// Public single job route — MUST BE LAST
// (otherwise /:id would catch /my)
// ─────────────────────────────────────────
router.get('/:id', getJobById);      // GET    /api/jobs/:id

module.exports = router;