const User = require("../models/User");

// GET /api/users/me
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PUT /api/users/me
async function updateProfile(req, res) {
  try {
    const { name, phone, bio, skills, education } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) {
      // Accept either an array or a comma-separated string
      updates.skills = Array.isArray(skills)
        ? skills
        : String(skills).split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (education !== undefined) updates.education = education;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/users/me/resume  (multipart/form-data, field name: "resume")
async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    const resumeUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({ message: "Resume uploaded successfully", resumeUrl, user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/users/me/photo  (multipart/form-data, field name: "photo")
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo file uploaded" });
    }

    const profilePhotoUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhotoUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({ message: "Photo uploaded successfully", profilePhotoUrl, user });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { getProfile, updateProfile, uploadResume, uploadPhoto };