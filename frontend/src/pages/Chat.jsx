import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Send, ArrowLeft, Video, MoreVertical } from 'lucide-react'
import { chatApi } from '../api/chatApi'
import { useSocket } from '../context/SocketContext'
import useChatStore from '../store/chatStore'
import { formatChatTime, formatRelativeTime } from '../utils/formatDate'
import Loader from '../components/common/Loader'

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .chat-page { background:#020010; height:calc(100vh - 64px); font-family:'Inter',sans-serif; color:#F8FAFC; overflow:hidden; position:relative; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 16px rgba(124,58,237,0.35)}
    50%{box-shadow:0 0 32px rgba(124,58,237,0.7),0 0 60px rgba(6,182,212,0.25)}
  }
  @keyframes onlinePulse {
    0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.6)}
    50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
  @keyframes bubbleIn {
    from{opacity:0;transform:translateY(8px) scale(0.96)}
    to{opacity:1;transform:translateY(0) scale(1)}
  }
  @keyframes typingBounce {
    0%,80%,100%{transform:translateY(0)}
    40%{transform:translateY(-6px)}
  }

  .chat-glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); backdrop-filter:blur(20px); }

  .conv-item {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:14px 18px; text-align:left; cursor:pointer; border:none;
    background:transparent; transition:all 0.2s ease; position:relative;
    border-radius:14px;
  }
  .conv-item:hover { background:rgba(124,58,237,0.1); }
  .conv-item.active { background:rgba(124,58,237,0.16); }
  .conv-item.active::before {
    content:''; position:absolute; left:0; top:10%; bottom:10%; width:3px;
    background:linear-gradient(180deg,#7C3AED,#06B6D4); border-radius:0 4px 4px 0;
    box-shadow:0 0 12px rgba(124,58,237,0.6);
  }

  .avatar-ring {
    position:relative; flex-shrink:0; border-radius:14px; padding:2px;
    background:linear-gradient(135deg,rgba(124,58,237,0.5),rgba(6,182,212,0.4));
  }
  .avatar-ring img { display:block; border-radius:12px; background:#0A0A1A; }
  .online-dot {
    position:absolute; bottom:-2px; right:-2px; width:12px; height:12px;
    border-radius:50%; background:#10B981; border:2px solid #020010;
    animation:onlinePulse 2s infinite;
  }

  .unread-badge {
    min-width:20px; height:20px; padding:0 6px; border-radius:50px;
    background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff;
    font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center;
    font-family:'Space Grotesk',sans-serif; box-shadow:0 0 12px rgba(124,58,237,0.5); flex-shrink:0;
  }

  .bubble-own {
    background:linear-gradient(135deg,#7C3AED,#4F46E5);
    color:#fff; border-radius:18px 18px 4px 18px;
    padding:11px 16px; font-size:14px; line-height:1.55;
    box-shadow:0 4px 20px rgba(124,58,237,0.3);
    animation:bubbleIn 0.25s ease both;
  }
  .bubble-other {
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.09);
    color:#E2E8F0; border-radius:18px 18px 18px 4px;
    padding:11px 16px; font-size:14px; line-height:1.55;
    backdrop-filter:blur(10px);
    animation:bubbleIn 0.25s ease both;
  }
  .bubble-deleted {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
    color:#475569; font-size:13px; font-style:italic; border-radius:18px; padding:11px 16px;
  }

  .chat-input {
    flex:1; background:transparent; border:none; outline:none; resize:none;
    color:#F8FAFC; font-size:14px; line-height:1.5; max-height:120px;
    font-family:'Inter',sans-serif;
  }
  .chat-input::placeholder { color:#475569; }

  .send-btn {
    width:44px; height:44px; border-radius:50%; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:all 0.25s ease; background:linear-gradient(135deg,#7C3AED,#06B6D4);
    box-shadow:0 0 22px rgba(124,58,237,0.5);
  }
  .send-btn:disabled { background:rgba(255,255,255,0.06); box-shadow:none; cursor:not-allowed; }
  .send-btn:not(:disabled):hover { transform:translateY(-2px) scale(1.04); box-shadow:0 0 32px rgba(124,58,237,0.75); }

  .icon-btn {
    width:38px; height:38px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);
    background:rgba(255,255,255,0.04); color:#94A3B8; display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all 0.2s ease; flex-shrink:0;
  }
  .icon-btn:hover { background:rgba(124,58,237,0.18); border-color:rgba(124,58,237,0.4); color:#A78BFA; }

  .chat-scroll::-webkit-scrollbar { width:6px; }
  .chat-scroll::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.3); border-radius:10px; }
  .chat-scroll::-webkit-scrollbar-track { background:transparent; }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

/* ─── Message Bubble ────────────────────────────────────────────────────── */
const MessageBubble = ({ message, isOwn }) => (
  <div style={{ display: 'flex', gap: 8, flexDirection: isOwn ? 'row-reverse' : 'row', marginBottom: 4 }}>
    {!isOwn && (
      <img
        src={message.sender?.avatar || `https://ui-avatars.com/api/?name=${message.sender?.name}&background=7C3AED&color=fff`}
        style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end', objectFit: 'cover' }}
        alt=""
      />
    )}
    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
      {message.isDeleted ? (
        <div className="bubble-deleted">Message deleted</div>
      ) : (
        <div className={isOwn ? 'bubble-own' : 'bubble-other'}>{message.content}</div>
      )}
      <span style={{ fontSize: 11, color: '#475569', marginTop: 3, padding: '0 4px', fontFamily: "'JetBrains Mono',monospace" }}>
        {formatChatTime(message.createdAt)}
      </span>
    </div>
  </div>
)

/* ─── Conversation List Item ────────────────────────────────────────────── */
const ConversationItem = ({ conv, isActive, onClick, currentUserId }) => {
  const other = conv.participants?.find(p => p._id !== currentUserId)
  return (
    <button onClick={() => onClick(conv)} className={`conv-item ${isActive ? 'active' : ''}`}>
      <div className="avatar-ring">
        <img
          src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name}&background=7C3AED&color=fff`}
          style={{ width: 44, height: 44, objectFit: 'cover' }}
          alt=""
        />
        {other?.isOnline && <span className="online-dot" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{other?.name}</p>
          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>{formatChatTime(conv.lastMessageAt)}</span>
        </div>
        <p style={{ fontSize: 12, color: '#64748B', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {conv.lastMessageText || 'Start a conversation'}
        </p>
      </div>
      {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
    </button>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
const Chat = () => {
  const { conversationId: paramConvId } = useParams()
  const { user } = useSelector(state => state.auth)
  const { conversations, messages, isLoadingConversations, fetchConversations, fetchMessages, addMessage, typingUsers } = useChatStore()
  const { sendSocketMessage, emitTypingStart, emitTypingStop, markConversationRead, joinConversation } = useSocket()
  const [activeConv, setActiveConv] = useState(null)
  const [input, setInput] = useState('')
  const [isMobileListOpen, setIsMobileListOpen] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (paramConvId && conversations.length) {
      const conv = conversations.find(c => c._id === paramConvId)
      if (conv) selectConversation(conv)
    }
  }, [paramConvId, conversations.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[activeConv?._id]])

  const selectConversation = (conv) => {
    setActiveConv(conv)
    setIsMobileListOpen(false)
    if (!messages[conv._id]) fetchMessages(conv._id)
    joinConversation(conv._id)
    markConversationRead(conv._id)
    navigate(`/chat/${conv._id}`, { replace: true })
  }

  const sendMessage = useCallback(() => {
    if (!input.trim() || !activeConv) return
    const content = input.trim()
    setInput('')
    sendSocketMessage({ conversationId: activeConv._id, content, type: 'text' })
    emitTypingStop(activeConv._id)
  }, [input, activeConv, sendSocketMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (activeConv) {
      emitTypingStart(activeConv._id)
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => emitTypingStop(activeConv._id), 2000)
    }
  }

  const convMessages = messages[activeConv?._id] || []
  const typingInConv = typingUsers[activeConv?._id] || {}
  const typingNames = Object.values(typingInConv).filter(Boolean)
  const otherUser = activeConv?.participants?.find(p => p._id !== user?._id)

  return (
    <>
      <style>{STYLES}</style>
      <div className="chat-page">
        {/* BG orbs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.14) 0%,transparent 70%)', animation: 'orb1 16s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-5%', left: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'orb2 19s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100%' }}>

          {/* Sidebar */}
          <div
            className="chat-glass"
            style={{
              display: isMobileListOpen ? 'flex' : 'none',
              flexDirection: 'column', width: '100%', flexShrink: 0,
              borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
            }}
          >
            <style>{`@media (min-width:768px){.chat-sidebar-md{display:flex !important; width:340px !important;}}`}</style>
            <div className="chat-sidebar-md" style={{ display: isMobileListOpen ? 'flex' : 'none', flexDirection: 'column', width: '100%', height: '100%' }}>
              <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', animation: 'fadeInUp 0.5s ease both' }}>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, background: 'linear-gradient(135deg,#F8FAFC,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Messages
                </h1>
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
                {isLoadingConversations ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Loader /></div>
                ) : conversations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', animation: 'fadeInUp 0.5s ease both' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Send size={22} color="#A78BFA" />
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>No conversations yet</p>
                    <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>Accept an exchange to start chatting</p>
                  </div>
                ) : (
                  conversations.map((conv, i) => (
                    <div key={conv._id} style={{ animation: `fadeInUp 0.4s ${i * 0.04}s ease both` }}>
                      <ConversationItem conv={conv} isActive={activeConv?._id === conv._id} onClick={selectConversation} currentUserId={user?._id} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat area */}
          {activeConv ? (
            <div style={{ display: !isMobileListOpen ? 'flex' : 'none', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <style>{`@media (min-width:768px){.chat-area-md{display:flex !important;}}`}</style>
              <div className="chat-area-md" style={{ display: !isMobileListOpen ? 'flex' : 'none', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>

                {/* Header */}
                <div className="chat-glass" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 0, borderTop: 'none', borderRight: 'none' }}>
                  <button onClick={() => setIsMobileListOpen(true)} className="icon-btn" style={{ display: window.innerWidth < 768 ? 'flex' : 'none' }}>
                    <ArrowLeft size={18} />
                  </button>
                  <div className="avatar-ring">
                    <img
                      src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=7C3AED&color=fff`}
                      style={{ width: 42, height: 42, objectFit: 'cover' }}
                      alt=""
                    />
                    {otherUser?.isOnline && <span className="online-dot" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9' }}>{otherUser?.name}</p>
                    <p style={{ fontSize: 12, color: otherUser?.isOnline ? '#34D399' : '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {otherUser?.isOnline && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />}
                      {otherUser?.isOnline ? 'Online' : `Last seen ${formatRelativeTime(otherUser?.lastSeen)}`}
                    </p>
                  </div>
                  <Link to={`/session/room/${activeConv._id}`} className="icon-btn">
                    <Video size={17} />
                  </Link>
                  <button className="icon-btn"><MoreVertical size={17} /></button>
                </div>

                {/* Messages */}
                <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {convMessages.map((msg, i) => (
                    <div key={msg._id} style={{ animation: `fadeInUp 0.3s ${Math.min(i, 6) * 0.02}s ease both` }}>
                      <MessageBubble message={msg} isOwn={msg.sender?._id === user?._id} />
                    </div>
                  ))}
                  {typingNames.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 36, marginTop: 4 }}>
                      <div className="bubble-other" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '10px 16px' }}>
                        {[0, 150, 300].map(d => (
                          <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `typingBounce 1s ${d}ms infinite` }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{typingNames[0]} is typing…</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-glass" style={{ padding: '14px 18px', borderRadius: 0, borderBottom: 'none', borderRight: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '10px 16px', transition: 'all 0.2s' }}>
                      <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="chat-input"
                      />
                    </div>
                    <button onClick={sendMessage} disabled={!input.trim()} className="send-btn">
                      <Send size={17} color={input.trim() ? '#fff' : '#475569'} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: window.innerWidth >= 768 ? 'flex' : 'none', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.5s ease both' }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'glowPulse 3s infinite' }}>
                <Send size={32} color="#A78BFA" />
              </div>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, color: '#94A3B8' }}>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
export default Chat