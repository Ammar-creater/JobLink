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

// TEMPORARY — swap with real auth middleware from Noreen's feature/auth later
const mockAuth = require('../middleware/mockAuth');

// ─────────────────────────────────────────
// Public routes (no auth needed)
// ─────────────────────────────────────────
router.get('/', getJobs);            // GET    /api/jobs
router.get('/:id', getJobById);      // GET    /api/jobs/:id

// ─────────────────────────────────────────
// Protected routes (require login)
// ─────────────────────────────────────────
router.get('/my', mockAuth, getMyJobs);        // GET    /api/jobs/my
router.post('/', mockAuth, createJob);         // POST   /api/jobs
router.put('/:id', mockAuth, updateJob);       // PUT    /api/jobs/:id
router.delete('/:id', mockAuth, deleteJob);    // DELETE /api/jobs/:id

module.exports = router;