import api from './axios'

export const aiApi = {
  getRecommendations: () => api.get('/ai/recommendations'),
  analyzeGap: (targetRole) => api.post('/ai/gap-analysis', { targetRole }),
  generateRoadmap: (data) => api.post('/ai/roadmap', data),
  chat: (messages) => api.post('/ai/chat', { messages }),
  getAIMatches: () => api.get('/ai/matches'),
  generateVerificationQuestions: (data) => api.post('/ai/verify-questions', data),
}
