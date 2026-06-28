import { create } from 'zustand'
import { chatApi } from '../api/chatApi'
import toast from 'react-hot-toast'

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  unreadTotal: 0,

  fetchConversations: async () => {
    set({ isLoadingConversations: true })
    try {
      const { data } = await chatApi.getConversations()
      const convs = data.data.conversations
      const unreadTotal = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      set({ conversations: convs, unreadTotal })
    } catch (err) {
      toast.error('Failed to load conversations')
    } finally {
      set({ isLoadingConversations: false })
    }
  },

  setActiveConversation: (conv) => set({ activeConversation: conv }),

  fetchMessages: async (conversationId, page = 1) => {
    set({ isLoadingMessages: page === 1 })
    try {
      const { data } = await chatApi.getMessages(conversationId, { page, limit: 30 })
      const newMessages = data.data
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: page === 1
            ? newMessages
            : [...newMessages, ...(state.messages[conversationId] || [])],
        }
      }))
      return data.pagination
    } catch (err) {
      toast.error('Failed to load messages')
    } finally {
      set({ isLoadingMessages: false })
    }
  },

  addMessage: (message) => {
    const convId = message.conversation || get().activeConversation?._id
    set(state => ({
      messages: {
        ...state.messages,
        [convId]: [...(state.messages[convId] || []), message],
      },
      conversations: state.conversations.map(c =>
        c._id === convId
          ? { ...c, lastMessageText: message.content || 'Attachment', lastMessageAt: new Date() }
          : c
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    }))
  },

  setTyping: (conversationId, userId, userName, isTyping) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: isTyping
          ? { ...state.typingUsers[conversationId], [userId]: userName }
          : Object.fromEntries(
              Object.entries(state.typingUsers[conversationId] || {})
                .filter(([id]) => id !== userId)
            )
      }
    }))
  },

  deleteMessage: (messageId, conversationId) => {
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(m =>
          m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
        )
      }
    }))
  },

  clearMessages: (conversationId) => {
    set(state => ({
      messages: { ...state.messages, [conversationId]: [] }
    }))
  },
}))

export default useChatStore
