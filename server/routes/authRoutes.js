const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Test route — only accessible with a valid JWT token
router.get("/test-protected", protect, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

module.exports = router;