const express = require('express');
const router = express.Router();

const {
  createApplication,
  getMyApplications,
  getApplicationById,
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────
// Jobseeker routes
// ─────────────────────────────────────────
router.post('/', protect, authorize('jobseeker'), createApplication);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);

// ─────────────────────────────────────────
// Shared — application detail
// ─────────────────────────────────────────
router.get('/:id', protect, getApplicationById);

module.exports = router;