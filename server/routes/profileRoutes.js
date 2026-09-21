const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getProfile,
  updateProfile,
  uploadResume,
  uploadPhoto,
} = require("../controllers/profileController");

// All profile routes require a valid JWT (user must be logged in)
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.post("/me/resume", protect, upload.single("resume"), uploadResume);
router.post("/me/photo", protect, upload.single("photo"), uploadPhoto);

module.exports = router;