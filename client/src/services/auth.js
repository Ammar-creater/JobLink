/**
 * JobLink — Auth API Service
 * Handles register, login, logout, and current user state.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authAPI = {
  /**
   * Register a new user
   * @param {Object} data - { name, email, password, role }
   */
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /**
   * Login user
   * @param {Object} data - { email, password }
   */
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  /**
   * Logout — clears token on client (backend logout is stateless)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage (synchronous)
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Save token + user to localStorage after login
   */
  saveSession: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default authAPI;