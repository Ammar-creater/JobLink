/**
 * JobLink Backend — Entry Point
 * Reads all config from environment variables (never hardcode secrets).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const jobRoutes = require('./routes/jobs');

const app = express();

// ── Middleware ─────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
app.use('/api/jobs', jobRoutes);

// ── 404 Handler ────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Centralized Error Handler ──────────────
// Reads statusCode from res.statusCode if set, else err.status, else 500
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const statusCode =
    err.status ||
    err.statusCode ||
    (res.statusCode && res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Never expose stack traces in response
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