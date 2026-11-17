import api from './axios';

/**
 * Job Application API Service
 */
export const applicationApi = {
  /**
   * Apply to an open job posting
   * @param {Object} payload - { jobId, coverLetter, resumeUrl }
   */
  applyToJob: async (payload) => {
    const response = await api.post('/applications', payload);
    return response.data;
  },

  /**
   * Get all applications submitted by the logged-in jobseeker
   */
  getMyApplications: async () => {
    const response = await api.get('/applications/mine');
    return response.data;
  },

  /**
   * Get all candidate applications for a specific job (Employer / Admin)
   * @param {string} jobId - Job ObjectId
   */
  getApplicationsForJob: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },

  /**
   * Update candidate application review status
   * @param {string} id - Application ObjectId
   * @param {string} status - New status ('pending'|'reviewed'|'shortlisted'|'rejected'|'hired')
   */
  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  },

  /**
   * Withdraw an application (Jobseeker only)
   * @param {string} id - Application ObjectId
   */
  withdrawApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

export default applicationApi;
