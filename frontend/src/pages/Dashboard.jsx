import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Star, Calendar, Users, Zap, Trophy, AlertCircle, Sparkles, Search, MessageSquare, MapPin } from 'lucide-react';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .dash-page { background:#020010; min-height:100vh; padding:32px 24px 80px; font-family:'Inter',sans-serif; color:#F8FAFC; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 18px rgba(124,58,237,0.3)}
    50%{box-shadow:0 0 36px rgba(124,58,237,0.65),0 0 70px rgba(6,182,212,0.25)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
  @keyframes shimmerBar { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes onlinePulse {
    0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.6)}
    50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}
  }
  @keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; backdrop-filter:blur(20px); transition:all 0.3s ease; }
  .glass-hover:hover { background:rgba(255,255,255,0.07); border-color:rgba(124,58,237,0.35); transform:translateY(-3px); box-shadow:0 16px 50px rgba(124,58,237,0.18); }

  .stat-card {
    padding:22px; display:flex; align-items:flex-start; justify-content:space-between;
    cursor:default; position:relative; overflow:hidden;
  }
  .stat-icon {
    width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center;
    flex-shrink:0; box-shadow:0 0 20px var(--glow);
  }

  .banner-gradient {
    background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(6,182,212,0.18));
    border:1px solid rgba(124,58,237,0.35); border-radius:20px; padding:20px 24px;
    display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
    position:relative; overflow:hidden;
  }
  .banner-gradient::before {
    content:''; position:absolute; top:0; left:-100%; width:60%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
    animation:shimmerBar 5s linear infinite; background-size:200% 100%;
  }

  .neon-btn-sm {
    display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#7C3AED,#06B6D4);
    color:#fff; border:none; border-radius:50px; padding:9px 18px; font-weight:700; font-size:13px;
    cursor:pointer; font-family:'Space Grotesk',sans-serif; box-shadow:0 0 20px rgba(124,58,237,0.45);
    transition:all 0.25s ease; white-space:nowrap;
  }
  .neon-btn-sm:hover { transform:translateY(-2px); box-shadow:0 0 32px rgba(124,58,237,0.7); }

  .ghost-btn {
    display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.12); color:#A78BFA; border-radius:50px; padding:9px 18px;
    font-weight:600; font-size:13px; cursor:pointer; font-family:'Space Grotesk',sans-serif;
    transition:all 0.2s ease;
  }
  .ghost-btn:hover { background:rgba(124,58,237,0.15); border-color:rgba(124,58,237,0.4); }

  .session-row, .match-row, .review-row {
    display:flex; align-items:center; gap:14px; padding:16px 22px; transition:background 0.2s ease;
    border-bottom:1px solid rgba(255,255,255,0.05); text-decoration:none;
  }
  .session-row:last-child, .match-row:last-child, .review-row:last-child { border-bottom:none; }
  .session-row:hover, .match-row:hover { background:rgba(124,58,237,0.07); }

  .qa-row {
    display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px;
    transition:all 0.2s ease; text-decoration:none;
  }
  .qa-row:hover { background:rgba(124,58,237,0.12); transform:translateX(4px); }

  .section-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(124,58,237,0.2); border:1px solid rgba(124,58,237,0.4); border-radius:50px; padding:5px 14px; font-size:11px; font-weight:600; color:#A78BFA; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk',sans-serif; }

  .match-badge {
    font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700;
    background:linear-gradient(135deg,#A78BFA,#06B6D4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .online-dot-dash {
    position:absolute; bottom:-1px; right:-1px; width:11px; height:11px; border-radius:50%;
    background:#10B981; border:2px solid #020010; animation:onlinePulse 2s infinite;
  }

  .progress-track { width:100%; background:rgba(255,255,255,0.07); border-radius:50px; height:10px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:50px; background:linear-gradient(90deg,#7C3AED,#06B6D4,#7C3AED); background-size:200% 100%; animation:shimmerBar 3s linear infinite; box-shadow:0 0 12px rgba(124,58,237,0.6); transition:width 0.6s ease; }

  .pending-pill {
    width:42px; height:42px; border-radius:14px; background:linear-gradient(135deg,#7C3AED,#06B6D4);
    display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700;
    font-family:'JetBrains Mono',monospace; box-shadow:0 0 18px rgba(124,58,237,0.5); flex-shrink:0;
  }

  .verify-banner { background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:16px; padding:14px 18px; display:flex; align-items:center; gap:12px; }

  @media (max-width:1024px) { .dash-grid { grid-template-columns:1fr !important; } }
  @media (max-width:640px) { .dash-page{padding:20px 14px 60px} .stat-grid { grid-template-columns:repeat(2,1fr) !important; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const STAT_GLOW = {
  primary: { glow: 'rgba(124,58,237,0.45)', bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.4)', text: '#A78BFA' },
  green:   { glow: 'rgba(16,185,129,0.4)',  bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', text: '#34D399' },
  amber:   { glow: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', text: '#FCD34D' },
  cyan:    { glow: 'rgba(6,182,212,0.4)',   bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.35)', text: '#22D3EE' },
};

const StatCard = ({ icon, label, value, sub, color = 'primary', href, index }) => {
  const c = STAT_GLOW[color];
  const card = (
    <div className="glass glass-hover stat-card" style={{ animation: `fadeInUp 0.5s ${index * 0.08}s ease both` }}>
      <div>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, letterSpacing: 0.3 }}>{label}</p>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: '#F8FAFC', animation: 'countUp 0.5s ease both' }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{sub}</p>}
      </div>
      <div className="stat-icon" style={{ '--glow': c.glow, background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>{icon}</div>
    </div>
  );
  return href ? <Link to={href} style={{ textDecoration: 'none' }}>{card}</Link> : card;
};

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/users/dashboard'),
      api.get('/users/matches?limit=4'),
    ]).then(([dashRes, matchRes]) => {
      setData(dashRes.data.data);
      setMatches(matchRes.data.data.matches || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  const { stats, upcomingSessions, recentReviews, profileCompleteness } = data || {};

  const QUICK_ACTIONS = [
    { icon: <Sparkles size={16} />, label: 'AI Recommendations', href: '/ai', color: '#A78BFA', bg: 'rgba(124,58,237,0.18)' },
    { icon: <Search size={16} />, label: 'Find Matches', href: '/skills', color: '#22D3EE', bg: 'rgba(6,182,212,0.18)' },
    { icon: <MessageSquare size={16} />, label: 'Open Chat', href: '/chat', color: '#34D399', bg: 'rgba(16,185,129,0.18)' },
    { icon: <MapPin size={16} />, label: 'Nearby Users', href: '/nearby', color: '#FB923C', bg: 'rgba(251,146,60,0.18)' },
    { icon: <Trophy size={16} />, label: 'Achievements', href: '/achievements', color: '#FCD34D', bg: 'rgba(245,158,11,0.18)' },
  ];

  const levelPct = ((stats?.points ?? 0) % 500) / 5;

  return (
    <>
      <style>{STYLES}</style>
      <div className="dash-page">
        {/* BG orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.16) 0%,transparent 70%)', animation: 'orb1 15s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'orb2 18s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16, animation: 'fadeInUp 0.5s ease both' }}>
            <div>
              <div className="section-tag" style={{ marginBottom: 12 }}><Zap size={12} /> Dashboard</div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
                <span style={{ background: 'linear-gradient(135deg,#A78BFA,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {user?.name?.split(' ')[0]}
                </span>{' '}👋
              </h1>
              <p style={{ color: '#64748B', fontSize: 14, marginTop: 6 }}>Your skill exchange overview</p>
            </div>
            <Link to="/skills" className="neon-btn-sm">
              Browse Skills <ArrowRight size={15} />
            </Link>
          </div>

          {/* Profile completeness banner */}
          {profileCompleteness < 100 && (
            <div className="banner-gradient" style={{ marginBottom: 20, animation: 'fadeInUp 0.5s 0.05s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                <AlertCircle size={20} color="#A78BFA" />
                <div>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9' }}>Profile is {profileCompleteness}% complete</p>
                  <p style={{ fontSize: 13, color: '#94A3B8' }}>Complete your profile for better matches</p>
                </div>
              </div>
              <Link to="/profile/edit" className="neon-btn-sm" style={{ position: 'relative', zIndex: 1 }}>Complete</Link>
            </div>
          )}

          {/* Email verify banner */}
          {!user?.isEmailVerified && (
            <div className="verify-banner" style={{ marginBottom: 20, animation: 'fadeInUp 0.5s 0.08s ease both' }}>
              <AlertCircle size={18} color="#FCD34D" />
              <p style={{ fontSize: 13, color: '#FCD34D', flex: 1 }}>Please verify your email to unlock all features.</p>
            </div>
          )}

          {/* Stat cards */}
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            <StatCard index={0} icon={<Zap size={20} />} label="Total Exchanges" value={stats?.totalExchanges ?? 0} sub="Completed" color="primary" href="/exchanges" />
            <StatCard index={1} icon={<Calendar size={20} />} label="Sessions Done" value={stats?.totalSessions ?? 0} sub="Learning sessions" color="green" href="/sessions" />
            <StatCard index={2} icon={<Star size={20} />} label="Your Rating" value={stats?.averageRating ? `${stats.averageRating}★` : 'N/A'} sub={`${stats?.totalReviews ?? 0} reviews`} color="amber" />
            <StatCard index={3} icon={<Trophy size={20} />} label="Points" value={stats?.points ?? 0} sub={`Level ${stats?.level ?? 1}`} color="cyan" href="/achievements" />
          </div>

          {/* Pending requests */}
          {stats?.pendingRequests > 0 && (
            <Link to="/exchanges?status=pending" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
              <div className="glass glass-hover" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, animation: 'fadeInUp 0.5s 0.1s ease both' }}>
                <div className="pending-pill">{stats.pendingRequests}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9' }}>
                    {stats.pendingRequests} pending exchange request{stats.pendingRequests > 1 ? 's' : ''}
                  </p>
                  <p style={{ fontSize: 12, color: '#A78BFA' }}>Tap to review and respond</p>
                </div>
                <ArrowRight size={16} color="#A78BFA" />
              </div>
            </Link>
          )}

          {/* Main grid */}
          <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Upcoming sessions */}
              <div className="glass" style={{ overflow: 'hidden', animation: 'fadeInUp 0.5s 0.12s ease both' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={17} color="#A78BFA" /> Upcoming Sessions
                  </h2>
                  <Link to="/sessions" style={{ fontSize: 12, color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>View all</Link>
                </div>
                <div>
                  {upcomingSessions?.length ? upcomingSessions.map(session => (
                    <Link key={session._id} to="/sessions" className="session-row">
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{new Date(session.scheduledAt).toLocaleDateString('en', { month: 'short' })}</span>
                        <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" }}>{new Date(session.scheduledAt).getDate()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</p>
                        <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          {new Date(session.scheduledAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })} · {session.duration}min
                        </p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#A78BFA', fontFamily: "'Space Grotesk',sans-serif", flexShrink: 0 }}>{session.type}</span>
                    </Link>
                  )) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <Calendar size={30} color="#334155" style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: '#64748B', fontSize: 13 }}>No upcoming sessions</p>
                      <Link to="/exchanges" className="neon-btn-sm" style={{ marginTop: 14, display: 'inline-flex' }}>Schedule One</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent reviews */}
              {recentReviews?.length > 0 && (
                <div className="glass" style={{ overflow: 'hidden', animation: 'fadeInUp 0.5s 0.16s ease both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Star size={17} color="#FCD34D" /> Recent Reviews
                    </h2>
                    <Link to={"/profile/" + user?._id} style={{ fontSize: 12, color: '#A78BFA', textDecoration: 'none', fontWeight: 600 }}>View all</Link>
                  </div>
                  <div>
                    {recentReviews.map(review => (
                      <div key={review._id} className="review-row">
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {review.reviewer?.name?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13, color: '#F1F5F9' }}>{review.reviewer?.name}</p>
                            <div style={{ display: 'flex', color: '#FCD34D' }}>
                              {[...Array(review.rating)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                            </div>
                          </div>
                          <p style={{ fontSize: 13, color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Quick actions */}
              <div className="glass" style={{ padding: 20, animation: 'fadeInUp 0.5s 0.14s ease both' }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9', marginBottom: 12 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {QUICK_ACTIONS.map(a => (
                    <Link key={a.href} to={a.href} className="qa-row">
                      <span style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.bg, color: a.color, flexShrink: 0 }}>{a.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1', fontFamily: "'Space Grotesk',sans-serif" }}>{a.label}</span>
                      <ArrowRight size={13} color="#334155" style={{ marginLeft: 'auto' }} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top matches */}
              {matches.length > 0 && (
                <div className="glass" style={{ overflow: 'hidden', animation: 'fadeInUp 0.5s 0.18s ease both' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={15} color="#A78BFA" /> Top Matches
                    </h3>
                  </div>
                  <div>
                    {matches.slice(0, 4).map(match => (
                      <Link key={match._id} to={"/profile/" + match._id} className="match-row">
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          {match.avatar
                            ? <img src={match.avatar} alt={match.name} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover' }} />
                            : <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{match.name?.[0]}</div>
                          }
                          {match.isOnline && <span className="online-dot-dash" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.name}</p>
                          <p style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.matchReasons?.[0] || match.skillsOffered?.[0]?.name}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="match-badge">{match.matchScore}%</div>
                          <div style={{ fontSize: 10, color: '#475569' }}>match</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div style={{ padding: 14 }}>
                    <Link to="/skills" className="ghost-btn" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>View All</Link>
                  </div>
                </div>
              )}

              {/* Level progress */}
              <div className="glass" style={{ padding: 22, animation: 'fadeInUp 0.5s 0.2s ease both' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#F1F5F9' }}>Level {stats?.level ?? 1}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 50, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#A78BFA', fontFamily: "'JetBrains Mono',monospace" }}>
                    🏆 {stats?.points ?? 0} pts
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${levelPct}%` }} />
                </div>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 10 }}>
                  {500 - ((stats?.points ?? 0) % 500)} pts to Level {(stats?.level ?? 1) + 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;