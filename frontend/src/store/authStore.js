import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/authApi'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // ── Register ──────────────────────────────────────────────────────────
      register: async (formData) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.register(formData)
          localStorage.setItem('accessToken', data.data.accessToken)
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
          })
          toast.success(data.message || 'Account created! Check your email.')
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed'
          toast.error(msg)
          return { success: false, error: msg }
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Login ──────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(credentials)
          localStorage.setItem('accessToken', data.data.accessToken)
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken)
          }
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
          })
          toast.success('Welcome back!')
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.message || 'Invalid credentials'
          toast.error(msg)
          return { success: false, error: msg }
        } finally {
          set({ isLoading: false })
        }
      },

      // ── Logout ────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await authApi.logout()
        } catch {}
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        toast.success('Logged out')
      },

      // ── Fetch / refresh current user ──────────────────────────────────────
      fetchMe: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) return set({ isAuthenticated: false })
        try {
          const { data } = await authApi.getMe()
          set({ user: data.data.user, isAuthenticated: true })
        } catch {
          localStorage.removeItem('accessToken')
          set({ user: null, isAuthenticated: false })
        }
      },

      // ── Update user in store ──────────────────────────────────────────────
      updateUser: (updates) => {
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null
        }))
      },

      // ── Verify email result ───────────────────────────────────────────────
      setVerified: (user, token) => {
        localStorage.setItem('accessToken', token)
        set({ user, accessToken: token, isAuthenticated: true })
      },
    }),
    {
      name: 'skillbridge-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
