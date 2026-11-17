import api from './axios';

/**
 * Job Management API Service
 */
export const jobApi = {
  /**
   * Fetch all open jobs with optional query filters and pagination
   * @param {Object} params - { keyword, location, jobType, category, experienceLevel, minSalary, maxSalary, page, limit, sort }
   */
  getAllJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  /**
   * Fetch a single job by its ObjectId
   * @param {string} id - Job ObjectId
   */
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Fetch all jobs created by the authenticated employer
   */
  getMyJobs: async () => {
    const response = await api.get('/jobs/mine');
    return response.data;
  },

  /**
   * Create a new job posting (Employer / Admin)
   * @param {Object} payload - Job data
   */
  createJob: async (payload) => {
    const response = await api.post('/jobs', payload);
    return response.data;
  },

  /**
   * Update an existing job posting (Owner / Admin)
   * @param {string} id - Job ObjectId
   * @param {Object} payload - Updated job fields
   */
  updateJob: async (id, payload) => {
    const response = await api.put(`/jobs/${id}`, payload);
    return response.data;
  },

  /**
   * Delete an existing job posting (Owner / Admin)
   * @param {string} id - Job ObjectId
   */
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

export default jobApi;
