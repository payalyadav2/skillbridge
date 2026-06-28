import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Trophy, Crown, Zap, Star, Lock, ChevronUp } from 'lucide-react';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';

/* ─── Tier Config ───────────────────────────────────────────────────────── */
const TIER_CONFIG = {
  bronze:   { color: '#CD7F32', glow: '#CD7F3240', gradient: 'linear-gradient(135deg, #CD7F32, #A0522D)', label: 'Bronze' },
  silver:   { color: '#C0C0C0', glow: '#C0C0C040', gradient: 'linear-gradient(135deg, #C0C0C0, #808080)', label: 'Silver' },
  gold:     { color: '#FFD700', glow: '#FFD70050', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)', label: 'Gold' },
  platinum: { color: '#06B6D4', glow: '#06B6D440', gradient: 'linear-gradient(135deg, #06B6D4, #0284C7)', label: 'Platinum' },
  diamond:  { color: '#A78BFA', glow: '#A78BFA50', gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)', label: 'Diamond' },
};

const CAT_ICONS = {
  exchange: '🤝', learning: '📚', social: '👥', milestone: '🎯', other: '🌟',
};

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function Counter({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const numeric = parseInt(String(value).replace(/\D/g, '')) || 0;
        const steps = 50;
        let cur = 0;
        const timer = setInterval(() => {
          cur += numeric / steps;
          if (cur >= numeric) { setCount(numeric); clearInterval(timer); }
          else setCount(Math.floor(cur));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ─── Achievement Card ──────────────────────────────────────────────────── */
const AchievementCard = ({ achievement }) => {
  const tier = TIER_CONFIG[achievement.tier] || TIER_CONFIG.bronze;
  const earned = achievement.isEarned;

  return (
    <div style={{
      position: 'relative',
      background: earned
        ? `radial-gradient(circle at top left, ${tier.glow}, rgba(2,0,16,0.9))`
        : 'rgba(255,255,255,0.02)',
      border: earned ? `1px solid ${tier.color}50` : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20,
      padding: 20,
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      filter: earned ? 'none' : 'grayscale(0.8)',
      opacity: earned ? 1 : 0.5,
      cursor: 'default',
      backdropFilter: 'blur(16px)',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      if (!earned) return;
      e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
      e.currentTarget.style.boxShadow = `0 20px 60px ${tier.glow}, 0 0 0 1px ${tier.color}40`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Shimmer bg on earned */}
      {earned && (
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${tier.color}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
      )}

      {/* Earned tick */}
      {earned && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: 'white', fontWeight: 700,
          boxShadow: '0 0 12px rgba(16,185,129,0.6)',
        }}>✓</div>
      )}

      {/* Lock icon on not earned */}
      {!earned && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <Lock size={14} color="#475569" />
        </div>
      )}

      {/* Icon */}
      <div style={{
        fontSize: 38, marginBottom: 12, display: 'inline-block',
        filter: earned ? `drop-shadow(0 0 12px ${tier.color}80)` : 'none',
        transition: 'filter 0.3s',
      }}>{achievement.icon}</div>

      <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: earned ? '#F1F5F9' : '#64748B', marginBottom: 6 }}>
        {achievement.name}
      </h4>
      <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
        {achievement.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1,
          background: tier.gradient,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif",
        }}>{tier.label}</span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: earned ? '#A78BFA' : '#334155',
          fontFamily: "'JetBrains Mono', monospace",
        }}>+{achievement.pointsReward} pts</span>
      </div>

      {earned && achievement.earnedAt && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: '#475569' }}>
          Earned {new Date(achievement.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </div>
  );
};

/* ─── Rank Medal ────────────────────────────────────────────────────────── */
function RankMedal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: 22 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 22 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 22 }}>🥉</span>;
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#64748B' }}>#{rank}</span>;
}

