import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// ── Auth Slice ──────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch {}
  localStorage.removeItem('accessToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    updateUserField: (state, action) => {
      if (state.user) Object.assign(state.user, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
        localStorage.removeItem('accessToken');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      });
  },
});

// ── Notification Slice ──────────────────────────────────────
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    setNotifications: (state, action) => { state.items = action.payload; },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
    markRead: (state, action) => {
      const n = state.items.find(i => i._id === action.payload);
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllRead: (state) => {
      state.items.forEach(n => { n.isRead = true; });
      state.unreadCount = 0;
    },
  },
});

// ── Chat Slice ──────────────────────────────────────────────
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConversation: null,
    messages: {},
    typingUsers: {},
  },
  reducers: {
    setConversations: (state, action) => { state.conversations = action.payload; },
    setActiveConversation: (state, action) => { state.activeConversation = action.payload; },
    setMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) state.messages[conversationId] = [];
      const exists = state.messages[conversationId].find(m => m._id === message._id);
      if (!exists) state.messages[conversationId].push(message);
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv) {
        conv.lastMessageText = message.content?.substring(0, 80) || '📎 File';
        conv.lastMessageAt = message.createdAt;
      }
    },
    deleteMessageLocally: (state, action) => {
      const { conversationId, messageId } = action.payload;
      if (state.messages[conversationId]) {
        const msg = state.messages[conversationId].find(m => m._id === messageId);
        if (msg) { msg.isDeleted = true; msg.content = 'This message was deleted'; }
      }
    },
    setTyping: (state, action) => {
      const { conversationId, userId, userName, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) state.typingUsers[conversationId] = {};
      if (isTyping) state.typingUsers[conversationId][userId] = userName;
      else delete state.typingUsers[conversationId][userId];
    },
    updateConversationUnread: (state, action) => {
      const { conversationId, count } = action.payload;
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv) conv.unreadCount = count;
    },
  },
});

// ── UI Slice ────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar: (state, action) => { state.sidebarOpen = action.payload; },
  },
});

// ── Store ───────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    notifications: notificationSlice.reducer,
    chat: chatSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const { setUser, clearAuth, updateUserField } = authSlice.actions;
export const { addNotification, setNotifications, setUnreadCount, markRead, markAllRead } = notificationSlice.actions;
export const { setConversations, setActiveConversation, setMessages, addMessage, deleteMessageLocally, setTyping, updateConversationUnread } = chatSlice.actions;
export const { toggleSidebar, setSidebar } = uiSlice.actions;

export default store;