import api from './axios';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} payload - { name, email, password, role }
   */
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Authenticate user with credentials
   * @param {Object} payload - { email, password }
   */
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Get current authenticated user session
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authApi;
