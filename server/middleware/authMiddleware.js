const jwt = require("jsonwebtoken");
const User = require("../models/User");

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Identity only — role will be verified fresh from DB in authorize()
    req.user = { _id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
  }
}

function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Not authorized" });
      }

      // ✅ Fetch the CURRENT role from MongoDB (source of truth)
      const user = await User.findById(req.user._id).select("role");
      if (!user) {
        return res.status(401).json({ success: false, message: "User no longer exists" });
      }

      // ✅ Check against the fresh role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: insufficient permissions",
        });
      }

      // Update req.user with the fresh role for downstream use
      req.user.role = user.role;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: "Authorization error" });
    }
  };
}

module.exports = { protect, authorize };