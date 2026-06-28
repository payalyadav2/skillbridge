import api from './axios'

export const skillApi = {
  getSkills: (params) => api.get('/skills', { params }),
  getSkillById: (id) => api.get(`/skills/${id}`),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
  getMySkills: () => api.get('/skills/mine'),
  getCategories: () => api.get('/skills/categories'),
}
