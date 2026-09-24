const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      data: {
        count: notifications.length,
        notifications
      },
      message: 'Notifications retrieved successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:notificationId/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid notification id'
      });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Notification not found'
      });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to access this notification'
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

/**
 * @desc    Mark all unread notifications as read for logged-in user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: 'All notifications marked as read'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};
