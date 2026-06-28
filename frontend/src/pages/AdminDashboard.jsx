import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

// ─── Palette & helpers ────────────────────────────────────────────────────────
const C = {
  bg:      '#020010',
  surface: 'rgba(10, 6, 30, 0.85)',
  card:    'rgba(15, 10, 45, 0.75)',
  border:  'rgba(34, 211, 238, 0.12)',
  borderHover: 'rgba(34, 211, 238, 0.35)',
  cyan:    '#22d3ee',
  purple:  '#8b5cf6',
  pink:    '#f43f5e',
  green:   '#10b981',
  amber:   '#f59e0b',
  muted:   'rgba(148, 163, 184, 0.7)',
  text:    '#e2e8f0',
};

const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const timeAgo = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Inline styles ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    color: C.text,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: (top, left, color, size = 400) => ({
    position: 'fixed', top, left, width: size, height: size,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color}0d 0%, transparent 70%)`,
    filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
  }),
  wrap: {
    position: 'relative', zIndex: 1,
    maxWidth: 1400, margin: '0 auto', padding: '28px 24px 60px',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 36, flexWrap: 'wrap', gap: 16,
  },
  badge: (color = C.cyan) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 12px', borderRadius: 20,
    background: `${color}18`, border: `1px solid ${color}35`,
    color, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
  }),
  card: (glow = C.cyan) => ({
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
    padding: '24px 28px', backdropFilter: 'blur(20px)',
    boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px ${glow}08`,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }),
  statCard: (glow) => ({
    background: `linear-gradient(135deg, ${C.card}, rgba(10,6,30,0.9))`,
    border: `1px solid ${glow}22`, borderRadius: 20, padding: '20px 24px',
    backdropFilter: 'blur(20px)', boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 24px ${glow}0a`,
    cursor: 'default', transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
  }),
  gridFour: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
  gridTwo:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: C.muted,
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16,
  },
  tab: (active) => ({
    padding: '8px 20px', borderRadius: 12,
    border: `1px solid ${active ? C.cyan + '40' : C.border}`,
    background: active ? `${C.cyan}15` : 'transparent',
    color: active ? C.cyan : C.muted,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
  }),
  input: {
    background: 'rgba(10,6,30,0.8)', border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '10px 14px', color: C.text,
    fontSize: 13, outline: 'none', width: '100%',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '10px 14px', color: C.muted,
    fontWeight: 600, fontSize: 12, letterSpacing: '0.05em',
    borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
  },
  td: { padding: '12px 14px', borderBottom: `1px solid rgba(34,211,238,0.06)`, verticalAlign: 'middle' },
  avatar: (size = 36) => ({
    width: size, height: size, borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.cyan}30, ${C.purple}30)`,
    border: `1px solid ${C.cyan}30`, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700,
    color: C.cyan, flexShrink: 0, objectFit: 'cover',
  }),
  btnDanger:  { padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.pink}35`,   background: `${C.pink}12`,  color: C.pink,  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  btnSuccess: { padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.green}35`,  background: `${C.green}12`, color: C.green, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  btnGhost:   { padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`,   background: 'transparent',  color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  btnCyan:    { padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.cyan}35`,   background: `${C.cyan}12`,  color: C.cyan,  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: 20,
  },
  modalBox: {
    background: 'rgba(10, 6, 30, 0.98)', border: `1px solid ${C.border}`,
    borderRadius: 24, padding: 32, width: '100%', maxWidth: 420,
    boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${C.cyan}10`,
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const MiniBar = ({ value, max, color = C.cyan }) => (
  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${max > 0 ? Math.round((value / max) * 100) : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 4, transition: 'width 0.6s ease' }} />
  </div>
);

const StatCard = ({ label, value, sub, glow = C.cyan, icon, trend }) => (
  <div style={styles.statCard(glow)} className="admin-stat-card">
    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${glow}18, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      {trend !== undefined && (
        <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? C.green : C.pink, background: trend >= 0 ? `${C.green}15` : `${C.pink}15`, padding: '2px 8px', borderRadius: 8 }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1 }}>{fmt(value)}</div>
    <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: glow, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const Avatar = ({ user, size = 36 }) => {
  if (user?.avatar) return <img src={user.avatar} alt={user.name} style={{ ...styles.avatar(size), objectFit: 'cover' }} />;
  return <div style={styles.avatar(size)}>{user?.name?.[0]?.toUpperCase() || '?'}</div>;
};

const RoleBadge = ({ role }) => {
  const cfg = { admin: { color: C.cyan, label: 'Admin' }, moderator: { color: C.purple, label: 'Mod' }, user: { color: C.muted, label: 'User' } }[role] || { color: C.muted, label: role };
  return <span style={styles.badge(cfg.color)}>{cfg.label}</span>;
};

const StatusBadge = ({ banned, active }) => {
  if (banned) return <span style={styles.badge(C.pink)}>Banned</span>;
  if (!active) return <span style={styles.badge(C.amber)}>Inactive</span>;
  return <span style={styles.badge(C.green)}>Active</span>;
};

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
    <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.cyan}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

const ConfirmModal = ({ title, message, onConfirm, onClose, danger = false, showReason = false }) => {
  const [reason, setReason] = useState('');
  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: danger ? C.pink : C.text }}>{title}</h3>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: showReason ? 16 : 28 }}>{message}</p>
        {showReason && <input style={{ ...styles.input, marginBottom: 24 }} placeholder="Ban reason (optional)" value={reason} onChange={e => setReason(e.target.value)} />}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button style={danger ? styles.btnDanger : styles.btnSuccess} onClick={() => { onConfirm(reason); onClose(); }}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ page, pages, onPage }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
      <button style={styles.btnGhost} onClick={() => onPage(page - 1)} disabled={page <= 1}>← Prev</button>
      <span style={{ color: C.muted, fontSize: 13 }}>Page {page} of {pages}</span>
      <button style={styles.btnGhost} onClick={() => onPage(page + 1)} disabled={page >= pages}>Next →</button>
    </div>
  );
};

// ─── User Detail Side Panel ────────────────────────────────────────────────────
const UserDetailPanel = ({ user: u, onClose, onBan, onUnban, onChangeRole, onDelete }) => {
  if (!u) return null;
  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 900 }} />
      {/* panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 400,
        background: 'rgba(8, 4, 28, 0.98)', borderLeft: `1px solid ${C.border}`,
        zIndex: 901, overflowY: 'auto', padding: 28,
        boxShadow: `-24px 0 80px rgba(0,0,0,0.6)`,
        animation: 'slideIn 0.22s ease',
      }}>
        {/* close */}
        <button onClick={onClose} style={{ ...styles.btnGhost, marginBottom: 24, fontSize: 13 }}>← Close</button>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <Avatar user={u} size={56} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{u.name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{u.email}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <RoleBadge role={u.role} />
              <StatusBadge banned={u.isBanned} active={u.isActive} />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Rating', value: u.averageRating ? `★ ${u.averageRating.toFixed(1)}` : '—', color: C.amber },
            { label: 'Exchanges', value: u.totalExchanges || 0, color: C.cyan },
            { label: 'Joined', value: new Date(u.createdAt).toLocaleDateString('en-IN'), color: C.muted },
            { label: 'Last seen', value: u.lastSeen ? timeAgo(u.lastSeen) : '—', color: u.isOnline ? C.green : C.muted },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgba(34,211,238,0.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {u.bio && (
          <div style={{ marginBottom: 20 }}>
            <div style={styles.sectionTitle}>Bio</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{u.bio}</p>
          </div>
        )}

        {/* Location */}
        {u.location && (
          <div style={{ marginBottom: 20 }}>
            <div style={styles.sectionTitle}>Location</div>
            <p style={{ fontSize: 13, color: C.text }}>📍 {u.location}</p>
          </div>
        )}

        {/* Skills offered */}
        {u.skillsOffered?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={styles.sectionTitle}>Skills Offered</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {u.skillsOffered.map((s, i) => (
                <span key={i} style={styles.badge(C.cyan)}>{s.name || s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills wanted */}
        {u.skillsWanted?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={styles.sectionTitle}>Skills Wanted</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {u.skillsWanted.map((s, i) => (
                <span key={i} style={styles.badge(C.purple)}>{s.name || s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {u.role !== 'admin' && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={styles.sectionTitle}>Admin Actions</div>

            {u.isBanned ? (
              <button style={{ ...styles.btnSuccess, width: '100%', padding: '10px', fontSize: 13 }} onClick={() => onUnban(u)}>
                ✓ Unban User
              </button>
            ) : (
              <button style={{ ...styles.btnDanger, width: '100%', padding: '10px', fontSize: 13 }} onClick={() => onBan(u)}>
                🚫 Ban User
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>Change role:</span>
              <select
                style={{ ...styles.input, flex: 1, padding: '8px 12px', fontSize: 12 }}
                value={u.role}
                onChange={e => onChangeRole(u, e.target.value)}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button style={{ ...styles.btnDanger, width: '100%', padding: '10px', fontSize: 13, borderColor: `${C.pink}60`, background: `${C.pink}08` }} onClick={() => onDelete(u)}>
              🗑️ Delete Account Permanently
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate  = useNavigate();
  const { user, initialized } = useSelector(state => state.auth);

  const [activeTab, setActiveTab]   = useState('overview');
  const [stats, setStats]           = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [activity, setActivity]     = useState([]);
  const [topSkills, setTopSkills]   = useState({ offered: [], wanted: [] });

  const [users, setUsers]                       = useState([]);
  const [usersPagination, setUsersPagination]   = useState({ page: 1, pages: 1 });
  const [sessions, setSessions]                 = useState([]);
  const [sessionsPagination, setSessionsPagination] = useState({ page: 1, pages: 1 });
  const [exchanges, setExchanges]               = useState([]);
  const [exchangesPagination, setExchangesPagination] = useState({ page: 1, pages: 1 });
  const [reviews, setReviews]                   = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({ page: 1, pages: 1 });

  const [userSearch, setUserSearch]       = useState('');
  const [userRole, setUserRole]           = useState('');
  const [userStatus, setUserStatus]       = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [exchangeStatus, setExchangeStatus] = useState('');
  const [reviewRating, setReviewRating]   = useState('');   // ← NEW: rating filter

  const [loading, setLoading] = useState({ stats: true, users: false, sessions: false, exchanges: false, reviews: false });
  const [modal, setModal]     = useState(null);
  const [detailUser, setDetailUser] = useState(null);       // ← NEW: side panel user

  // ─── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    if (!user) { navigate('/login'); return; }
    if (!['admin', 'moderator'].includes(user.role)) {
      toast.error('Access denied — staff only');
      navigate('/dashboard');
    }
  }, [user, initialized]);

  const isAdmin    = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  useEffect(() => {
    if (isModerator && ['overview', 'users', 'exchanges'].includes(activeTab)) setActiveTab('sessions');
  }, [isModerator]);

  // ─── Loaders ──────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const [s, g, a, sk] = await Promise.all([
        axios.get('/admin/stats'), axios.get('/admin/growth'),
        axios.get('/admin/activity'), axios.get('/admin/top-skills'),
      ]);
      setStats(s.data.data);
      setGrowthData(g.data.data);
      setActivity(a.data.data.activity);
      setTopSkills(sk.data.data);
    } catch { toast.error('Failed to load stats'); }
    finally   { setLoading(l => ({ ...l, stats: false })); }
  }, []);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(l => ({ ...l, users: true }));
    try {
      const { data } = await axios.get('/admin/users', {
        params: { page, limit: 15, search: userSearch, role: userRole, status: userStatus },
      });
      setUsers(data.data.users);
      setUsersPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally   { setLoading(l => ({ ...l, users: false })); }
  }, [userSearch, userRole, userStatus]);

  const loadSessions = useCallback(async (page = 1) => {
    setLoading(l => ({ ...l, sessions: true }));
    try {
      const { data } = await axios.get('/admin/sessions', { params: { page, limit: 15, status: sessionStatus } });
      setSessions(data.data.sessions);
      setSessionsPagination(data.pagination);
    } catch { toast.error('Failed to load sessions'); }
    finally   { setLoading(l => ({ ...l, sessions: false })); }
  }, [sessionStatus]);

  const loadExchanges = useCallback(async (page = 1) => {
    setLoading(l => ({ ...l, exchanges: true }));
    try {
      const { data } = await axios.get('/admin/exchanges', { params: { page, limit: 15, status: exchangeStatus } });
      setExchanges(data.data.exchanges);
      setExchangesPagination(data.pagination);
    } catch { toast.error('Failed to load exchanges'); }
    finally   { setLoading(l => ({ ...l, exchanges: false })); }
  }, [exchangeStatus]);

  const loadReviews = useCallback(async (page = 1) => {
    setLoading(l => ({ ...l, reviews: true }));
    try {
      const { data } = await axios.get('/admin/reviews', {
        params: { page, limit: 15, ...(reviewRating ? { rating: reviewRating } : {}) },
      });
      setReviews(data.data.reviews);
      setReviewsPagination(data.pagination);
    } catch { toast.error('Failed to load reviews'); }
    finally   { setLoading(l => ({ ...l, reviews: false })); }
  }, [reviewRating]);

  useEffect(() => { if (isAdmin) loadStats(); }, [loadStats, isAdmin]);
  useEffect(() => { if (activeTab === 'users')     loadUsers();    }, [activeTab, loadUsers]);
  useEffect(() => { if (activeTab === 'sessions')  loadSessions(); }, [activeTab, loadSessions]);
  useEffect(() => { if (activeTab === 'exchanges') loadExchanges();}, [activeTab, loadExchanges]);
  useEffect(() => { if (activeTab === 'reviews')   loadReviews();  }, [activeTab, loadReviews]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => { if (activeTab === 'users') loadUsers(); }, 400);
    return () => clearTimeout(t);
  }, [userSearch]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const banUser = async (u, reason) => {
    try {
      await axios.put(`/admin/users/${u._id}/ban`, { reason });
      toast.success(`${u.name} banned`);
      setDetailUser(null);
      loadUsers(usersPagination.page);
    } catch { toast.error('Failed to ban user'); }
  };

  const unbanUser = async (u) => {
    try {
      await axios.put(`/admin/users/${u._id}/unban`);
      toast.success(`${u.name} unbanned`);
      setDetailUser(null);
      loadUsers(usersPagination.page);
    } catch { toast.error('Failed to unban user'); }
  };

  const changeRole = async (u, role) => {
    try {
      await axios.put(`/admin/users/${u._id}/role`, { role });
      toast.success(`Role updated to ${role}`);
      setDetailUser(prev => prev ? { ...prev, role } : null);
      loadUsers(usersPagination.page);
    } catch { toast.error('Failed to change role'); }
  };

  const deleteUser = async (u) => {
    try {
      await axios.delete(`/admin/users/${u._id}`);
      toast.success(`${u.name}'s account deleted`);
      setDetailUser(null);
      loadUsers(usersPagination.page);
    } catch { toast.error('Failed to delete user'); }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`/admin/sessions/${id}`);
      toast.success('Session deleted');
      loadSessions(sessionsPagination.page);
    } catch { toast.error('Failed to delete session'); }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted');
      loadReviews(reviewsPagination.page);
    } catch { toast.error('Failed to delete review'); }
  };

  // ─── Mini sparkline ───────────────────────────────────────────────────────
  const Sparkline = ({ data, color = C.cyan }) => {
    if (!data?.length) return <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', padding: 20 }}>No data</div>;
    const max    = Math.max(...data.map(d => d.count), 1);
    const last14 = data.slice(-14);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48, padding: '4px 0' }}>
        {last14.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', height: `${Math.max(4, (d.count / max) * 44)}px`, background: `linear-gradient(180deg, ${color}, ${color}55)`, borderRadius: 3, transition: 'height 0.3s', boxShadow: `0 0 6px ${color}40` }} />
          </div>
        ))}
      </div>
    );
  };

  const actIcon  = t => ({ user_joined: '👤', session_created: '🎯', exchange_requested: '🔄' }[t] || '•');
  const actColor = t => ({ user_joined: C.cyan, session_created: C.green, exchange_requested: C.purple }[t] || C.muted);
  const sesStatusColor = s => ({ completed: C.green, ongoing: C.cyan, scheduled: C.amber, cancelled: C.pink, 'no-show': C.muted }[s] || C.muted);
  const exStatusColor  = s => ({ accepted: C.green, pending: C.amber, rejected: C.pink, completed: C.cyan, cancelled: C.muted }[s] || C.muted);

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (!initialized) return (
    <div style={{ minHeight: '100vh', background: '#020010', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: C.cyan, fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(34,211,238,0.15)', borderTop: `3px solid ${C.cyan}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, opacity: 0.7 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user || !['admin', 'moderator'].includes(user.role)) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .admin-stat-card:hover { border-color: rgba(34,211,238,0.3) !important; box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 32px rgba(34,211,238,0.08) !important; transform: translateY(-2px); }
        .admin-tab-btn:hover   { background: rgba(34,211,238,0.08) !important; color: #e2e8f0 !important; }
        .admin-tr:hover td     { background: rgba(34,211,238,0.03); cursor: pointer; }
        .admin-action-btn:hover { opacity: 0.85; transform: scale(1.03); }
      `}</style>

      <div style={styles.orb('5%', '5%', C.cyan)} />
      <div style={styles.orb('60%', '70%', C.purple, 350)} />
      <div style={styles.orb('35%', '90%', C.pink, 250)} />

      <div style={styles.wrap}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${C.text}, ${C.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {isAdmin ? 'Admin Dashboard' : 'Moderation Panel'}
              </h1>
              <span style={styles.badge(isAdmin ? C.cyan : C.purple)}>
                {isAdmin ? '⚡ LIVE' : '🛡️ Moderator'}
              </span>
            </div>
            <p style={{ color: C.muted, fontSize: 14 }}>
              {isAdmin
                ? <>SkillBridge platform control — logged in as <strong style={{ color: C.text }}>{user.name}</strong></>
                : <>Content moderation — logged in as <strong style={{ color: C.text }}>{user.name}</strong>. Sessions &amp; reviews only.</>}
            </p>
          </div>
          <button
            style={{ ...styles.btnGhost, padding: '10px 20px', fontSize: 13, borderRadius: 12 }}
            onClick={() => {
              if (activeTab === 'overview')  loadStats();
              if (activeTab === 'users')     loadUsers(usersPagination.page);
              if (activeTab === 'sessions')  loadSessions(sessionsPagination.page);
              if (activeTab === 'exchanges') loadExchanges(exchangesPagination.page);
              if (activeTab === 'reviews')   loadReviews(reviewsPagination.page);
            }}
          >↻ Refresh</button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {(isAdmin ? ['overview', 'users', 'sessions', 'exchanges', 'reviews'] : ['sessions', 'reviews']).map(tab => (
            <button key={tab} className="admin-tab-btn" style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {{ overview: '📊 Overview', users: '👥 Users', sessions: '🎯 Sessions', exchanges: '🔄 Exchanges', reviews: '⭐ Reviews' }[tab]}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW ══════════════════════════════════ */}
        {activeTab === 'overview' && isAdmin && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            {loading.stats ? <Spinner /> : stats && (
              <>
                <div style={styles.gridFour}>
                  <StatCard label="Total Users"       value={stats.users.total}       sub={`+${stats.users.newToday} today`}          glow={C.cyan}   icon="👥" trend={stats.users.growthRate} />
                  <StatCard label="Online Now"        value={stats.users.onlineNow}   sub={`${pct(stats.users.onlineNow, stats.users.total)}% of users`} glow={C.green}  icon="🟢" />
                  <StatCard label="Banned Users"      value={stats.users.banned}      sub="accounts restricted"                        glow={C.pink}   icon="🚫" />
                  <StatCard label="Total Sessions"    value={stats.sessions.total}    sub={`${stats.sessions.completionRate}% completion`} glow={C.purple} icon="🎯" />
                </div>
                <div style={styles.gridFour}>
                  <StatCard label="Completed Sessions" value={stats.sessions.completed} sub={`${stats.sessions.ongoing} ongoing`}       glow={C.green}  icon="✅" />
                  <StatCard label="Exchange Requests"  value={stats.exchanges.total}    sub={`${stats.exchanges.pending} pending`}       glow={C.amber}  icon="🔄" />
                  <StatCard label="Accepted Exchanges" value={stats.exchanges.accepted} sub={`${stats.exchanges.acceptanceRate}% rate`} glow={C.cyan}   icon="🤝" />
                  <StatCard label="Total Reviews"      value={stats.reviews.total}      sub={`Avg ★ ${stats.reviews.avgRating?.toFixed(1) || '—'}`} glow={C.amber} icon="⭐" />
                </div>

                <div style={styles.gridTwo}>
                  {/* User growth sparkline */}
                  <div style={styles.card(C.cyan)}>
                    <div style={styles.sectionTitle}>New Users — last 14 days</div>
                    <Sparkline data={growthData?.users} color={C.cyan} />
                    <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{fmt(stats.users.new7Days)}</div><div style={{ fontSize: 11, color: C.muted }}>last 7 days</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{fmt(stats.users.new30Days)}</div><div style={{ fontSize: 11, color: C.muted }}>last 30 days</div></div>
                    </div>
                  </div>
                  {/* Session growth sparkline */}
                  <div style={styles.card(C.purple)}>
                    <div style={styles.sectionTitle}>Sessions — last 14 days</div>
                    <Sparkline data={growthData?.sessions} color={C.purple} />
                    <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{fmt(stats.sessions.today)}</div><div style={{ fontSize: 11, color: C.muted }}>today</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{fmt(stats.sessions.ongoing)}</div><div style={{ fontSize: 11, color: C.muted }}>live now</div></div>
                    </div>
                  </div>
                </div>

                <div style={styles.gridTwo}>
                  {/* Top Skills Offered */}
                  <div style={styles.card()}>
                    <div style={styles.sectionTitle}>Top Skills Offered</div>
                    {topSkills.offered.slice(0, 6).map((s, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: C.text }}>{s.name}</span>
                          <span style={{ fontSize: 12, color: C.cyan, fontWeight: 600 }}>{s.count}</span>
                        </div>
                        <MiniBar value={s.count} max={topSkills.offered[0]?.count || 1} color={C.cyan} />
                      </div>
                    ))}
                  </div>

                  {/* ── NEW: Top Skills Wanted ───────────────────────── */}
                  <div style={styles.card(C.purple)}>
                    <div style={styles.sectionTitle}>Top Skills Wanted</div>
                    {topSkills.wanted?.length > 0 ? topSkills.wanted.slice(0, 6).map((s, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: C.text }}>{s.name}</span>
                          <span style={{ fontSize: 12, color: C.purple, fontWeight: 600 }}>{s.count}</span>
                        </div>
                        <MiniBar value={s.count} max={topSkills.wanted[0]?.count || 1} color={C.purple} />
                      </div>
                    )) : <div style={{ color: C.muted, fontSize: 13 }}>No data yet</div>}
                  </div>
                </div>

                {/* Activity feed — full width */}
                <div style={styles.card()}>
                  <div style={styles.sectionTitle}>Recent Activity</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                    {activity.slice(0, 12).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `${actColor(a.type)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                          {actIcon(a.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{a.message}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{timeAgo(a.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════ USERS ════════════════════════════════════ */}
        {activeTab === 'users' && isAdmin && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input style={{ ...styles.input, maxWidth: 260 }} placeholder="🔍 Search name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              <select style={{ ...styles.input, maxWidth: 140 }} value={userRole} onChange={e => { setUserRole(e.target.value); loadUsers(); }}>
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <select style={{ ...styles.input, maxWidth: 140 }} value={userStatus} onChange={e => { setUserStatus(e.target.value); loadUsers(); }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ ...styles.card(), marginBottom: 0 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>💡 Kisi bhi row pe click karo — user detail panel khulega</div>
              {loading.users ? <Spinner /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>User</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Joined</th>
                        <th style={styles.th}>Rating</th>
                        <th style={styles.th}>Exchanges</th>
                        <th style={styles.th}>Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="admin-tr" onClick={() => setDetailUser(u)}>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar user={u} size={34} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}><RoleBadge role={u.role} /></td>
                          <td style={styles.td}><StatusBadge banned={u.isBanned} active={u.isActive} /></td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.muted }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span></td>
                          <td style={styles.td}><span style={{ fontSize: 13, color: C.amber }}>★ {u.averageRating?.toFixed(1) || '—'}</span></td>
                          <td style={styles.td}><span style={{ fontSize: 13, color: C.text }}>{u.totalExchanges || 0}</span></td>
                          <td style={styles.td} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {u.isBanned
                                ? <button className="admin-action-btn" style={styles.btnSuccess} onClick={() => setModal({ type: 'unban', user: u })}>Unban</button>
                                : <button className="admin-action-btn" style={styles.btnDanger}  onClick={() => setModal({ type: 'ban',   user: u })}>Ban</button>
                              }
                              {/* ── NEW: Delete button ── */}
                              {u.role !== 'admin' && (
                                <button className="admin-action-btn" style={{ ...styles.btnDanger, background: 'transparent' }} onClick={() => setModal({ type: 'deleteUser', user: u })} title="Delete account">🗑️</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No users found</div>}
                </div>
              )}
              <Pagination page={usersPagination.page} pages={usersPagination.pages} onPage={loadUsers} />
            </div>
          </div>
        )}

        {/* ══════════════════ SESSIONS ════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <select style={{ ...styles.input, maxWidth: 160 }} value={sessionStatus} onChange={e => { setSessionStatus(e.target.value); loadSessions(); }}>
                <option value="">All Status</option>
                {['scheduled', 'ongoing', 'completed', 'cancelled', 'no-show'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={styles.card()}>
              {loading.sessions ? <Spinner /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Host</th>
                        <th style={styles.th}>Participant</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Scheduled</th>
                        <th style={styles.th}>Duration</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(s => (
                        <tr key={s._id} className="admin-tr">
                          <td style={styles.td}><span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{s.title}</span></td>
                          <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={s.host} size={28} /><span style={{ fontSize: 12, color: C.text }}>{s.host?.name || '—'}</span></div></td>
                          <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={s.participant} size={28} /><span style={{ fontSize: 12, color: C.text }}>{s.participant?.name || '—'}</span></div></td>
                          <td style={styles.td}><span style={styles.badge(sesStatusColor(s.status))}>{s.status}</span></td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.muted }}>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('en-IN') : '—'}</span></td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.muted }}>{s.duration ? `${s.duration}m` : '—'}</span></td>
                          <td style={styles.td}><span style={styles.badge(C.purple)}>{s.type}</span></td>
                          <td style={styles.td}>
                            <button className="admin-action-btn" style={styles.btnDanger} onClick={() => setModal({ type: 'deleteSession', session: s })}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sessions.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No sessions found</div>}
                </div>
              )}
              <Pagination page={sessionsPagination.page} pages={sessionsPagination.pages} onPage={loadSessions} />
            </div>
          </div>
        )}

        {/* ══════════════════ EXCHANGES ════════════════════════════════ */}
        {activeTab === 'exchanges' && isAdmin && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <select style={{ ...styles.input, maxWidth: 180 }} value={exchangeStatus} onChange={e => { setExchangeStatus(e.target.value); loadExchanges(); }}>
                <option value="">All Status</option>
                {['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'expired'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={styles.card()}>
              {loading.exchanges ? <Spinner /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sender</th>
                        <th style={styles.th}>Offers</th>
                        <th style={styles.th}>Wants</th>
                        <th style={styles.th}>Receiver</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchanges.map(e => (
                        <tr key={e._id} className="admin-tr">
                          <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={e.sender} size={28} /><span style={{ fontSize: 12, color: C.text }}>{e.sender?.name || '—'}</span></div></td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.cyan,   fontWeight: 600 }}>{e.skillOffered?.name}</span></td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.purple, fontWeight: 600 }}>{e.skillWanted?.name}</span></td>
                          <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={e.receiver} size={28} /><span style={{ fontSize: 12, color: C.text }}>{e.receiver?.name || '—'}</span></div></td>
                          <td style={styles.td}><span style={styles.badge(exStatusColor(e.status))}>{e.status}</span></td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.muted }}>{timeAgo(e.createdAt)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {exchanges.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No exchanges found</div>}
                </div>
              )}
              <Pagination page={exchangesPagination.page} pages={exchangesPagination.pages} onPage={loadExchanges} />
            </div>
          </div>
        )}

        {/* ══════════════════ REVIEWS ══════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            {/* ── NEW: Rating filter ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['', '1', '2', '3', '4', '5'].map(r => (
                <button
                  key={r}
                  style={{
                    ...styles.btnGhost,
                    ...(reviewRating === r ? { background: `${C.amber}18`, border: `1px solid ${C.amber}40`, color: C.amber } : {}),
                    fontSize: 13,
                  }}
                  onClick={() => { setReviewRating(r); }}
                >
                  {r === '' ? 'All Ratings' : `${'★'.repeat(Number(r))} ${r}★`}
                </button>
              ))}
            </div>

            <div style={styles.card()}>
              {loading.reviews ? <Spinner /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Reviewer</th>
                        <th style={styles.th}>Reviewee</th>
                        <th style={styles.th}>Rating</th>
                        <th style={styles.th}>Comment</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(r => (
                        <tr key={r._id} className="admin-tr">
                          <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={r.reviewer} size={28} /><span style={{ fontSize: 12, color: C.text }}>{r.reviewer?.name || '—'}</span></div></td>
                          <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={r.reviewee} size={28} /><span style={{ fontSize: 12, color: C.text }}>{r.reviewee?.name || '—'}</span></div></td>
                          <td style={styles.td}>
                            <span style={{ color: C.amber, fontWeight: 700, fontSize: 14 }}>
                              {'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: 12, color: C.muted, maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.comment || '—'}
                            </span>
                          </td>
                          <td style={styles.td}><span style={{ fontSize: 12, color: C.muted }}>{timeAgo(r.createdAt)}</span></td>
                          <td style={styles.td}>
                            <button className="admin-action-btn" style={styles.btnDanger} onClick={() => setModal({ type: 'deleteReview', review: r })}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reviews.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No reviews found</div>}
                </div>
              )}
              <Pagination page={reviewsPagination.page} pages={reviewsPagination.pages} onPage={loadReviews} />
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {modal?.type === 'ban' && (
        <ConfirmModal title={`Ban ${modal.user.name}?`} message="This user won't be able to log in. You can unban anytime."
          onConfirm={reason => banUser(modal.user, reason)} onClose={() => setModal(null)} danger showReason />
      )}
      {modal?.type === 'unban' && (
        <ConfirmModal title={`Unban ${modal.user.name}?`} message="This will restore their full access to the platform."
          onConfirm={() => unbanUser(modal.user)} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'deleteUser' && (
        <ConfirmModal
          title={`Delete ${modal.user.name}'s account?`}
          message="This is permanent and cannot be undone. All their data will be removed."
          onConfirm={() => deleteUser(modal.user)} onClose={() => setModal(null)} danger
        />
      )}
      {modal?.type === 'deleteSession' && (
        <ConfirmModal title="Delete this session?" message="This action cannot be undone. The session record will be permanently removed."
          onConfirm={() => deleteSession(modal.session._id)} onClose={() => setModal(null)} danger />
      )}
      {modal?.type === 'deleteReview' && (
        <ConfirmModal title="Delete this review?" message="This action cannot be undone. The review will be permanently removed."
          onConfirm={() => deleteReview(modal.review._id)} onClose={() => setModal(null)} danger />
      )}

      {/* ── User Detail Side Panel ───────────────────────────────────── */}
      {detailUser && (
        <UserDetailPanel
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onBan={u => { setDetailUser(null); setModal({ type: 'ban', user: u }); }}
          onUnban={u => { setDetailUser(null); setModal({ type: 'unban', user: u }); }}
          onChangeRole={(u, role) => changeRole(u, role)}
          onDelete={u => { setDetailUser(null); setModal({ type: 'deleteUser', user: u }); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;