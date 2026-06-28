import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Sparkles, TrendingUp, Map, MessageSquare,
  Send, RotateCcw, CheckCircle, Loader,
  Target, Zap, Bot, Brain, ChevronRight, Lock
} from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .ai-page { background:#020010; min-height:100vh; padding:32px 24px 80px; font-family:'Inter',sans-serif; color:#F8FAFC; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.3)}
    50%{box-shadow:0 0 40px rgba(124,58,237,0.7),0 0 80px rgba(6,182,212,0.3)}
  }
  @keyframes shimmerBar {
    0%{background-position:-200% center}
    100%{background-position:200% center}
  }
  @keyframes typingBounce {
    0%,80%,100%{transform:translateY(0)}
    40%{transform:translateY(-8px)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
  @keyframes scanPulse {
    0%,100%{opacity:0.3} 50%{opacity:0.7}
  }
  @keyframes msgIn {
    from{opacity:0;transform:translateY(10px) scale(0.97)}
    to{opacity:1;transform:translateY(0) scale(1)}
  }

  .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; backdrop-filter:blur(20px); }
  .glass:hover { background:rgba(255,255,255,0.07); border-color:rgba(124,58,237,0.35); }

  .ai-tab-btn {
    flex:1; padding:10px 12px; border:none; cursor:pointer;
    border-radius:12px; font-size:13px; font-weight:600;
    font-family:'Space Grotesk',sans-serif; transition:all 0.25s ease;
    display:flex; align-items:center; justify-content:center; gap:6px;
    white-space:nowrap;
  }
  .ai-tab-btn.active {
    background:linear-gradient(135deg,#7C3AED,#06B6D4);
    color:white; box-shadow:0 0 24px rgba(124,58,237,0.5);
  }
  .ai-tab-btn:not(.active) { background:transparent; color:#64748B; }
  .ai-tab-btn:not(.active):hover { color:#A78BFA; background:rgba(124,58,237,0.1); }

  .neon-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,#7C3AED,#06B6D4);
    color:white; border:none; border-radius:50px;
    padding:14px 28px; font-weight:700; font-size:15px;
    cursor:pointer; position:relative; overflow:hidden;
    transition:all 0.3s ease; font-family:'Space Grotesk',sans-serif;
    box-shadow:0 0 30px rgba(124,58,237,0.5);
  }
  .neon-btn::before {
    content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
    transition:left 0.5s;
  }
  .neon-btn:hover::before { left:100%; }
  .neon-btn:hover { transform:translateY(-2px); box-shadow:0 0 50px rgba(124,58,237,0.8); }
  .neon-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  .ai-input {
    width:100%; background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1); border-radius:12px;
    padding:12px 16px; color:#F8FAFC; font-size:14px; outline:none;
    transition:all 0.2s ease; font-family:'Inter',sans-serif;
  }
  .ai-input:focus { border-color:rgba(124,58,237,0.6); box-shadow:0 0 0 3px rgba(124,58,237,0.1); background:rgba(124,58,237,0.05); }
  .ai-input::placeholder { color:#475569; }

  .ai-select {
    width:100%; background:#0A0A1A;
    border:1px solid rgba(255,255,255,0.1); border-radius:12px;
    padding:12px 16px; color:#F8FAFC; font-size:13px; outline:none;
    transition:all 0.2s ease; cursor:pointer; appearance:none;
  }
  .ai-select:focus { border-color:rgba(124,58,237,0.6); }

  .ai-label { font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; font-family:'Space Grotesk',sans-serif; }

  .msg-user {
    background:linear-gradient(135deg,#7C3AED,#4F46E5);
    color:white; border-radius:20px 20px 4px 20px;
    padding:12px 16px; font-size:14px; line-height:1.6;
    max-width:80%; animation:msgIn 0.3s ease;
  }
  .msg-ai {
    background:rgba(255,255,255,0.06);
    border:1px solid rgba(255,255,255,0.1);
    color:#E2E8F0; border-radius:20px 20px 20px 4px;
    padding:12px 16px; font-size:14px; line-height:1.6;
    max-width:80%; animation:msgIn 0.3s ease;
    backdrop-filter:blur(10px);
  }

  .demand-high { background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#34D399; font-size:11px; padding:3px 10px; border-radius:50px; font-weight:700; font-family:'Space Grotesk',sans-serif; }
  .demand-med  { background:rgba(245,158,11,0.2); border:1px solid rgba(245,158,11,0.4); color:#FCD34D; font-size:11px; padding:3px 10px; border-radius:50px; font-weight:700; font-family:'Space Grotesk',sans-serif; }
  .demand-low  { background:rgba(100,116,139,0.2); border:1px solid rgba(100,116,139,0.3); color:#94A3B8; font-size:11px; padding:3px 10px; border-radius:50px; font-weight:700; font-family:'Space Grotesk',sans-serif; }

  .section-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(124,58,237,0.2); border:1px solid rgba(124,58,237,0.4); border-radius:50px; padding:5px 14px; font-size:11px; font-weight:600; color:#A78BFA; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk',sans-serif; }

  .quick-tag { padding:5px 12px; border-radius:50px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#94A3B8; cursor:pointer; transition:all 0.2s; font-family:'Space Grotesk',sans-serif; }
  .quick-tag:hover { background:rgba(124,58,237,0.2); border-color:rgba(124,58,237,0.5); color:#A78BFA; }

  @media (max-width:640px) { .ai-page{padding:16px 12px 60px} .tabs-scroll{overflow-x:auto} }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

/* ─── Recommendation Card ───────────────────────────────────────────────── */
const RecommendationCard = ({ rec, index }) => (
  <div
    className="glass"
    style={{ padding: 22, transition: 'all 0.3s ease', animation: `fadeInUp 0.5s ${index * 0.1}s ease both`, cursor: 'default' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(124,58,237,0.2)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
      <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>{rec.name}</h4>
      <span className={rec.marketDemand === 'High' ? 'demand-high' : rec.marketDemand === 'Medium' ? 'demand-med' : 'demand-low'}>
        {rec.marketDemand}
      </span>
    </div>
    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 14 }}>{rec.reason}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#475569' }}>⏱ {rec.estimatedTime}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50, fontFamily: "'Space Grotesk',sans-serif",
        background: rec.type === 'learn' ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.2)',
        border: `1px solid ${rec.type === 'learn' ? 'rgba(124,58,237,0.4)' : 'rgba(16,185,129,0.4)'}`,
        color: rec.type === 'learn' ? '#A78BFA' : '#34D399',
      }}>
        {rec.type === 'learn' ? '📚 Learn' : '✦ Offer'}
      </span>
    </div>
  </div>
);

/* ─── Gap Analysis ──────────────────────────────────────────────────────── */
const GapAnalysis = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {/* Radial score */}
    <div className="glass" style={{ padding: 28, textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
        Readiness for <strong style={{ color: '#A78BFA' }}>{data.targetRole}</strong>
      </p>
      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
        <svg viewBox="0 0 36 36" style={{ width: 140, height: 140, transform: 'rotate(-90deg)' }}>
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
            stroke="url(#gaugeGrad)" strokeWidth="3"
            strokeDasharray={`${data.readinessScore}, 100`} strokeLinecap="round" />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{data.readinessScore}%</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>{data.readinessLabel}</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>{data.summary}</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
      {/* Strong */}
      <div className="glass" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: '#34D399', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={15} /> Strong Skills
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.strongSkills?.length ? data.strongSkills.map(s => (
            <span key={s} style={{ padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' }}>{s}</span>
          )) : <span style={{ fontSize: 13, color: '#475569' }}>None identified yet</span>}
        </div>
      </div>
      {/* Quick wins */}
      <div className="glass" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: '#FCD34D', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={15} /> Quick Wins
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.quickWins?.length ? data.quickWins.map(s => (
            <span key={s} style={{ padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}>{s}</span>
          )) : <span style={{ fontSize: 13, color: '#475569' }}>None identified</span>}
        </div>
      </div>
    </div>

    {/* Gap skills */}
    {data.gapSkills?.length > 0 && (
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Skills to Develop</h4>
        </div>
        {data.gapSkills.map((gap, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 20px', borderBottom: i < data.gapSkills.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{gap.name}</p>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>{gap.currentLevel} → {gap.requiredLevel} · {gap.estimatedTime}</p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50, fontFamily: "'Space Grotesk',sans-serif", flexShrink: 0,
              background: gap.priority === 'High' ? 'rgba(239,68,68,0.2)' : gap.priority === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)',
              border: `1px solid ${gap.priority === 'High' ? 'rgba(239,68,68,0.4)' : gap.priority === 'Medium' ? 'rgba(245,158,11,0.4)' : 'rgba(100,116,139,0.3)'}`,
              color: gap.priority === 'High' ? '#F87171' : gap.priority === 'Medium' ? '#FCD34D' : '#94A3B8',
            }}>{gap.priority}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ─── Roadmap View ──────────────────────────────────────────────────────── */
const RoadmapView = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {/* Header */}
    <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.15))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{data.skill} Roadmap</h3>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Total duration: {data.totalDuration}</p>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#A78BFA', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', padding: '6px 14px', borderRadius: 50 }}>{data.totalDuration}</span>
    </div>

    {/* Phases */}
    {data.phases?.map((phase, i) => (
      <div key={i} className="glass" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
        {/* Left accent */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, #7C3AED, #06B6D4)`, borderRadius: '0 0 0 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, paddingLeft: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, flexShrink: 0, boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            {phase.phase}
          </div>
          <div>
            <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>{phase.name}</h4>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{phase.duration} · ~{phase.weeklyHours}h/week</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 14, lineHeight: 1.6, paddingLeft: 8 }}>{phase.goal}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: phase.resources?.length ? 16 : 0, paddingLeft: 8 }}>
          {phase.topics?.map(t => (
            <span key={t} style={{ padding: '4px 12px', borderRadius: 50, fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>{t}</span>
          ))}
        </div>

        {phase.resources?.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, paddingLeft: 8 }}>
            <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>📚 Resources</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {phase.resources.slice(0, 3).map((r, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{r.type === 'book' ? '📖' : r.type === 'video' ? '🎥' : '💻'}</span>
                  <span style={{ fontSize: 13, color: '#94A3B8', flex: 1 }}>{r.title}</span>
                  {r.isFree && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>Free</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ))}

    {/* Practice projects */}
    {data.practiceProjects?.length > 0 && (
      <div className="glass" style={{ padding: 22 }}>
        <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} color="#A78BFA" /> Practice Projects
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.practiceProjects.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50, flexShrink: 0, alignSelf: 'flex-start', fontFamily: "'Space Grotesk',sans-serif",
                background: p.difficulty === 'Easy' ? 'rgba(16,185,129,0.2)' : p.difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                border: `1px solid ${p.difficulty === 'Easy' ? 'rgba(16,185,129,0.4)' : p.difficulty === 'Medium' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`,
                color: p.difficulty === 'Easy' ? '#34D399' : p.difficulty === 'Medium' ? '#FCD34D' : '#F87171',
              }}>{p.difficulty}</span>
              <div>
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>{p.title}</p>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

/* ─── AI Chat ───────────────────────────────────────────────────────────── */
const AIChat = ({ userContext }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${userContext.name || 'there'}! 👋 I'm your SkillBridge AI. Ask me about skill recommendations, learning paths, exchange tips, or anything about the platform.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { messages: [...messages, userMsg] });
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const QUICK = ['Recommend skills for me', 'How does SkillBridge work?', 'Tips for a great exchange', 'What skills are in demand?'];

  return (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: 560, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(124,58,237,0.08)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 20px rgba(124,58,237,0.5)', animation: 'glowPulse 3s infinite' }}>🤖</div>
        <div>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9' }}>SkillBridge AI</p>
          <p style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
            Online · Powered by Gemini
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.2)' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 4 }}>🤖</div>
            )}
            <div className={m.role === 'user' ? 'msg-user' : 'msg-ai'}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div className="msg-ai" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '14px 18px' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA', display: 'inline-block', animation: `typingBounce 1s ${d}ms infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 1 && (
        <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {QUICK.map(q => (
            <button key={q} className="quick-tag" onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10 }}>
        <input
          ref={inputRef}
          className="ai-input"
          style={{ borderRadius: 50 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask me anything about skills..."
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: '50%', background: input.trim() && !loading ? 'linear-gradient(135deg,#7C3AED,#06B6D4)' : 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.2s', boxShadow: input.trim() && !loading ? '0 0 20px rgba(124,58,237,0.5)' : 'none' }}
        >
          <Send size={16} color={input.trim() && !loading ? 'white' : '#475569'} />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────────────────── */
const AITools = () => {
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('chat');
  const [loadingAI, setLoadingAI] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [gapData, setGapData] = useState(null);
  const [roadmapForm, setRoadmapForm] = useState({ skillName: '', currentLevel: 'none', targetLevel: 'intermediate', timeframe: '6 months' });
  const [roadmapData, setRoadmapData] = useState(null);

  const handleGetRecommendations = async () => {
    setLoadingAI(true);
    try {
      const { data } = await api.get('/ai/recommendations');
      setRecommendations(data.data);
    } catch { toast.error('AI request failed. Check your API key.'); }
    finally { setLoadingAI(false); }
  };

  const handleGapAnalysis = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) { toast.error('Enter a target role'); return; }
    setLoadingAI(true);
    try {
      const { data } = await api.post('/ai/gap-analysis', { targetRole });
      setGapData(data.data);
    } catch { toast.error('AI request failed'); }
    finally { setLoadingAI(false); }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!roadmapForm.skillName.trim()) { toast.error('Enter a skill name'); return; }
    setLoadingAI(true);
    try {
      const { data } = await api.post('/ai/roadmap', roadmapForm);
      setRoadmapData(data.data);
    } catch { toast.error('AI request failed'); }
    finally { setLoadingAI(false); }
  };

  const TABS = [
    { id: 'chat',            emoji: '💬', label: 'AI Chat' },
    { id: 'recommendations', emoji: '✨', label: 'Recommendations' },
    { id: 'gap',             emoji: '📊', label: 'Gap Analysis' },
    { id: 'roadmap',         emoji: '🗺️', label: 'Roadmap' },
  ];

  const ROLES = ['Full-Stack Developer', 'Data Scientist', 'UX Designer', 'Product Manager', 'Digital Marketer'];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ai-page">
        {/* BG orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', animation: 'orb1 15s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.12) 0%,transparent 70%)', animation: 'orb2 18s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 36, animation: 'fadeInUp 0.6s ease both' }}>
            <div className="section-tag" style={{ marginBottom: 16 }}><Brain size={12} /> AI Tools</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 0 30px rgba(124,58,237,0.5)', animation: 'glowPulse 3s infinite' }}>🤖</div>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#F8FAFC,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  AI Tools
                </h1>
                <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Powered by Google Gemini — your personal skill advisor</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-scroll" style={{ marginBottom: 28, animation: 'fadeInUp 0.6s 0.1s ease both' }}>
            <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 6, minWidth: 'max-content' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`ai-tab-btn ${activeTab === t.id ? 'active' : ''}`}>
                  <span>{t.emoji}</span>
                  <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat Tab ──────────────────────────────────────────────── */}
          {activeTab === 'chat' && (
            <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
              <AIChat userContext={{ name: user?.name, skillsOffered: user?.skillsOffered, skillsWanted: user?.skillsWanted }} />
            </div>
          )}

          {/* ── Recommendations Tab ───────────────────────────────────── */}
          {activeTab === 'recommendations' && (
            <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
              {!recommendations ? (
                <div className="glass" style={{ padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '2px solid rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'glowPulse 3s infinite' }}>
                    <Sparkles size={32} color="#A78BFA" />
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>AI Skill Recommendations</h3>
                  <p style={{ color: '#64748B', fontSize: 14, maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
                    Get personalized skill recommendations based on your profile, current skills, and real market demand.
                  </p>
                  <button onClick={handleGetRecommendations} disabled={loadingAI} className="neon-btn">
                    {loadingAI ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Analyzing your profile...</> : <><Sparkles size={18} />Get My Recommendations</>}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700 }}>Your Personalized Recommendations</h3>
                    <button onClick={() => setRecommendations(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '8px 16px', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
                      <RotateCcw size={12} /> Refresh
                    </button>
                  </div>
                  {recommendations.summary && (
                    <div style={{ padding: '16px 20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 14, marginBottom: 20 }}>
                      <p style={{ fontSize: 13, color: '#C4B5FD', lineHeight: 1.7 }}>{recommendations.summary}</p>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                    {recommendations.recommendations?.map((rec, i) => <RecommendationCard key={i} rec={rec} index={i} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Gap Analysis Tab ──────────────────────────────────────── */}
          {activeTab === 'gap' && (
            <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
              {!gapData ? (
                <div className="glass" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <TrendingUp size={22} color="#A78BFA" />
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>Skill Gap Analysis</h3>
                  </div>
                  <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Enter your target role and we'll analyze what skills you need to develop to get there.</p>

                  <form onSubmit={handleGapAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label className="ai-label">Target Role or Goal</label>
                      <input className="ai-input" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                        placeholder="e.g. Full-Stack Developer, UX Designer, Data Analyst..." required />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                        {ROLES.map(r => (
                          <button key={r} type="button" onClick={() => setTargetRole(r)} className="quick-tag">{r}</button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={loadingAI || !targetRole.trim()} className="neon-btn" style={{ alignSelf: 'flex-start' }}>
                      {loadingAI ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Analyzing gaps...</> : <><TrendingUp size={18} />Analyze My Gaps</>}
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700 }}>Gap Analysis: <span style={{ color: '#A78BFA' }}>{gapData.targetRole}</span></h3>
                    <button onClick={() => setGapData(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '8px 16px', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
                      <RotateCcw size={12} /> New Analysis
                    </button>
                  </div>
                  <GapAnalysis data={gapData} />
                </div>
              )}
            </div>
          )}

          {/* ── Roadmap Tab ───────────────────────────────────────────── */}
          {activeTab === 'roadmap' && (
            <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
              {!roadmapData ? (
                <div className="glass" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Map size={22} color="#A78BFA" />
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700 }}>Learning Roadmap Generator</h3>
                  </div>
                  <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Get a step-by-step personalized learning plan for any skill, tailored to your current level.</p>

                  <form onSubmit={handleGenerateRoadmap} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label className="ai-label">Skill to Learn *</label>
                      <input className="ai-input" value={roadmapForm.skillName}
                        onChange={e => setRoadmapForm(f => ({ ...f, skillName: e.target.value }))}
                        placeholder="e.g. React.js, Photography, Spanish, Guitar..." required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
                      {[
                        { label: 'Current Level', key: 'currentLevel', opts: ['none', 'beginner', 'intermediate', 'advanced'] },
                        { label: 'Target Level', key: 'targetLevel', opts: ['beginner', 'intermediate', 'advanced', 'expert'] },
                        { label: 'Timeframe', key: 'timeframe', opts: ['1 month', '3 months', '6 months', '1 year'] },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="ai-label">{f.label}</label>
                          <select className="ai-select" value={roadmapForm[f.key]} onChange={e => setRoadmapForm(p => ({ ...p, [f.key]: e.target.value }))}>
                            {f.opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <button type="submit" disabled={loadingAI || !roadmapForm.skillName.trim()} className="neon-btn" style={{ alignSelf: 'flex-start' }}>
                      {loadingAI ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Building your roadmap...</> : <><Map size={18} />Generate Roadmap</>}
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700 }}>Your <span style={{ color: '#A78BFA' }}>{roadmapData.skill}</span> Roadmap</h3>
                    <button onClick={() => setRoadmapData(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '8px 16px', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
                      <RotateCcw size={12} /> New Roadmap
                    </button>
                  </div>
                  <RoadmapView data={roadmapData} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AITools;