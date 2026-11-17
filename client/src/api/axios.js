// src/api/axios.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    try {
      const storedAuth = localStorage.getItem('jobconnect_auth');
      if (storedAuth) {
        const { token } = JSON.parse(storedAuth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // Corrupt localStorage data – proceed without auth header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global handling for 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      // Do NOT logout/redirect for login or registration attempts – UI needs to show the error message
      const isAuthEndpoint = /\/auth\/(login|register)/i.test(requestUrl);
      if (!isAuthEndpoint) {
        localStorage.removeItem('jobconnect_auth');
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
