import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, MapPin, Calendar, Zap, Edit2, MessageSquare, Send, ExternalLink, Loader, Github, Linkedin, Globe } from 'lucide-react';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';
import Modal from '../components/common/Modal.jsx';
import toast from 'react-hot-toast';

const LEVEL_GLOW = {
  beginner:     { bg: 'rgba(16,185,129,0.16)', border: 'rgba(16,185,129,0.4)', text: '#34D399' },
  intermediate: { bg: 'rgba(6,182,212,0.16)',  border: 'rgba(6,182,212,0.4)',  text: '#22D3EE' },
  advanced:     { bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.45)',text: '#A78BFA' },
  expert:       { bg: 'rgba(239,68,68,0.16)',  border: 'rgba(239,68,68,0.4)',  text: '#F87171' },
  professional: { bg: 'rgba(245,158,11,0.16)', border: 'rgba(245,158,11,0.4)', text: '#FCD34D' },
  student:      { bg: 'rgba(100,116,139,0.16)',border: 'rgba(100,116,139,0.4)',text: '#94A3B8' },
};
const lvl = (l) => LEVEL_GLOW[l] || LEVEL_GLOW.student;

const TIER_GLOW = {
  gold:     { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.45)', text: '#FCD34D' },
  silver:   { bg: 'rgba(148,163,184,0.18)',border: 'rgba(148,163,184,0.4)', text: '#CBD5E1' },
  bronze:   { bg: 'rgba(251,146,60,0.18)', border: 'rgba(251,146,60,0.45)', text: '#FB923C' },
};
const tier = (t) => TIER_GLOW[t] || { bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.45)', text: '#A78BFA' };

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .pf-page { background:#020010; min-height:100vh; padding:32px 24px 80px; font-family:'Inter',sans-serif; color:#F8FAFC; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 18px rgba(124,58,237,0.3)}
    50%{box-shadow:0 0 36px rgba(124,58,237,0.65),0 0 70px rgba(6,182,212,0.25)}
  }
  @keyframes onlinePulse {
    0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.6)}
    50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
  @keyframes shimmerBar { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes bannerShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

  .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; backdrop-filter:blur(20px); }

  .pf-banner { height:140px; background:linear-gradient(120deg,#7C3AED,#06B6D4,#7C3AED); background-size:200% 200%; animation:bannerShift 8s ease infinite; position:relative; overflow:hidden; }
  .pf-banner::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%); }

  .pf-avatar-ring { position:relative; width:104px; height:104px; border-radius:28px; padding:4px; background:linear-gradient(135deg,#7C3AED,#06B6D4); box-shadow:0 0 36px rgba(124,58,237,0.5); flex-shrink:0; }
  .pf-avatar-ring img, .pf-avatar-ring .pf-fallback { width:100%; height:100%; border-radius:24px; object-fit:cover; }
  .pf-online-dot { position:absolute; bottom:0px; right:0px; width:18px; height:18px; border-radius:50%; background:#10B981; border:3px solid #020010; animation:onlinePulse 2s infinite; }

  .pf-btn-primary {
    display:inline-flex; align-items:center; gap:7px; background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff;
    border:none; border-radius:50px; padding:10px 20px; font-weight:700; font-size:13px; cursor:pointer;
    font-family:'Space Grotesk',sans-serif; box-shadow:0 0 20px rgba(124,58,237,0.45); transition:all 0.25s ease; text-decoration:none;
  }
  .pf-btn-primary:hover { transform:translateY(-2px); box-shadow:0 0 32px rgba(124,58,237,0.7); }
  .pf-btn-secondary {
    display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.14);
    color:#A78BFA; border-radius:50px; padding:10px 20px; font-weight:700; font-size:13px; cursor:pointer;
    font-family:'Space Grotesk',sans-serif; transition:all 0.2s ease; text-decoration:none;
  }
  .pf-btn-secondary:hover { background:rgba(124,58,237,0.16); border-color:rgba(124,58,237,0.4); }

  .pf-meta-pill { display:inline-flex; align-items:center; gap:5px; font-size:12px; color:#94A3B8; }
  .pf-level-pill { font-size:11px; font-weight:700; padding:4px 12px; border-radius:50px; font-family:'Space Grotesk',sans-serif; text-transform:capitalize; }

  .pf-social-link { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#64748B; text-decoration:none; transition:color 0.2s ease; }
  .pf-social-link:hover { color:#A78BFA; }

  .pf-tabs { display:flex; gap:4px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:5px; margin-bottom:26px; overflow-x:auto; }
  .pf-tab-btn { flex:1; padding:10px 14px; border:none; cursor:pointer; border-radius:12px; font-size:13px; font-weight:600; font-family:'Space Grotesk',sans-serif; transition:all 0.25s ease; white-space:nowrap; }
  .pf-tab-btn.active { background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; box-shadow:0 0 20px rgba(124,58,237,0.45); }
  .pf-tab-btn:not(.active) { background:transparent; color:#64748B; }
  .pf-tab-btn:not(.active):hover { color:#A78BFA; background:rgba(124,58,237,0.08); }

  .pf-skill-row { padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; transition:all 0.2s ease; }
  .pf-skill-row:hover { background:rgba(124,58,237,0.07); border-color:rgba(124,58,237,0.25); }

  .pf-review-row { padding:20px; display:flex; gap:14px; border-bottom:1px solid rgba(255,255,255,0.06); }
  .pf-review-row:last-child { border-bottom:none; }

  .pf-achv-card { padding:22px; text-align:center; transition:all 0.3s ease; }
  .pf-achv-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(124,58,237,0.18); }

  .pf-progress-track { width:100%; background:rgba(255,255,255,0.07); border-radius:50px; height:8px; overflow:hidden; }
  .pf-progress-fill { height:100%; border-radius:50px; background:linear-gradient(90deg,#7C3AED,#06B6D4,#7C3AED); background-size:200% 100%; animation:shimmerBar 3s linear infinite; box-shadow:0 0 10px rgba(124,58,237,0.6); transition:width 0.5s ease; }

  .pf-input, .pf-select, .pf-textarea {
    width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); border-radius:12px;
    padding:11px 14px; color:#F8FAFC; font-size:14px; outline:none; transition:all 0.2s ease; font-family:'Inter',sans-serif;
  }
  .pf-input:focus, .pf-select:focus, .pf-textarea:focus { border-color:rgba(124,58,237,0.6); box-shadow:0 0 0 3px rgba(124,58,237,0.12); }
  .pf-select { cursor:pointer; appearance:none; background-color:#0A0A1A; }
  .pf-textarea { resize:none; }
  .pf-label { font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; font-family:'Space Grotesk',sans-serif; }

  .pf-type-btn { flex:1; padding:11px; border-radius:12px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s ease; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.03); color:#94A3B8; }
  .pf-type-btn.active { border-color:rgba(124,58,237,0.5); background:rgba(124,58,237,0.16); color:#A78BFA; box-shadow:0 0 16px rgba(124,58,237,0.25); }

  .pf-ghost-btn { flex:1; padding:12px; border-radius:50px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Space Grotesk',sans-serif; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:#94A3B8; transition:all 0.2s ease; }
  .pf-ghost-btn:hover { background:rgba(255,255,255,0.08); }
  .pf-submit-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:12px; border-radius:50px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif; background:linear-gradient(135deg,#7C3AED,#06B6D4); border:none; color:#fff; box-shadow:0 0 20px rgba(124,58,237,0.45); transition:all 0.25s ease; }
  .pf-submit-btn:hover { box-shadow:0 0 30px rgba(124,58,237,0.65); }
  .pf-submit-btn:disabled { opacity:0.6; cursor:not-allowed; }

  .section-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(124,58,237,0.2); border:1px solid rgba(124,58,237,0.4); border-radius:50px; padding:5px 14px; font-size:11px; font-weight:600; color:#A78BFA; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk',sans-serif; }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');
  const [form, setForm] = useState({ skillOffered: '', skillWanted: '', message: '', exchangeType: 'online' });
  const [sending, setSending] = useState(false);

  const isOwn = currentUser?._id === id;

  useEffect(() => {
    Promise.all([
      api.get('/users/' + id),
      api.get('/reviews/user/' + id + '?limit=5'),
    ]).then(([pRes, rRes]) => {
      setProfile(pRes.data.data.user);
      setReviews(rRes.data.data || []);
    }).catch(() => navigate('/404')).finally(() => setLoading(false));
  }, [id]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!form.skillOffered || !form.skillWanted) { toast.error('Both skills are required'); return; }
    setSending(true);
    try {
      await api.post('/exchanges', {
        receiverId: id,
        skillOffered: { name: form.skillOffered },
        skillWanted: { name: form.skillWanted },
        message: form.message,
        exchangeType: form.exchangeType,
      });
      toast.success('Exchange request sent!');
      setRequestModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setSending(false); }
  };

  const handleChat = async () => {
    try {
      const { data } = await api.get('/chat/conversations/' + id + '/with');
      navigate('/chat/' + data.data.conversation._id);
    } catch { navigate('/chat'); }
  };

  if (loading) return <PageLoader />;
  if (!profile) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="pf-page">
        {/* BG orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.14) 0%,transparent 70%)', animation: 'orb1 16s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'orb2 19s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1040, margin: '0 auto' }}>

          {/* Header Card */}
          <div className="glass" style={{ marginBottom: 24, overflow: 'hidden', animation: 'fadeInUp 0.5s ease both' }}>
            <div className="pf-banner" />
            <div style={{ padding: '0 28px 28px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 18, marginTop: -52, marginBottom: 18 }}>
                <div className="pf-avatar-ring">
                  {profile.avatar
                    ? <img src={profile.avatar} alt={profile.name} />
                    : <div className="pf-fallback" style={{ background: '#0A0A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F8FAFC', fontSize: 32, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{profile.name?.[0]}</div>
                  }
                  {profile.isOnline && <span className="pf-online-dot" />}
                </div>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 4 }}>
                  <div>
                    <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 24, color: '#F8FAFC', letterSpacing: '-0.01em' }}>{profile.name}</h1>
                    {profile.headline && <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>{profile.headline}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isOwn ? (
                      <Link to="/profile/edit" className="pf-btn-secondary"><Edit2 size={14} />Edit Profile</Link>
                    ) : currentUser ? (
                      <>
                        <button onClick={handleChat} className="pf-btn-secondary"><MessageSquare size={14} />Chat</button>
                        <button onClick={() => setRequestModal(true)} className="pf-btn-primary"><Send size={14} />Exchange</button>
                      </>
                    ) : (
                      <Link to="/login" className="pf-btn-primary">Login to Connect</Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                {profile.experienceLevel && (
                  <span className="pf-level-pill" style={{ background: lvl(profile.experienceLevel).bg, border: `1px solid ${lvl(profile.experienceLevel).border}`, color: lvl(profile.experienceLevel).text }}>
                    {profile.experienceLevel}
                  </span>
                )}
                {profile.location?.city && (
                  <span className="pf-meta-pill"><MapPin size={13} />{profile.location.city}, {profile.location.country}</span>
                )}
                {profile.averageRating > 0 && (
                  <span className="pf-meta-pill" style={{ color: '#FCD34D', fontWeight: 600 }}>
                    <Star size={13} fill="currentColor" />{profile.averageRating} ({profile.totalReviews} reviews)
                  </span>
                )}
                <span className="pf-meta-pill"><Zap size={13} />{profile.totalExchanges} exchanges</span>
                <span className="pf-meta-pill"><Calendar size={13} />Joined {new Date(profile.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                {profile.isOnline
                  ? <span style={{ color: '#34D399', fontWeight: 600, fontSize: 12 }}>● Online</span>
                  : <span style={{ color: '#475569', fontSize: 12 }}>Last seen {new Date(profile.lastSeen).toLocaleDateString()}</span>
                }
              </div>

              {profile.bio && <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</p>}

              {/* Social links */}
              {(profile.github || profile.linkedin || profile.website) && (
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="pf-social-link"><Github size={13} />GitHub</a>}
                  {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="pf-social-link"><Linkedin size={13} />LinkedIn</a>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="pf-social-link"><Globe size={13} />Website</a>}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="pf-tabs" style={{ animation: 'fadeInUp 0.5s 0.05s ease both' }}>
            {[['skills', 'Skills'], ['reviews', 'Reviews'], ['achievements', 'Achievements'], ['progress', 'Progress']].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`pf-tab-btn ${activeTab === t ? 'active' : ''}`}>{l}</button>
            ))}
          </div>

          {/* ── Skills Tab ─────────────────────────────────────────── */}
          {activeTab === 'skills' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, animation: 'fadeInUp 0.4s ease both' }}>
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>✦ Skills Offered</h3>
                {profile.skillsOffered?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {profile.skillsOffered.map(s => (
                      <div key={s._id} className="pf-skill-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{s.name}</p>
                          {s.description && <p style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.description}</p>}
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                            {s.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#22D3EE', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{s.category}</span>}
                            {s.yearsOfExperience && <span style={{ fontSize: 11, color: '#475569' }}>{s.yearsOfExperience}y exp</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                          <span className="pf-level-pill" style={{ background: lvl(s.level).bg, border: `1px solid ${lvl(s.level).border}`, color: lvl(s.level).text }}>{s.level}</span>
                          {s.isVerified && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 50, background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontFamily: "'Space Grotesk',sans-serif" }}>✓ Verified</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: '#475569', fontSize: 13 }}>No skills offered yet</p>}
              </div>
              <div className="glass" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>◇ Skills Wanted</h3>
                {profile.skillsWanted?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {profile.skillsWanted.map(s => (
                      <div key={s._id} className="pf-skill-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{s.name}</p>
                          {s.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, marginTop: 6, display: 'inline-block' }}>{s.category}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>{s.currentLevel} → {s.targetLevel}</div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: '#475569', fontSize: 13 }}>No skills listed yet</p>}
              </div>
            </div>
          )}

          {/* ── Reviews Tab ────────────────────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className="glass" style={{ overflow: 'hidden', animation: 'fadeInUp 0.4s ease both' }}>
              <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#F1F5F9' }}>Reviews</h3>
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{profile.totalReviews} total reviews</p>
                </div>
                {profile.averageRating > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{profile.averageRating}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', color: '#FCD34D', margin: '4px 0' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={i < Math.round(profile.averageRating) ? 'currentColor' : 'none'} />)}
                    </div>
                  </div>
                )}
              </div>
              <div>
                {reviews.length ? reviews.map(r => (
                  <div key={r._id} className="pf-review-row">
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {r.reviewer?.name?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{r.reviewer?.name}</p>
                        <div style={{ display: 'flex', color: '#FCD34D' }}>
                          {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        </div>
                      </div>
                      {r.skillExchanged && (
                        <p style={{ fontSize: 11, color: '#475569', marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>{r.skillExchanged.offered} ↔ {r.skillExchanged.received}</p>
                      )}
                      <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{r.comment}</p>
                      {r.response?.text && (
                        <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid rgba(124,58,237,0.4)' }}>
                          <p style={{ fontSize: 11, color: '#A78BFA', fontWeight: 600, marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif" }}>Response from {profile.name}:</p>
                          <p style={{ fontSize: 12, color: '#64748B' }}>{r.response.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )) : <p style={{ padding: 32, textAlign: 'center', color: '#475569', fontSize: 13 }}>No reviews yet</p>}
              </div>
            </div>
          )}

          {/* ── Achievements Tab ───────────────────────────────────── */}
          {activeTab === 'achievements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16, animation: 'fadeInUp 0.4s ease both' }}>
              {profile.achievements?.length ? profile.achievements.map((a, i) => {
                const tc = tier(a.achievementId?.tier);
                return (
                  <div key={a.achievementId?._id} className="glass pf-achv-card" style={{ animation: `fadeInUp 0.4s ${Math.min(i, 8) * 0.05}s ease both` }}>
                    <div style={{ fontSize: 38, marginBottom: 10 }}>{a.achievementId?.icon}</div>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#F1F5F9' }}>{a.achievementId?.name}</p>
                    <p style={{ fontSize: 11, color: '#64748B', marginTop: 6, lineHeight: 1.5 }}>{a.achievementId?.description}</p>
                    <span className="pf-level-pill" style={{ marginTop: 12, display: 'inline-block', background: tc.bg, border: `1px solid ${tc.border}`, color: tc.text }}>{a.achievementId?.tier}</span>
                  </div>
                );
              }) : <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: '#475569' }}>No achievements yet</div>}
            </div>
          )}

          {/* ── Progress Tab ───────────────────────────────────────── */}
          {activeTab === 'progress' && (
            <div className="glass" style={{ padding: 26, animation: 'fadeInUp 0.4s ease both' }}>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#F1F5F9', marginBottom: 18 }}>Learning Progress</h3>
              {profile.learningProgress?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {profile.learningProgress.map(lp => (
                    <div key={lp._id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13, color: '#E2E8F0' }}>{lp.skillName}</span>
                        <span style={{ fontSize: 13, color: '#A78BFA', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{lp.progressPercent}%</span>
                      </div>
                      <div className="pf-progress-track"><div className="pf-progress-fill" style={{ width: `${lp.progressPercent}%` }} /></div>
                      <p style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>{lp.sessionsCompleted} sessions completed</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: '#475569', fontSize: 13 }}>No learning progress tracked yet</p>}
            </div>
          )}

          {/* Exchange Request Modal */}
          <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title="Send Exchange Request">
            <form onSubmit={handleSendRequest} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: '#020010' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover' }} />
                  : <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{profile.name?.[0]}</div>
                }
                <div>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9' }}>{profile.name}</p>
                  <p style={{ fontSize: 12, color: '#64748B' }}>{profile.skillsOffered?.length} skills offered</p>
                </div>
              </div>

              <div>
                <label className="pf-label">Skill You'll Offer</label>
                <select value={form.skillOffered} onChange={e => setForm({ ...form, skillOffered: e.target.value })} className="pf-select" required>
                  <option value="">Select your skill...</option>
                  {(currentUser?.skillsOffered || []).map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                {!currentUser?.skillsOffered?.length && (
                  <p style={{ fontSize: 12, color: '#FCD34D', marginTop: 8 }}>Add skills to your profile first. <Link to="/profile/edit" style={{ textDecoration: 'underline', color: '#FCD34D' }}>Edit Profile</Link></p>
                )}
              </div>

              <div>
                <label className="pf-label">Skill You Want in Return</label>
                <select value={form.skillWanted} onChange={e => setForm({ ...form, skillWanted: e.target.value })} className="pf-select" required>
                  <option value="">Select desired skill...</option>
                  {profile.skillsOffered?.map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="pf-label">Exchange Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['online', 'in-person'].map(t => (
                    <button type="button" key={t} onClick={() => setForm({ ...form, exchangeType: t })} className={`pf-type-btn ${form.exchangeType === t ? 'active' : ''}`}>
                      {t === 'online' ? '💻 Online' : '📍 In-Person'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="pf-label">Personal Message (optional)</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={3} placeholder="Tell them why you'd like to exchange..." className="pf-textarea" />
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                <button type="button" onClick={() => setRequestModal(false)} className="pf-ghost-btn">Cancel</button>
                <button type="submit" disabled={sending} className="pf-submit-btn">
                  {sending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Request 🤝'}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default Profile;