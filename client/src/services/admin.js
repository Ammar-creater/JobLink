/**
 * JobLink — Admin API Service
 * Handles admin-only endpoints: users, jobs, reports, job status updates.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const adminAPI = {
  /**
   * Get platform statistics
   * GET /api/admin/reports
   */
  getReports: async () => {
    const res = await api.get('/admin/reports');
    return res.data;
  },

  /**
   * Get all users (with filters + pagination)
   * GET /api/admin/users
   */
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString();
    const res = await api.get(`/admin/users${query ? `?${query}` : ''}`);
    return res.data;
  },

  /**
   * Get all jobs (any status)
   * GET /api/admin/jobs
   */
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    const query = params.toString();
    const res = await api.get(`/admin/jobs${query ? `?${query}` : ''}`);
    return res.data;
  },

  /**
   * Update job status (approve/reject/close)
   * PUT /api/admin/jobs/:id/status
   */
  updateJobStatus: async (id, status) => {
    const res = await api.put(`/admin/jobs/${id}/status`, { status });
    return res.data;
  },
};

export default adminAPI;