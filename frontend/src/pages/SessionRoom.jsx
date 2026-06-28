import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'turn:photoframe.metered.live:80', username: '7d1c67e92343682de8e1a766', credential: 'sUwlHRSttRCM9OOs' },
    { urls: 'turn:photoframe.metered.live:443', username: '7d1c67e92343682de8e1a766', credential: 'sUwlHRSttRCM9OOs' },
    { urls: 'turns:photoframe.metered.live:443?transport=tcp', username: '7d1c67e92343682de8e1a766', credential: 'sUwlHRSttRCM9OOs' },
  ],
};

const SessionRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { socket, joinRoom, leaveRoom, sendOffer, sendAnswer, sendIceCandidate, toggleAudio, toggleVideo, endCall } = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callState, setCallState] = useState('connecting');
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const hideControlsTimeout = useRef(null);

  useEffect(() => {
    api.get('/sessions/room/' + roomId)
      .then(({ data }) => setSessionInfo(data.data))
      .catch(() => { toast.error('Session not found'); navigate('/sessions'); })
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (!socket || !user) return;
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        joinRoom(roomId);
      } catch (err) {
        toast.error('Could not access camera/microphone');
      }
    };
    setupMedia();

    socket.on('peer_joined', async ({ peerId, userId: peerId_userId, user: peerUser }) => {
      if (peerId_userId === user._id) return;
      setRemoteUser({ id: peerId_userId, name: peerUser?.name, socketId: peerId });
      setRemotePeerId(peerId);
      await createOffer(peerId);
    });
    socket.on('webrtc_offer', async ({ offer, fromSocketId, fromUser }) => {
      setRemotePeerId(fromSocketId);
      if (fromUser) setRemoteUser({ name: fromUser.name });
      await handleOffer(offer, fromSocketId);
    });
    socket.on('webrtc_answer', async ({ answer }) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setCallState('connected');
      startTimer();
    });
    socket.on('webrtc_ice_candidate', async ({ candidate }) => {
      try { await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    });
    socket.on('peer_audio_toggled', ({ enabled }) => setRemoteMuted(!enabled));
    socket.on('call_ended', () => { setCallState('ended'); cleanup(); });
    socket.on('user_left', () => { setCallState('ended'); toast('Other participant left'); });

    return () => {
      cleanup();
      ['peer_joined','webrtc_offer','webrtc_answer','webrtc_ice_candidate','peer_audio_toggled','call_ended','user_left'].forEach(e => socket.off(e));
    };
  }, [socket, user, roomId]);

  // Auto-hide controls
  useEffect(() => {
    const show = () => {
      setControlsVisible(true);
      clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => setControlsVisible(false), 3500);
    };
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    show();
    return () => { window.removeEventListener('mousemove', show); window.removeEventListener('touchstart', show); clearTimeout(hideControlsTimeout.current); };
  }, []);

  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setCallState('connected');
      startTimer();
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) sendIceCandidate({ candidate: event.candidate, roomId, targetSocketId });
    };
    pc.onconnectionstatechange = () => {
      if (['disconnected','failed','closed'].includes(pc.connectionState)) setCallState('ended');
    };
    peerConnectionRef.current = pc;
    return pc;
  };

  const createOffer = async (targetSocketId) => {
    const pc = createPeerConnection(targetSocketId);
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);
    sendOffer({ roomId, offer, targetSocketId });
  };

  const handleOffer = async (offer, from) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendAnswer({ answer, targetSocketId: from, roomId });
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
  };

  const cleanup = () => {
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  };

  const handleToggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsAudioOn(track.enabled); toggleAudio(roomId, track.enabled); }
  };

  const handleToggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsVideoOn(track.enabled); toggleVideo(roomId, track.enabled); }
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(screenTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = () => handleScreenShare();
        setIsScreenSharing(true);
      } else {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setIsScreenSharing(false);
      }
    } catch { toast.error('Screen share failed'); }
  };

  const handleEndCall = async () => {
    endCall(roomId);
    leaveRoom(roomId);
    cleanup();
    setCallState('ended');
    // Session ko completed mark karo
    if (sessionInfo?.session?.id) {
      try {
        await api.put('/sessions/' + sessionInfo.session.id + '/end', {});
      } catch (err) {
        console.warn('Session end update failed:', err.message);
      }
    }
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          .sr-loading { min-height: 100vh; background: #020010; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; }
          .sr-spinner { width: 48px; height: 48px; border: 2px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .sr-load-text { color: rgba(255,255,255,0.4); font-size: 14px; text-align: center; }
          .sr-load-title { color: white; font-size: 16px; font-weight: 600; margin-bottom: 6px; text-align: center; }
        `}</style>
        <div className="sr-loading">
          <div>
            <div className="sr-spinner" />
            <div className="sr-load-title">Preparing your room</div>
            <div className="sr-load-text">Setting up secure connection...</div>
          </div>
        </div>
      </>
    );
  }

  if (callState === 'ended') {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .sr-ended { min-height: 100vh; background: #020010; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; position: relative; overflow: hidden; }
          .sr-ended-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; }
          .sr-ended-orb-1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -60%); }
          .sr-ended-orb-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%); bottom: 0; right: 0; }
          .sr-ended-card { position: relative; z-index: 1; text-align: center; padding: 3rem 2rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; max-width: 380px; width: 100%; backdrop-filter: blur(20px); animation: fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }
          .sr-ended-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
          .sr-ended-title { font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 8px; }
          .sr-duration { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
          .sr-duration-label { font-size: 12px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2rem; }
          .sr-ended-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; padding: 12px 24px; font-size: 14px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; box-shadow: 0 0 24px rgba(99,102,241,0.3); }
          .sr-ended-btn:hover { transform: translateY(-1px); box-shadow: 0 0 40px rgba(99,102,241,0.45); }
        `}</style>
        <div className="sr-ended">
          <div className="sr-ended-orb sr-ended-orb-1" />
          <div className="sr-ended-orb sr-ended-orb-2" />
          <div className="sr-ended-card">
            <div className="sr-ended-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/><path d="M1 1l22 22"/></svg>
            </div>
            <div className="sr-ended-title">Call ended</div>
            <div className="sr-duration">{formatTime(elapsedTime)}</div>
            <div className="sr-duration-label">Session duration</div>
            <button className="sr-ended-btn" onClick={() => navigate('/sessions')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
              Back to Sessions
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sr-root {
          width: 100vw; height: 100vh; max-height: 100dvh;
          background: #0a0a12;
          display: flex; flex-direction: column;
          font-family: 'Space Grotesk', sans-serif;
          position: relative; overflow: hidden;
        }

        /* Header */
        .sr-header {
          position: absolute; top: 0; left: 0; right: 0; z-index: 20;
          padding: 1rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
          transition: opacity 0.3s;
        }
        .sr-header.hidden { opacity: 0; pointer-events: none; }
        .sr-session-name { font-size: 14px; font-weight: 600; color: white; letter-spacing: -0.01em; }
        .sr-live-badge {
          display: flex; align-items: center; gap: 6px; margin-top: 3px;
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
        }
        .sr-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
          animation: livePulse 1.5s ease infinite;
        }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .sr-live-timer { color: #22c55e; }
        .sr-connecting-badge { font-size: 12px; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 6px; }
        .sr-remote-name { font-size: 13px; color: rgba(255,255,255,0.5); }

        /* Room secure badge */
        .sr-secure {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; padding: 5px 12px;
          font-size: 11px; color: rgba(255,255,255,0.4);
          font-family: 'JetBrains Mono', monospace;
        }
        .sr-secure-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }

        /* Videos */
        .sr-video-area { flex: 1; position: relative; }

        .sr-remote-wrap {
          width: 100%; height: 100%;
          background: #111118;
          position: relative; overflow: hidden;
        }
        .sr-remote-video { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Waiting overlay */
        .sr-waiting {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #111118;
        }
        .sr-waiting-avatar {
          width: 96px; height: 96px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 700; color: white;
          margin-bottom: 1.25rem;
          box-shadow: 0 0 0 0 rgba(99,102,241,0.4);
          animation: waitingPulse 2s ease infinite;
        }
        @keyframes waitingPulse {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          70% { box-shadow: 0 0 0 20px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        .sr-waiting-name { font-size: 18px; font-weight: 600; color: white; margin-bottom: 6px; }
        .sr-waiting-sub { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 1rem; }
        .sr-dots { display: flex; gap: 6px; }
        .sr-dot { width: 8px; height: 8px; background: rgba(255,255,255,0.3); border-radius: 50%; animation: dotBounce 1.2s ease infinite; }
        .sr-dot:nth-child(2) { animation-delay: 0.2s; }
        .sr-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0.8); opacity: 0.4; } 40% { transform: scale(1.1); opacity: 1; } }

        /* Remote muted indicator */
        .sr-remote-muted {
          position: absolute; top: 1rem; left: 1rem; z-index: 5;
          background: rgba(239,68,68,0.9); border-radius: 50px;
          padding: 5px 10px; display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: white; font-weight: 500;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Local PIP */
        .sr-local-wrap {
          position: absolute; bottom: 100px; right: 20px; z-index: 10;
          width: 160px; height: 110px;
          border-radius: 14px; overflow: hidden;
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          cursor: pointer; transition: transform 0.2s;
          background: #1a1a2e;
        }
        .sr-local-wrap:hover { transform: scale(1.03); }
        @media (min-width: 768px) { .sr-local-wrap { width: 200px; height: 138px; } }
        .sr-local-video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .sr-local-off {
          position: absolute; inset: 0;
          background: #1a1a2e;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-local-off-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; color: white;
        }
        .sr-local-label {
          position: absolute; bottom: 6px; left: 8px;
          font-size: 11px; color: rgba(255,255,255,0.7);
          background: rgba(0,0,0,0.5); border-radius: 4px; padding: 2px 6px;
          font-family: 'JetBrains Mono', monospace;
        }
        .sr-screenshare-badge {
          position: absolute; top: 6px; left: 8px;
          font-size: 10px; color: white; background: rgba(99,102,241,0.8);
          border-radius: 4px; padding: 2px 6px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Controls */
        .sr-controls {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
          padding: 1.25rem 1rem 1.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
          display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: opacity 0.3s;
        }
        .sr-controls.hidden { opacity: 0; pointer-events: none; }

        .sr-ctrl-btn {
          width: 52px; height: 52px; border-radius: 50%; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.15s, background 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .sr-ctrl-btn:hover { transform: scale(1.08); }
        .sr-ctrl-btn:active { transform: scale(0.95); }

        .sr-ctrl-btn.normal {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .sr-ctrl-btn.normal:hover { background: rgba(255,255,255,0.18); }
        .sr-ctrl-btn.off {
          background: rgba(239,68,68,0.85);
          border: 1px solid rgba(239,68,68,0.5);
          box-shadow: 0 0 20px rgba(239,68,68,0.3);
        }
        .sr-ctrl-btn.active {
          background: rgba(99,102,241,0.85);
          border: 1px solid rgba(99,102,241,0.5);
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
        .sr-ctrl-btn.end {
          width: 60px; height: 60px;
          background: #ef4444;
          border: none;
          box-shadow: 0 0 30px rgba(239,68,68,0.4);
        }
        .sr-ctrl-btn.end:hover { background: #dc2626; box-shadow: 0 0 40px rgba(239,68,68,0.6); }

        .sr-ctrl-icon { width: 22px; height: 22px; stroke: white; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .sr-ctrl-end-icon { width: 24px; height: 24px; stroke: white; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        .sr-ctrl-label {
          position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
          font-size: 10px; color: rgba(255,255,255,0.4); white-space: nowrap;
          font-family: 'JetBrains Mono', monospace;
        }

        .sr-grid-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(99,102,241,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="sr-root">
        <div className="sr-grid-overlay" />

        {/* Header */}
        <div className={`sr-header ${controlsVisible ? '' : 'hidden'}`}>
          <div>
            <div className="sr-session-name">
              {sessionInfo?.session?.title || 'Skill Exchange Session'}
            </div>
            <div className="sr-live-badge">
              {callState === 'connected' ? (
                <>
                  <div className="sr-live-dot" />
                  <span className="sr-live-timer">LIVE · {formatTime(elapsedTime)}</span>
                </>
              ) : (
                <span className="sr-connecting-badge">
                  <div className="sr-dots" style={{ display: 'inline-flex', gap: 4 }}>
                    <div className="sr-dot" style={{ width: 5, height: 5 }} />
                    <div className="sr-dot" style={{ width: 5, height: 5 }} />
                    <div className="sr-dot" style={{ width: 5, height: 5 }} />
                  </div>
                  Waiting for participant
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {remoteUser && <span className="sr-remote-name">with {remoteUser.name}</span>}
            <div className="sr-secure">
              <div className="sr-secure-dot" />
              Encrypted
            </div>
          </div>
        </div>

        {/* Video area */}
        <div className="sr-video-area">
          <div className="sr-remote-wrap">
            <video ref={remoteVideoRef} autoPlay playsInline className="sr-remote-video" />

            {remoteMuted && (
              <div className="sr-remote-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                Muted
              </div>
            )}

            {callState === 'connecting' && (
              <div className="sr-waiting">
                <div className="sr-waiting-avatar">
                  {remoteUser?.name?.[0] || '?'}
                </div>
                <div className="sr-waiting-name">{remoteUser?.name || 'Waiting...'}</div>
                <div className="sr-waiting-sub">Connecting to your session partner</div>
                <div className="sr-dots">
                  <div className="sr-dot" />
                  <div className="sr-dot" />
                  <div className="sr-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Local PIP */}
          <div className="sr-local-wrap">
            <video ref={localVideoRef} autoPlay playsInline muted className="sr-local-video" />
            {!isVideoOn && (
              <div className="sr-local-off">
                <div className="sr-local-off-avatar">{user?.name?.[0] || 'Y'}</div>
              </div>
            )}
            {isScreenSharing && <div className="sr-screenshare-badge">Screen</div>}
            <div className="sr-local-label">
              You {!isAudioOn ? '🔇' : ''}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`sr-controls ${controlsVisible ? '' : 'hidden'}`}>
          {/* Mic */}
          <div style={{ position: 'relative', paddingBottom: 24 }}>
            <button className={`sr-ctrl-btn ${isAudioOn ? 'normal' : 'off'}`} onClick={handleToggleAudio} aria-label={isAudioOn ? 'Mute' : 'Unmute'}>
              {isAudioOn
                ? <svg className="sr-ctrl-icon" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                : <svg className="sr-ctrl-icon" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              }
            </button>
            <span className="sr-ctrl-label">{isAudioOn ? 'Mute' : 'Unmute'}</span>
          </div>

          {/* Video */}
          <div style={{ position: 'relative', paddingBottom: 24 }}>
            <button className={`sr-ctrl-btn ${isVideoOn ? 'normal' : 'off'}`} onClick={handleToggleVideo} aria-label={isVideoOn ? 'Stop video' : 'Start video'}>
              {isVideoOn
                ? <svg className="sr-ctrl-icon" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                : <svg className="sr-ctrl-icon" viewBox="0 0 24 24"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              }
            </button>
            <span className="sr-ctrl-label">{isVideoOn ? 'Stop video' : 'Start video'}</span>
          </div>

          {/* Screen share */}
          <div style={{ position: 'relative', paddingBottom: 24 }}>
            <button className={`sr-ctrl-btn ${isScreenSharing ? 'active' : 'normal'}`} onClick={handleScreenShare} aria-label="Share screen">
              {isScreenSharing
                ? <svg className="sr-ctrl-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg className="sr-ctrl-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              }
            </button>
            <span className="sr-ctrl-label">{isScreenSharing ? 'Stop share' : 'Share screen'}</span>
          </div>

          {/* End call */}
          <div style={{ position: 'relative', paddingBottom: 24 }}>
            <button className="sr-ctrl-btn end" onClick={handleEndCall} aria-label="End call">
              <svg className="sr-ctrl-end-icon" viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.9 15.18 19.79 19.79 0 0 1 1.83 6.5 2 2 0 0 1 3.53 4.36h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.5 12.27"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
            </button>
            <span className="sr-ctrl-label">End call</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionRoom;