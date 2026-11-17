import api from './axios';

/**
 * Admin API Service
 */
export const adminApi = {
  /**
   * Get overall system metrics
   */
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  /**
   * Get paginated user list with filters
   * @param {Object} params - { keyword, role, page, limit }
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Update a user's role
   * @param {string} id - User ObjectId
   * @param {string} role - 'jobseeker' | 'employer' | 'admin'
   */
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Delete a user and cascade delete their postings and applications
   * @param {string} id - User ObjectId
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Get paginated jobs list (all statuses)
   * @param {Object} params - { keyword, status, page, limit }
   */
  getJobs: async (params = {}) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },

  /**
   * Update job status (open / closed)
   * @param {string} id - Job ObjectId
   * @param {string} status - 'open' | 'closed'
   */
  updateJobStatus: async (id, status) => {
    const response = await api.patch(`/admin/jobs/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete a job posting and cascade delete associated candidate applications
   * @param {string} id - Job ObjectId
   */
  deleteJob: async (id) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },
};

export default adminApi;
