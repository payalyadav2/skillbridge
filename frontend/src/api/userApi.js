import api from './axios'

export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateLocation: (data) => api.put('/users/location', data),
  searchUsers: (params) => api.get('/users/search', { params }),
  getNearbyUsers: (params) => api.get('/users/nearby', { params }),
  getMatches: (params) => api.get('/users/matches', { params }),
  getDashboard: () => api.get('/users/dashboard'),
  addSkillOffered: (data) => api.post('/users/skills/offered', data),
  removeSkillOffered: (skillId) => api.delete(`/users/skills/offered/${skillId}`),
  addSkillWanted: (data) => api.post('/users/skills/wanted', data),
  removeSkillWanted: (skillId) => api.delete(`/users/skills/wanted/${skillId}`),
  updateLearningProgress: (data) => api.put('/users/learning-progress', data),
}
