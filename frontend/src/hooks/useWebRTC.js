import { useRef, useState, useCallback, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:photoframe.metered.live:80',
      username: '7d1c67e92343682de8e1a766',
      credential: 'sUwlHRSttRCM9OOs',
    },
    {
      urls: 'turn:photoframe.metered.live:80?transport=tcp',
      username: '7d1c67e92343682de8e1a766',
      credential: 'sUwlHRSttRCM9OOs',
    },
    {
      urls: 'turn:photoframe.metered.live:443',
      username: '7d1c67e92343682de8e1a766',
      credential: 'sUwlHRSttRCM9OOs',
    },
    {
      urls: 'turns:photoframe.metered.live:443?transport=tcp',
      username: '7d1c67e92343682de8e1a766',
      credential: 'sUwlHRSttRCM9OOs',
    },
  ],
}

export const useWebRTC = (roomId) => {
  const { on, sendOffer, sendAnswer, sendIceCandidate, joinRoom, leaveRoom, toggleAudio, toggleVideo, endCall } = useSocket()
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const [callState, setCallState] = useState('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [peerInfo, setPeerInfo] = useState(null)
  const [peerAudioEnabled, setPeerAudioEnabled] = useState(true)
  const [peerVideoEnabled, setPeerVideoEnabled] = useState(true)
  const [error, setError] = useState(null)

  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    peerConnectionRef.current = pc
    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current))
    pc.ontrack = (event) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0] }
    pc.onicecandidate = (event) => { if (event.candidate) sendIceCandidate({ candidate: event.candidate, roomId, targetSocketId }) }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setCallState('connected')
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) setCallState('ended')
    }
    return pc
  }, [roomId, sendIceCandidate])

  const getLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      return stream
    } catch (err) {
      setError('Camera/mic access denied: ' + err.message)
      throw err
    }
  }, [])

  const initCall = useCallback(async () => {
    try {
      setCallState('waiting')
      await getLocalMedia()
      joinRoom(roomId)
    } catch (err) { setError(err.message); setCallState('idle') }
  }, [roomId, getLocalMedia, joinRoom])

  const handlePeerJoined = useCallback(async ({ peerId, userId, user }) => {
    setPeerInfo({ peerId, userId, ...user })
    setCallState('connecting')
    const pc = createPeerConnection(peerId)
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sendOffer({ roomId, offer, targetSocketId: peerId })
    } catch (err) { setError('Failed to create offer: ' + err.message) }
  }, [createPeerConnection, sendOffer, roomId])

  const handleOffer = useCallback(async ({ offer, fromSocketId, fromUser }) => {
    setPeerInfo({ peerId: fromSocketId, ...fromUser })
    setCallState('connecting')
    const pc = createPeerConnection(fromSocketId)
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sendAnswer({ answer, targetSocketId: fromSocketId, roomId })
    } catch (err) { setError('Failed to handle offer: ' + err.message) }
  }, [createPeerConnection, sendAnswer, roomId])

  const handleAnswer = useCallback(async ({ answer }) => {
    try {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (err) { setError('Failed to handle answer: ' + err.message) }
  }, [])

  const handleIceCandidate = useCallback(async ({ candidate }) => {
    try {
      if (candidate && peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      }
    } catch {}
  }, [])

  const handlePeerLeft = useCallback(() => {
    setCallState('ended')
    setPeerInfo(null)
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    if (!roomId) return
    const cleanups = [
      on('peer_joined', handlePeerJoined),
      on('webrtc_offer', handleOffer),
      on('webrtc_answer', handleAnswer),
      on('webrtc_ice_candidate', handleIceCandidate),
      on('peer_left', handlePeerLeft),
      on('call_ended', handlePeerLeft),
      on('peer_audio_toggle', ({ enabled }) => setPeerAudioEnabled(enabled)),
      on('peer_video_toggle', ({ enabled }) => setPeerVideoEnabled(enabled)),
    ]
    return () => cleanups.forEach(fn => fn && fn())
  }, [roomId, handlePeerJoined, handleOffer, handleAnswer, handleIceCandidate, handlePeerLeft])

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); toggleAudio(roomId, track.enabled) }
  }, [roomId, toggleAudio])

  const toggleCam = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (track) { track.enabled = !track.enabled; setIsVideoOff(!track.enabled); toggleVideo(roomId, track.enabled) }
  }, [roomId, toggleVideo])

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const screenTrack = screenStream.getVideoTracks()[0]
      const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video')
      if (sender) await sender.replaceTrack(screenTrack)
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream
      setIsScreenSharing(true)
      screenTrack.onended = () => stopScreenShare()
    } catch (err) { setError('Screen share failed: ' + err.message) }
  }, [])

  const stopScreenShare = useCallback(async () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0]
    const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video')
    if (sender && videoTrack) await sender.replaceTrack(videoTrack)
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current
    setIsScreenSharing(false)
  }, [])

  const hangUp = useCallback(() => {
    endCall(roomId)
    leaveRoom(roomId)
    peerConnectionRef.current?.close()
    peerConnectionRef.current = null
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setCallState('ended')
    setPeerInfo(null)
  }, [roomId, endCall, leaveRoom])

  return {
    localVideoRef, remoteVideoRef,
    callState, peerInfo, error,
    isMuted, isVideoOff, isScreenSharing,
    peerAudioEnabled, peerVideoEnabled,
    initCall, hangUp, toggleMute, toggleCam,
    startScreenShare, stopScreenShare,
  }
}