/* ─── Main Component ────────────────────────────────────────────────────── */
const Achievements = () => {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('achievements');
  const [filterTier, setFilterTier] = useState('all');

  useEffect(() => {
    Promise.all([
      api.get('/achievements'),
      api.get('/achievements/leaderboard'),
    ]).then(([achRes, lbRes]) => {
      setData(achRes.data.data);
      setLeaderboard(lbRes.data.data.leaderboard || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { achievements, userPoints, userLevel, earnedCount, totalCount } = data;
  const earnedPercent = Math.round((earnedCount / Math.max(totalCount, 1)) * 100);
  const levelProgress = (userPoints % 500) / 500 * 100;
  const myRank = leaderboard.findIndex(u => u._id === user?._id) + 1;

  const filtered = filterTier === 'all'
    ? achievements
    : achievements.filter(a => a.tier === filterTier);

  const grouped = filtered.reduce((acc, a) => {
    const cat = a.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

        .ach-page { background: #020010; min-height: 100vh; padding: 32px 24px 80px; font-family: 'Inter', sans-serif; color: #F8FAFC; }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.3); }
          50%       { box-shadow: 0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerBar {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: translateY(0) rotate(360deg); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        .ach-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          backdrop-filter: blur(16px);
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease both;
        }
        .ach-stat-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(124,58,237,0.4);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(124,58,237,0.15);
        }

        .tab-btn {
          flex: 1; padding: 10px 16px; border: none; cursor: pointer;
          border-radius: 12px; font-size: 14px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.25s ease;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #7C3AED, #06B6D4);
          color: white;
          box-shadow: 0 0 20px rgba(124,58,237,0.4);
        }
        .tab-btn:not(.active) {
          background: transparent;
          color: #64748B;
        }
        .tab-btn:not(.active):hover { color: #A78BFA; background: rgba(124,58,237,0.1); }

        .tier-pill {
          padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease; border: 1px solid;
          font-family: 'Space Grotesk', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;
        }

        .progress-bar {
          height: 8px; border-radius: 50px; overflow: hidden;
          background: rgba(255,255,255,0.06);
        }
        .progress-fill {
          height: 100%; border-radius: 50px;
          background: linear-gradient(90deg, #7C3AED, #06B6D4, #EC4899, #7C3AED);
          background-size: 200% auto;
          animation: shimmerBar 3s linear infinite;
          transition: width 1s ease;
        }

        .lb-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 20px; transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .lb-row:last-child { border-bottom: none; }
        .lb-row:hover { background: rgba(255,255,255,0.03); }
        .lb-row.is-me { background: rgba(124,58,237,0.12); border-left: 3px solid #7C3AED; }

        .section-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4);
          border-radius: 50px; padding: 5px 14px; font-size: 11px;
          font-weight: 600; color: #A78BFA; letter-spacing: 1px;
          text-transform: uppercase; font-family: 'Space Grotesk', sans-serif;
        }

        .trophy-glow {
          filter: drop-shadow(0 0 16px rgba(255,215,0,0.8));
          animation: floatBadge 3s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .ach-page { padding: 20px 16px 60px; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="ach-page">
        {/* ── Background orbs ───────────────────────────────────────────── */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 40, animation: 'fadeInUp 0.6s ease both' }}>
            <div className="section-tag" style={{ marginBottom: 16 }}>
              <Trophy size={12} /> Achievements
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span className="trophy-glow" style={{ fontSize: 48 }}>🏆</span>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #F8FAFC, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Your Achievements
                </h1>
                <p style={{ color: '#64748B', fontSize: 15, marginTop: 4 }}>Unlock badges as you exchange skills and grow your community</p>
              </div>
            </div>
          </div>

          {/* ── Stats Grid ──────────────────────────────────────────────── */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Points', value: userPoints, suffix: '', color: '#A78BFA', icon: '⚡', delay: '0s' },
              { label: 'Your Level', value: `Lv.${userLevel}`, suffix: '', color: '#FFD700', icon: '👑', delay: '0.1s', raw: true },
              { label: 'Badges Earned', value: `${earnedCount}/${totalCount}`, suffix: '', color: '#10B981', icon: '🏅', delay: '0.2s', raw: true },
              { label: 'Leaderboard', value: myRank ? `#${myRank}` : '—', suffix: '', color: '#06B6D4', icon: '📊', delay: '0.3s', raw: true },
            ].map((s) => (
              <div key={s.label} className="ach-stat-card" style={{ animationDelay: s.delay }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700,
                  background: `linear-gradient(135deg, ${s.color}, white)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  marginBottom: 6,
                }}>
                  {s.raw ? s.value : <Counter value={s.value} />}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Level Progress ───────────────────────────────────────────── */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 28, backdropFilter: 'blur(16px)', animation: 'fadeInUp 0.6s 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#F1F5F9' }}>Level {userLevel}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{500 - (userPoints % 500)} points to Level {userLevel + 1}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#A78BFA' }}>{userPoints % 500} / 500</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>this level</div>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
            </div>

            {/* Tier badges row */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {Object.entries(TIER_CONFIG).map(([tier, cfg]) => {
                const earned = achievements.filter(a => a.tier === tier && a.isEarned).length;
                const total = achievements.filter(a => a.tier === tier).length;
                return (
                  <div key={tier} style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 50,
                    background: `${cfg.color}15`, border: `1px solid ${cfg.color}40`,
                    color: cfg.color, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: 0.5,
                  }}>
                    {earned}/{total} {cfg.label}
                  </div>
                );
              })}
              <div style={{ marginLeft: 'auto', fontSize: 11, color: '#64748B', fontFamily: "'JetBrains Mono', monospace", alignSelf: 'center' }}>
                {earnedPercent}% complete
              </div>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 6, marginBottom: 28 }}>
            {[['achievements', '🏆 Badges'], ['leaderboard', '👑 Leaderboard']].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`}>
                {l}
              </button>
            ))}
          </div>

          {/* ── Achievements Tab ─────────────────────────────────────────── */}
          {activeTab === 'achievements' && (
            <div>
              {/* Tier filter pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterTier('all')}
                  className="tier-pill"
                  style={{
                    background: filterTier === 'all' ? 'rgba(124,58,237,0.3)' : 'transparent',
                    borderColor: filterTier === 'all' ? '#7C3AED' : 'rgba(255,255,255,0.1)',
                    color: filterTier === 'all' ? '#A78BFA' : '#64748B',
                  }}
                >All</button>
                {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
                  <button
                    key={tier}
                    onClick={() => setFilterTier(tier)}
                    className="tier-pill"
                    style={{
                      background: filterTier === tier ? `${cfg.color}25` : 'transparent',
                      borderColor: filterTier === tier ? cfg.color : 'rgba(255,255,255,0.1)',
                      color: filterTier === tier ? cfg.color : '#64748B',
                    }}
                  >{cfg.label}</button>
                ))}
              </div>

              {/* Grouped achievements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {Object.entries(grouped).map(([category, items]) => {
                  const catEarned = items.filter(a => a.isEarned).length;
                  return (
                    <div key={category}>
                      {/* Category header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <span style={{ fontSize: 24 }}>{CAT_ICONS[category] || '🌟'}</span>
                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>
                          {category.charAt(0).toUpperCase() + category.slice(1)} Achievements
                        </h3>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', fontFamily: "'JetBrains Mono', monospace" }}>
                          {catEarned}/{items.length}
                        </span>
                        {/* Mini progress */}
                        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 50, overflow: 'hidden', maxWidth: 120 }}>
                          <div style={{ height: '100%', background: 'linear-gradient(90deg, #7C3AED, #06B6D4)', borderRadius: 50, width: `${(catEarned / items.length) * 100}%`, transition: 'width 1s ease' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                        {items.map(a => <AchievementCard key={a._id} achievement={a} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Leaderboard Tab ──────────────────────────────────────────── */}
          {activeTab === 'leaderboard' && (
            <div>
              {/* Top 3 podium */}
              {leaderboard.length >= 3 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 40, padding: '32px 0' }}>
                  {[1, 0, 2].map((pos) => {
                    const u = leaderboard[pos];
                    if (!u) return null;
                    const heights = [120, 160, 100];
                    const colors = ['#C0C0C0', '#FFD700', '#CD7F32'];
                    const rank = pos + 1;
                    const isMe = u._id === user?._id;
                    return (
                      <div key={u._id} style={{ textAlign: 'center', flex: '0 0 auto' }}>
                        <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
                          <div style={{ width: pos === 0 ? 72 : 56, height: pos === 0 ? 72 : 56, borderRadius: '50%', background: `linear-gradient(135deg, ${colors[pos]}40, ${colors[pos]}20)`, border: `2px solid ${colors[pos]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: pos === 0 ? 28 : 22, fontWeight: 700, color: '#F8FAFC', fontFamily: 'Space Grotesk', margin: '0 auto 8px', boxShadow: `0 0 20px ${colors[pos]}40` }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: pos === 0 ? 20 : 16, position: 'absolute', top: -8, right: -8 }}>
                            {['🥇','🥈','🥉'][pos]}
                          </span>
                        </div>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: pos === 0 ? 14 : 12, fontWeight: 700, color: isMe ? '#A78BFA' : '#CBD5E1', marginBottom: 4 }}>
                          {u.name}{isMe ? ' 👈' : ''}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: colors[pos], fontWeight: 700 }}>{u.points?.toLocaleString()} pts</div>
                        {/* Podium block */}
                        <div style={{ marginTop: 12, width: pos === 0 ? 80 : 64, height: heights[pos], background: `linear-gradient(180deg, ${colors[pos]}30, ${colors[pos]}10)`, border: `1px solid ${colors[pos]}30`, borderRadius: '8px 8px 0 0', margin: '12px auto 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: colors[pos], fontWeight: 700 }}>#{rank}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Crown size={18} color="#FFD700" />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15 }}>Community Leaderboard</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748B' }}>{leaderboard.length} members</span>
                </div>

                {leaderboard.map((u, i) => {
                  const isMe = u._id === user?._id;
                  const rank = i + 1;
                  return (
                    <div key={u._id} className={`lb-row ${isMe ? 'is-me' : ''}`}>
                      {/* Rank */}
                      <div style={{ width: 40, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        <RankMedal rank={rank} />
                      </div>

                      {/* Avatar */}
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg, #7C3AED, #06B6D4)' : 'linear-gradient(135deg, #1E293B, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0, boxShadow: isMe ? '0 0 16px rgba(124,58,237,0.5)' : 'none', overflow: 'hidden' }}>
                        {u.avatar
                          ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : u.name?.[0]?.toUpperCase()
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: isMe ? '#A78BFA' : '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name} {isMe && <span style={{ fontSize: 11, color: '#7C3AED' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                          Lv.{u.level} · {u.totalExchanges} exchanges
                        </div>
                      </div>

                      {/* Points */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: isMe ? '#A78BFA' : '#94A3B8' }}>
                          {u.points?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>points</div>
                      </div>

                      {/* Level bar */}
                      <div style={{ width: 60, flexShrink: 0 }}>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 50, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: isMe ? 'linear-gradient(90deg, #7C3AED, #06B6D4)' : 'rgba(100,116,139,0.5)', borderRadius: 50, width: `${Math.min((u.level / 20) * 100, 100)}%` }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#334155', marginTop: 3, textAlign: 'center' }}>Lv.{u.level}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {myRank > 10 && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '10px 20px' }}>
                    <ChevronUp size={14} color="#A78BFA" />
                    <span style={{ fontSize: 13, color: '#A78BFA', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                      You are ranked #{myRank} — keep exchanging to climb up!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Achievements;