/**
 * JobLink — Applications API Service
 * Handles jobseeker apply + my-applications + employer view/update.
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

const applicationsAPI = {
  /**
   * Submit an application (jobseeker only)
   * @param {Object} data - { jobId, coverLetter, resumeUrl }
   */
  create: async (data) => {
    const res = await api.post('/applications', data);
    return res.data;
  },

  /**
   * Get current user's applications (jobseeker only)
   */
  getMy: async () => {
    const res = await api.get('/applications/my');
    return res.data;
  },

  /**
   * Get single application by ID
   */
  getById: async (id) => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  /**
   * Employer — view applicants for one of their jobs
   */
  getJobApplicants: async (jobId) => {
    const res = await api.get(`/employer/jobs/${jobId}/applicants`);
    return res.data;
  },

  /**
   * Employer — update application status
   * @param {String} applicationId
   * @param {String} status - 'pending' | 'accepted' | 'rejected'
   */
  updateStatus: async (applicationId, status) => {
    const res = await api.put(`/employer/applications/${applicationId}/status`, {
      status,
    });
    return res.data;
  },
};

export default applicationsAPI;