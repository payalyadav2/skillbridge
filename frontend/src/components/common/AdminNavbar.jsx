import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, ShieldAlert, LogOut, Home, ChevronRight } from 'lucide-react';
import { logoutUser } from '../../store/index.js';
import toast from 'react-hot-toast';

// Role config — ek jagah se sab control hota hai
const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    badgeBg: 'rgba(244,63,94,0.12)',
    badgeBorder: 'rgba(244,63,94,0.30)',
    badgeColor: '#fb7185',
    glowColor: 'rgba(244,63,94,0.4)',
    gradientFrom: '#f43f5e',
    gradientTo: '#8b5cf6',
    subtitle: 'Full platform control',
  },
  moderator: {
    label: 'Moderator',
    icon: ShieldAlert,
    badgeBg: 'rgba(139,92,246,0.12)',
    badgeBorder: 'rgba(139,92,246,0.30)',
    badgeColor: '#a78bfa',
    glowColor: 'rgba(139,92,246,0.4)',
    gradientFrom: '#8b5cf6',
    gradientTo: '#06b6d4',
    subtitle: 'Sessions & reviews only',
  },
};

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const role = user?.role || 'admin';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.admin;
  const RoleIcon = cfg.icon;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(2,0,16,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${cfg.badgeBorder}`,
        fontFamily: "'Space Grotesk', sans-serif",
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Top accent line — role colour */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${cfg.gradientFrom}, ${cfg.gradientTo}, transparent)`,
        opacity: 0.7,
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand + breadcrumb ───────────────────────────────────── */}
          <Link to="/admin" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
            {/* Logo pill */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                boxShadow: `0 0 14px ${cfg.glowColor}`,
                transition: 'box-shadow 0.2s, transform 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              🤝
            </div>

            {/* Name + breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>SkillBridge</span>
              <ChevronRight size={14} style={{ color: '#475569' }} />
              <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>
                {cfg.subtitle === 'Full platform control' ? 'Admin Panel' : 'Moderation Panel'}
              </span>
            </div>

            {/* Role badge */}
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: cfg.badgeBg,
                border: `1px solid ${cfg.badgeBorder}`,
                color: cfg.badgeColor,
                transition: 'background 0.3s',
              }}
            >
              <RoleIcon size={11} />
              {cfg.label}
            </span>
          </Link>

          {/* ── Right side ──────────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Scope indicator (desktop only) */}
            <div
              className="hidden lg:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: cfg.gradientFrom,
                  boxShadow: `0 0 6px ${cfg.glowColor}`,
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
              <span style={{ color: '#64748b', fontSize: 12 }}>{cfg.subtitle}</span>
              {user?.name && (
                <>
                  <span style={{ color: '#334155', fontSize: 12 }}>·</span>
                  <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{user.name}</span>
                </>
              )}
            </div>

            {/* Mobile: just user name */}
            {user?.name && (
              <span className="lg:hidden text-sm mr-1" style={{ color: '#64748b' }}>
                {user.name}
              </span>
            )}

            {/* Home button */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#94a3b8', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              title="Back to site"
            >
              <Home size={15} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#f43f5e', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pulse animation for live indicator */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;