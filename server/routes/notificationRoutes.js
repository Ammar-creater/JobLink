const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes - any logged-in user (jobseeker or employer) can access their notifications
router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:notificationId/read', markAsRead);

module.exports = router;
