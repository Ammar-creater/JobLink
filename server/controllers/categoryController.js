const Category = require('../models/Category');

// ─────────────────────────────────────────
// Helper — wrap async handlers for error catching
// ─────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─────────────────────────────────────────
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
// ─────────────────────────────────────────
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: categories,
    message: 'Categories fetched successfully',
  });
});

module.exports = { getCategories };