/**
 * JobLink Backend — Entry Point
 * Reads all config from environment variables (never hardcode secrets).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Fail fast if critical secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing in .env — server will not start');
  process.exit(1);
}

// ── Route mounts — all modules ─────────────
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const jobRoutes = require('./routes/jobs');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ── Middleware ─────────────────────────────
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'JobLink API is running',
    env: process.env.NODE_ENV || 'development',
  });
});

// ── Routes ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/employer', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded files (resumes, photos) publicly
app.use('/uploads', express.static('uploads'));

// ── 404 Handler (must be after all routes, before error handler) ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Centralized Error Handler ───────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Connect to MongoDB ─────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env — server will not start');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });