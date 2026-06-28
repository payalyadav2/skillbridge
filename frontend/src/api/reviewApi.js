import api from './axios'

export const reviewApi = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }),
  respondToReview: (id, response) => api.put(`/reviews/${id}/respond`, { response }),
  reportReview: (id, reason) => api.post(`/reviews/${id}/report`, { reason }),
}
