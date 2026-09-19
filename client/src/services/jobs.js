/**
 * JobLink — Jobs API Service
 * Central place for all job-related HTTP calls to the backend.
 * Change REACT_APP_API_URL in client/.env to point to a different backend.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────
// TEMPORARY: Mock auth headers
// We attach fake auth headers so protected routes work
// BEFORE Noreen's real JWT auth is merged.
// ⚠️ REMOVE THESE once feature/auth is done.
// ─────────────────────────────────────────
const getMockAuthHeaders = () => {
  const userId = localStorage.getItem('mockUserId') || '650000000000000000000001';
  const userRole = localStorage.getItem('mockUserRole') || 'employer';
  return {
    'x-user-id': userId,
    'x-user-role': userRole,
  };
};

// Request interceptor — attach mock auth headers to all requests
api.interceptors.request.use((config) => {
  Object.assign(config.headers, getMockAuthHeaders());
  return config;
});

// ─────────────────────────────────────────
// Jobs API functions
// ─────────────────────────────────────────
const jobsAPI = {
  /**
   * Get all jobs (with optional filters)
   * @param {Object} filters - { keyword, category, location, type, salary, status }
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    const res = await api.get(`/jobs${query ? `?${query}` : ''}`);
    return res.data;
  },

  /**
   * Get single job by ID
   */
  getById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },

  /**
   * Create a new job posting (employer only)
   */
  create: async (jobData) => {
    const res = await api.post('/jobs', jobData);
    return res.data;
  },

  /**
   * Update a job posting (owner only)
   */
  update: async (id, jobData) => {
    const res = await api.put(`/jobs/${id}`, jobData);
    return res.data;
  },

  /**
   * Delete a job posting (owner only)
   */
  delete: async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  },

  /**
   * Get jobs posted by the current employer
   */
  getMyJobs: async () => {
    const res = await api.get('/jobs/my');
    return res.data;
  },
};

// ─────────────────────────────────────────
// Categories API (helper for dropdowns)
// ─────────────────────────────────────────
export const categoriesAPI = {
  getAll: async () => {
    return [
      { _id: '6aacef3f4e5718d1ddfc58ab', name: 'Software Engineering' },
      { _id: '6aacef3f4e5718d1ddfc58ac', name: 'Design' },
      { _id: '6aacef3f4e5718d1ddfc58ad', name: 'Marketing' },
      { _id: '6aacef3f4e5718d1ddfc58ae', name: 'Data Science' },
      { _id: '6aacef3f4e5718d1ddfc58af', name: 'Finance' },
      { _id: '6aacef3f4e5718d1ddfc58b0', name: 'Customer Support' },
      { _id: '6aacef3f4e5718d1ddfc58b1', name: 'Sales' },
    ];
  },
};

export default jobsAPI;