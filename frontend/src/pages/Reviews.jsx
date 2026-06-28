import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';

const StarRating = ({ rating, size = 14, interactive = false, onChange }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg
        key={i}
        width={size} height={size} viewBox="0 0 24 24"
        style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.15s' }}
        onClick={() => interactive && onChange && onChange(i)}
        onMouseEnter={e => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
        onMouseLeave={e => interactive && (e.currentTarget.style.transform = 'scale(1)')}
      >
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill={i <= rating ? '#f59e0b' : 'none'}
          stroke={i <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

const Reviews = () => {
  const { user } = useSelector(s => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');
  const [stats, setStats] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const orb1 = useRef(null);
  const orb2 = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/reviews/user/${user._id}?limit=20`).then(({ data }) => {
      setReviews(data.data || []);
      setStats(data.stats);
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const onMove = e => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (orb1.current) orb1.current.style.transform = `translate(${x * 50 - 25}px, ${y * 50 - 25}px)`;
      if (orb2.current) orb2.current.style.transform = `translate(${-x * 35 + 17}px, ${-y * 35 + 17}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const received = reviews.filter(r => r.reviewee?._id === user?._id || !r.reviewee);
  const given = reviews.filter(r => r.reviewer?._id === user?._id);
  const displayed = tab === 'received' ? received : given;

  if (loading) return <PageLoader />;

  const avgRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .rv-root {
          min-height: 100vh;
          background: #020010;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 2rem 1rem 4rem;
        }

        .rv-orb {
          position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0;
          transition: transform 1s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .rv-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top: -150px; right: -150px; }
        .rv-orb-2 { width: 450px; height: 450px; background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%); bottom: -100px; left: -100px; }

        .rv-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .rv-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

        /* Header */
        .rv-header { margin-bottom: 2rem; animation: fadeUp 0.5s ease both; }
        .rv-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(245,158,11,0.7); margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; }
        .rv-title { font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.03em; margin-bottom: 6px; }
        .rv-sub { font-size: 14px; color: rgba(255,255,255,0.4); }

        /* Stats card */
        .rv-stats-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.75rem;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(20px);
          position: relative; overflow: hidden;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .rv-stats-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent);
        }
        .rv-stats-grid { display: grid; grid-template-columns: auto 1fr; gap: 1.5rem; align-items: center; }
        @media (max-width: 560px) { .rv-stats-grid { grid-template-columns: 1fr; } }

        .rv-big-score { text-align: center; }
        .rv-score-num {
          font-size: 64px; font-weight: 700; color: white; letter-spacing: -0.05em; line-height: 1;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .rv-score-stars { display: flex; justify-content: center; margin: 6px 0 4px; }
        .rv-score-label { font-size: 12px; color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono', monospace; }

        .rv-bars { display: flex; flex-direction: column; gap: 6px; }
        .rv-bar-row { display: flex; align-items: center; gap: 8px; }
        .rv-bar-num { font-size: 11px; color: rgba(255,255,255,0.4); width: 8px; font-family: 'JetBrains Mono', monospace; }
        .rv-bar-track { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
        .rv-bar-fill { height: 4px; border-radius: 2px; background: linear-gradient(90deg, #f59e0b, #fbbf24); transition: width 1s cubic-bezier(0.34,1.56,0.64,1); }
        .rv-bar-count { font-size: 11px; color: rgba(255,255,255,0.3); width: 20px; text-align: right; font-family: 'JetBrains Mono', monospace; }

        /* Sub ratings */
        .rv-sub-ratings {
          display: flex; flex-wrap: wrap; gap: 8px; margin-top: 1.25rem; padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .rv-sub-tag {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 50px; padding: 5px 12px;
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: rgba(255,255,255,0.5);
        }
        .rv-sub-tag strong { color: rgba(255,255,255,0.8); font-weight: 500; }

        /* Tabs */
        .rv-tabs {
          display: flex; gap: 4px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 4px; margin-bottom: 1.5rem;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .rv-tab {
          flex: 1; padding: 9px; border-radius: 9px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 500; font-family: 'Space Grotesk', sans-serif;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: transparent; color: rgba(255,255,255,0.4);
        }
        .rv-tab.active {
          background: rgba(99,102,241,0.2); color: white;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.3);
        }
        .rv-tab-badge {
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.1); border-radius: 50px; padding: 1px 7px;
          color: rgba(255,255,255,0.4);
        }
        .rv-tab.active .rv-tab-badge { background: rgba(99,102,241,0.3); color: rgba(255,255,255,0.7); }

        /* Review cards */
        .rv-list { display: flex; flex-direction: column; gap: 12px; }

        .rv-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.25rem;
          backdrop-filter: blur(16px);
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          animation: fadeUp 0.4s ease both;
          position: relative; overflow: hidden;
        }
        .rv-card:hover {
          border-color: rgba(99,102,241,0.2); transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1);
        }
        .rv-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        }

        .rv-card-row { display: flex; align-items: flex-start; gap: 14px; }
        .rv-avatar-link { flex-shrink: 0; }
        .rv-avatar {
          width: 44px; height: 44px; border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 18px; color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .rv-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .rv-card-body { flex: 1; min-width: 0; }
        .rv-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
        .rv-reviewer-name {
          font-size: 14px; font-weight: 600; color: white;
          text-decoration: none; transition: color 0.15s;
        }
        .rv-reviewer-name:hover { color: #818cf8; }
        .rv-card-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
        .rv-date { font-size: 11px; color: rgba(255,255,255,0.25); font-family: 'JetBrains Mono', monospace; }

        .rv-exchange-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px; padding: 3px 8px; margin-top: 6px;
        }
        .rv-exchange-tag span { color: rgba(99,102,241,0.8); }

        .rv-comment { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.65; margin-top: 10px; }

        .rv-response {
          margin-top: 12px; padding: 10px 14px;
          background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px; border-left: 3px solid rgba(99,102,241,0.5);
        }
        .rv-response-label { font-size: 11px; color: rgba(99,102,241,0.7); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 4px; }
        .rv-response-text { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.55; }

        /* Rating display top-right */
        .rv-rating-chip {
          display: flex; align-items: center; gap: 5px; flex-shrink: 0;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.15);
          border-radius: 8px; padding: 4px 10px;
          font-size: 13px; font-weight: 600; color: #fbbf24;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Empty state */
        .rv-empty {
          text-align: center; padding: 4rem 1rem;
          animation: fadeUp 0.5s ease both;
        }
        .rv-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.15);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;
        }
        .rv-empty-icon svg { width: 36px; height: 36px; stroke: rgba(245,158,11,0.5); fill: none; stroke-width: 1.5; }
        .rv-empty-title { font-size: 20px; font-weight: 700; color: white; margin-bottom: 8px; letter-spacing: -0.02em; }
        .rv-empty-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem; }
        .rv-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; text-decoration: none; border-radius: 10px;
          padding: 10px 22px; font-size: 14px; font-weight: 600;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 24px rgba(99,102,241,0.3);
        }
        .rv-empty-btn:hover { transform: translateY(-1px); box-shadow: 0 0 36px rgba(99,102,241,0.45); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        @media (max-width: 480px) {
          .rv-title { font-size: 24px; }
          .rv-score-num { font-size: 48px; }
          .rv-card { padding: 1rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="rv-root">
        <div className="rv-orb rv-orb-1" ref={orb1} />
        <div className="rv-orb rv-orb-2" ref={orb2} />
        <div className="rv-grid" />

        <div className="rv-inner">
          {/* Header */}
          <div className="rv-header">
            <div className="rv-eyebrow">Community Reputation</div>
            <h1 className="rv-title">Reviews</h1>
            <p className="rv-sub">What your skill exchange partners say about you</p>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="rv-stats-card">
              <div className="rv-stats-grid">
                <div className="rv-big-score">
                  <div className="rv-score-num">{avgRating ? avgRating.toFixed(1) : '—'}</div>
                  <div className="rv-score-stars">
                    <StarRating rating={Math.round(avgRating)} size={16} />
                  </div>
                  <div className="rv-score-label">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
                </div>
                <div className="rv-bars">
                  {[5,4,3,2,1].map(r => {
                    const count = stats.distribution?.[r] || 0;
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={r} className="rv-bar-row">
                        <span className="rv-bar-num">{r}</span>
                        <svg width="11" height="11" viewBox="0 0 24 24">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#f59e0b" stroke="none"/>
                        </svg>
                        <div className="rv-bar-track">
                          <div className="rv-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="rv-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {stats.subRatings && Object.entries(stats.subRatings).some(([,v]) => v) && (
                <div className="rv-sub-ratings">
                  {Object.entries(stats.subRatings).filter(([,v]) => v).map(([k, v]) => (
                    <div key={k} className="rv-sub-tag">
                      <span style={{ textTransform: 'capitalize' }}>{k}</span>
                      <StarRating rating={Math.round(v)} size={10} />
                      <strong>{Number(v).toFixed(1)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="rv-tabs">
            <button className={`rv-tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Received
              <span className="rv-tab-badge">{received.length}</span>
            </button>
            <button className={`rv-tab ${tab === 'given' ? 'active' : ''}`} onClick={() => setTab('given')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Given
              <span className="rv-tab-badge">{given.length}</span>
            </button>
          </div>

          {/* List */}
          {displayed.length === 0 ? (
            <div className="rv-empty">
              <div className="rv-empty-icon">
                <svg viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              </div>
              <h3 className="rv-empty-title">No reviews yet</h3>
              <p className="rv-empty-sub">
                {tab === 'received' ? 'Complete skill exchanges to receive reviews' : 'Exchange skills to start leaving reviews'}
              </p>
              <Link to="/exchanges" className="rv-empty-btn">
                View My Exchanges
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </Link>
            </div>
          ) : (
            <div className="rv-list">
              {displayed.map((r, idx) => {
                const person = tab === 'received' ? r.reviewer : r.reviewee;
                return (
                  <div key={r._id} className="rv-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="rv-card-row">
                      <Link to={`/profile/${person?._id}`} className="rv-avatar-link">
                        <div className="rv-avatar">
                          {person?.avatar
                            ? <img src={person.avatar} alt={person.name} />
                            : (person?.name?.[0] || '?')
                          }
                        </div>
                      </Link>
                      <div className="rv-card-body">
                        <div className="rv-card-top">
                          <div>
                            <Link to={`/profile/${person?._id}`} className="rv-reviewer-name">
                              {person?.name || 'Anonymous'}
                            </Link>
                            <div className="rv-card-meta">
                              <StarRating rating={r.rating} size={12} />
                              <span className="rv-date">
                                {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div className="rv-rating-chip">
                            <svg width="11" height="11" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#f59e0b"/></svg>
                            {r.rating}.0
                          </div>
                        </div>

                        {r.skillExchanged && (
                          <div className="rv-exchange-tag">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                            <span>{r.skillExchanged.offered}</span>
                            ↔
                            <span>{r.skillExchanged.received}</span>
                          </div>
                        )}

                        {r.comment && <p className="rv-comment">"{r.comment}"</p>}

                        {r.response?.text && (
                          <div className="rv-response">
                            <div className="rv-response-label">Your response</div>
                            <div className="rv-response-text">{r.response.text}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Reviews;