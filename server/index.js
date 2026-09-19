/**
 * JobLink Backend — Entry Point
 * Reads all config from environment variables (never hardcode secrets).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

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
app.use('/api/auth', authRoutes);

// ── Centralized Error Handler (placeholder) ─
// Full version will be added by Noreen in feature/auth
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // NEVER expose stack traces in the response
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