const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Never let clients self-assign sensitive roles (e.g. admin)
    const allowedRoles = ["jobseeker", "employer"];
    const finalRole = allowedRoles.includes(role) ? role : "jobseeker";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      message: "User registered successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      message: "Login successful",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logout successful. Please remove the token on the client.",
  });
}

module.exports = { register, login, logout };