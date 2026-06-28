import api from './axios'

export const sessionApi = {
  getSessions: (params) => api.get('/sessions', { params }),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  createSession: (data) => api.post('/sessions', data),
  startSession: (id) => api.put(`/sessions/${id}/start`),
  endSession: (id, recap) => api.put(`/sessions/${id}/end`, { recap }),
  cancelSession: (id, reason) => api.put(`/sessions/${id}/cancel`, { reason }),
  updateNotes: (id, notes) => api.put(`/sessions/${id}/notes`, { notes }),
  getRoomInfo: (roomId) => api.get(`/sessions/room/${roomId}`),
}
