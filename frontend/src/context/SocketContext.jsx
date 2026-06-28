import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import useChatStore from '../store/chatStore'
import useNotificationStore from '../store/notificationStore'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const { user, accessToken } = useSelector(state => state.auth)
  const isAuthenticated = !!accessToken
  const { addMessage, setTyping, deleteMessage } = useChatStore()
  const { addNotification, fetchUnreadCount } = useNotificationStore()
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) return

    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL || window.location.origin,
      { auth: { token }, transports: ['websocket', 'polling'], reconnection: true, reconnectionAttempts: 5 }
    )
    const socket = socketRef.current

    socket.on('connect', () => { setIsConnected(true); socket.emit('join_conversations') })
    socket.on('disconnect', () => setIsConnected(false))
    socket.on('connect_error', (err) => console.warn('Socket error:', err.message))
    socket.on('user_online', ({ userId }) => setOnlineUsers(prev => [...new Set([...prev, userId])]))
    socket.on('user_offline', ({ userId }) => setOnlineUsers(prev => prev.filter(id => id !== userId)))
    socket.on('new_message', ({ message }) => addMessage(message))
    socket.on('message_deleted', ({ messageId, conversationId }) => deleteMessage(messageId, conversationId))
    socket.on('message_notification', ({ senderName, preview }) => {
      toast(`${senderName}: ${preview}`, { icon: '💬', duration: 4000 })
    })
    socket.on('user_typing', ({ userId: uid, userName, conversationId }) => setTyping(conversationId, uid, userName, true))
    socket.on('user_stop_typing', ({ userId: uid, conversationId }) => setTyping(conversationId, uid, null, false))
    socket.on('notification', (notif) => {
      addNotification(notif)
      fetchUnreadCount()
      toast(notif.body || notif.title, { icon: '🔔' })
    })

    return () => { socket.disconnect(); socketRef.current = null; setIsConnected(false) }
  }, [isAuthenticated, user?._id])

  const s = () => socketRef.current
  const joinRoom = (roomId) => s()?.emit('join_room', { roomId })
  const leaveRoom = (roomId) => s()?.emit('leave_room', { roomId })
  const joinConversation = (convId) => s()?.emit('join_conversation', convId)
  const sendSocketMessage = (data) => s()?.emit('send_message', data)
  const emitTypingStart = (convId) => s()?.emit('typing_start', { conversationId: convId })
  const emitTypingStop = (convId) => s()?.emit('typing_stop', { conversationId: convId })
  const markConversationRead = (convId) => s()?.emit('mark_read', { conversationId: convId })
  const sendOffer = (data) => s()?.emit('webrtc_offer', data)
  const sendAnswer = (data) => s()?.emit('webrtc_answer', data)
  const sendIceCandidate = (data) => s()?.emit('webrtc_ice_candidate', data)
  const toggleAudio = (roomId, enabled) => s()?.emit('toggle_audio', { roomId, enabled })
  const toggleVideo = (roomId, enabled) => s()?.emit('toggle_video', { roomId, enabled })
  const endCall = (roomId) => s()?.emit('end_call', { roomId })
  const on = (event, handler) => { s()?.on(event, handler); return () => s()?.off(event, handler) }
  const off = (event, handler) => s()?.off(event, handler)

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, isConnected, onlineUsers,
      isUserOnline: (id) => onlineUsers.includes(id),
      joinRoom, leaveRoom, joinConversation, sendSocketMessage,
      emitTypingStart, emitTypingStop, markConversationRead,
      sendOffer, sendAnswer, sendIceCandidate,
      toggleAudio, toggleVideo, endCall, on, off,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export default SocketContext