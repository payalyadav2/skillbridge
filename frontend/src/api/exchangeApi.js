import api from './axios'

export const exchangeApi = {
  getMyExchanges: (params) => api.get('/exchanges', { params }),
  getExchangeById: (id) => api.get(`/exchanges/${id}`),
  sendRequest: (data) => api.post('/exchanges', data),
  acceptRequest: (id) => api.put(`/exchanges/${id}/accept`),
  rejectRequest: (id, reason) => api.put(`/exchanges/${id}/reject`, { reason }),
  cancelRequest: (id) => api.put(`/exchanges/${id}/cancel`),
  completeExchange: (id) => api.put(`/exchanges/${id}/complete`),
}
