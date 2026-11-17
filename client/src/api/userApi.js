import api from './axios';

/**
 * User API Service
 */
export const userApi = {
  /**
   * Update logged-in user's profile
   * @param {Object} payload - { name, profile: { headline, bio, location, skills, resumeUrl, ... } }
   */
  updateMyProfile: async (payload) => {
    const response = await api.put('/users/profile', payload);
    return response.data;
  },
};

export default userApi;
