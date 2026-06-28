import api from './axios'

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getOrCreateConversation: (userId) => api.get(`/chat/conversations/${userId}`),
  getMessages: (conversationId, params) => api.get(`/chat/messages/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/chat/messages', data),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  uploadFile: (formData) => api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
