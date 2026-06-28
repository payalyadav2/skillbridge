import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, Menu, X, ChevronDown, LogOut, User,
  Settings, Trophy, MessageSquare, Zap, LayoutDashboard, Sparkles
} from 'lucide-react';
import { logoutUser, setNotifications, setUnreadCount, markAllRead } from '../../store/index.js';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const { unreadCount, items: notifications } = useSelector(state => state.notifications);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navContainerRef = useRef(null);
  const linkRefs = useRef({});
  const logoRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    if (user) {
      api.get('/notifications?limit=10').then(({ data }) => {
        dispatch(setNotifications(data.data));
      }).catch(() => {});
      api.get('/notifications/unread-count').then(({ data }) => {
        dispatch(setUnreadCount(data.data.count));
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Signature element: navbar density/glow responds to scroll position — feels alive, not static chrome
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/skills', label: 'Browse Skills' },
    { to: '/nearby', label: 'Nearby', auth: true },
    { to: '/exchanges', label: 'Exchanges', auth: true },
    { to: '/ai', label: 'AI Tools', auth: true, glow: true },
  ];

  // Premium signature: a glowing pill glides between nav items to track the active route,
  // instead of each link drawing its own static highlight.
  const measureIndicator = () => {
    const active = navLinks.find(l => location.pathname === l.to || location.pathname.startsWith(`${l.to}/`));
    const el = active && linkRefs.current[active.to];
    const container = navContainerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicator({ left: elRect.left - containerRect.left, width: elRect.width, opacity: 1 });
    } else {
      setIndicator(prev => ({ ...prev, opacity: 0 }));
    }
  };

  useLayoutEffect(() => {
    measureIndicator();
  }, [location.pathname, user]);

  useEffect(() => {
    window.addEventListener('resize', measureIndicator);
    return () => window.removeEventListener('resize', measureIndicator);
  }, [location.pathname, user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleMarkAllRead = async () => {
    await api.put('/notifications/read-all');
    dispatch(markAllRead());
  };

  // Mouse-tracked 3D tilt — subtle parallax on the logo badge / avatar chip
  const makeTiltHandlers = (ref, intensity = 18) => ({
    onMouseMove: (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(320px) rotateY(${px * intensity}deg) rotateX(${-py * intensity}deg) scale(1.07)`;
    },
    onMouseLeave: () => {
      const el = ref.current;
      if (el) el.style.transform = '';
    },
  });

  return (
    <>
      <style>{`
        @keyframes navFadeIn { from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }
        @keyframes navShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes navBorderShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes navDropdown3D {
          from{ opacity:0; transform:perspective(700px) rotateX(-10deg) translateY(-6px) scale(0.96); }
          to{ opacity:1; transform:perspective(700px) rotateX(0deg) translateY(0) scale(1); }
        }
        @keyframes navPing { 0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.5)} 50%{box-shadow:0 0 0 4px rgba(244,63,94,0)} }
        @keyframes navMobileSlide { from{opacity:0; transform:translateY(-10px); max-height:0} to{opacity:1; transform:translateY(0); max-height:600px} }
        @keyframes navItemFade { from{opacity:0; transform:translateX(-6px)} to{opacity:1; transform:translateX(0)} }

        .navbar-glass { position:relative; background: rgba(2,0,16,0.72); backdrop-filter: blur(20px); transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .navbar-glass.scrolled { background: rgba(2,0,16,0.88); box-shadow: 0 8px 30px rgba(0,0,0,0.35), 0 0 18px rgba(34,211,238,0.06); }

        /* Signature shimmer edge — echoes the footer's top border for a cohesive bookend feel */
        .nav-shimmer-edge {
          position:absolute; bottom:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(34,211,238,0.5) 20%,rgba(167,139,250,0.5) 50%,rgba(244,114,182,0.4) 80%,transparent);
          background-size:200% 100%;
          animation:navBorderShimmer 7s linear infinite;
        }

        .nav-neon-text { background: linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6); background-size: 200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation: navShimmer 6s linear infinite; }

        .nav-logo-badge {
          width:32px; height:32px; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          font-size:15px; color:#fff;
          background:linear-gradient(135deg,#06b6d4,#8b5cf6);
          box-shadow:0 0 14px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -6px 10px rgba(0,0,0,0.2);
          transition:transform 0.15s ease-out, box-shadow 0.25s;
          transform-style:preserve-3d;
          will-change:transform;
        }
        .nav-logo-wrap:hover .nav-logo-badge { box-shadow:0 0 22px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -6px 10px rgba(0,0,0,0.2); }

        .nav-pill-indicator {
          position:absolute; top:3px; bottom:3px; border-radius:10px;
          background:linear-gradient(135deg, rgba(34,211,238,0.14), rgba(167,139,250,0.14));
          border:1px solid rgba(34,211,238,0.3);
          box-shadow:0 0 16px rgba(34,211,238,0.18), inset 0 1px 0 rgba(255,255,255,0.06);
          transition:transform 0.4s cubic-bezier(.16,1,.3,1), width 0.4s cubic-bezier(.16,1,.3,1), opacity 0.25s;
          pointer-events:none;
          z-index:0;
        }

        .nav-link-3d {
          position:relative; z-index:1;
          transition:color 0.2s, transform 0.15s cubic-bezier(.34,1.56,.64,1);
        }
        .nav-link-3d:hover { transform:translateY(-1px); }
        .nav-link-3d:active { transform:translateY(0) scale(0.96); }

        .nav-icon-btn {
          position:relative;
          transition:transform 0.15s cubic-bezier(.34,1.56,.64,1), background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .nav-icon-btn:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.25); }
        .nav-icon-btn:active { transform:translateY(0) scale(0.92); box-shadow:none; }

        .nav-dropdown { transform-origin: top right; animation: navDropdown3D 0.28s cubic-bezier(.16,1,.3,1) both; }
        .nav-mobile-panel { animation: navMobileSlide 0.3s cubic-bezier(0.16,1,0.3,1) both; overflow: hidden; }
        .nav-mobile-item { opacity:0; animation: navItemFade 0.32s cubic-bezier(.16,1,.3,1) both; }
        .nav-ai-pulse { animation: navPing 2.4s ease-in-out infinite; }

        .nav-avatar-wrap { transition:transform 0.15s ease-out; transform-style:preserve-3d; will-change:transform; }

        .nav-cta-primary {
          position:relative; transition:transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s, filter 0.2s;
        }
        .nav-cta-primary:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(139,92,246,0.35); }
        .nav-cta-primary:active { transform:translateY(0) scale(0.96); }

        @media (prefers-reduced-motion: reduce) {
          .nav-dropdown, .nav-mobile-panel, .nav-mobile-item, .nav-ai-pulse, .nav-neon-text, .nav-shimmer-edge { animation: none !important; }
          .nav-logo-badge, .nav-avatar-wrap, .nav-pill-indicator, .nav-link-3d, .nav-icon-btn, .nav-cta-primary { transition: none !important; transform: none !important; }
        }
      `}</style>

      <nav className={`navbar-glass sticky top-0 z-50 ${scrolled ? 'scrolled' : ''}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="nav-shimmer-edge" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="nav-logo-wrap flex items-center gap-2.5">
              <div
                ref={logoRef}
                className="nav-logo-badge"
                {...makeTiltHandlers(logoRef, 20)}
              >
                🤝
              </div>
              <span className="font-bold text-lg nav-neon-text hidden sm:block">SkillBridge</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 relative" ref={navContainerRef}>
              <div
                className="nav-pill-indicator"
                style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width, opacity: indicator.opacity }}
              />
              {navLinks.map(link => (
                (!link.auth || user) && (
                  <NavLink key={link.to} to={link.to}
                    ref={el => { if (el) linkRefs.current[link.to] = el; else delete linkRefs.current[link.to]; }}
                    className={({ isActive }) =>
                      `nav-link-3d px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isActive
                        ? 'text-cyan-300'
                        : 'text-slate-400 hover:text-slate-100'}`}>
                    {link.glow && <Sparkles size={12} className="text-fuchsia-300"/>}
                    {link.label}
                  </NavLink>
                )
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <NavLink to="/dashboard"
                    className={({ isActive }) =>
                      `nav-icon-btn hidden md:flex items-center justify-center w-9 h-9 rounded-lg ${isActive ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-400/20' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}
                    title="Dashboard">
                    <LayoutDashboard size={18} />
                  </NavLink>

                  <NavLink to="/chat"
                    className={({ isActive }) =>
                      `nav-icon-btn hidden md:flex items-center justify-center w-9 h-9 rounded-lg ${isActive ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-400/20' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}
                    title="Chat">
                    <MessageSquare size={18} />
                  </NavLink>

                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                      className="nav-icon-btn relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5"
                      aria-label="Notifications">
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="nav-ai-pulse absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="nav-dropdown absolute right-0 top-11 w-80 rounded-2xl overflow-hidden z-50"
                        style={{ background: 'rgba(8,3,24,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                          <h3 className="font-semibold text-slate-100 text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-cyan-300 hover:underline">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center text-slate-500 py-8 text-sm">No notifications yet</p>
                          ) : (
                            notifications.slice(0, 10).map(notif => (
                              <div key={notif._id}
                                className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-cyan-500/5' : ''}`}>
                                <p className="text-sm font-medium text-slate-100">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{notif.body}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-white/5">
                          <Link to="/dashboard" onClick={() => setNotifOpen(false)}
                            className="block text-center text-xs text-cyan-300 hover:underline">
                            View all
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                      className="nav-icon-btn flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white/5">
                      <div
                        ref={avatarRef}
                        className="nav-avatar-wrap relative"
                        {...makeTiltHandlers(avatarRef, 14)}
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -4px 8px rgba(0,0,0,0.2)' }}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="hidden md:block text-sm font-medium text-slate-200 max-w-[100px] truncate">
                        {user.name?.split(' ')[0]}
                      </span>
                      <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileOpen && (
                      <div className="nav-dropdown absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50"
                        style={{ background: 'rgba(8,3,24,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        <div className="p-3 border-b border-white/5">
                          <p className="font-semibold text-sm text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { to: `/profile/${user._id}`, icon: <User size={15} />, label: 'My Profile' },
                            { to: '/profile/edit', icon: <Settings size={15} />, label: 'Edit Profile' },
                            { to: '/achievements', icon: <Trophy size={15} />, label: 'Achievements' },
                            { to: '/sessions', icon: <Zap size={15} />, label: 'My Sessions' },
                          ].map(item => (
                            <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition-colors">
                              <span className="text-slate-500">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                          <hr className="border-white/5 my-1" />
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors">
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="hidden sm:flex px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors">Sign In</Link>
                  <Link to="/signup"
                    className="nav-cta-primary group relative px-4 py-2 rounded-lg text-sm font-semibold text-white overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', boxShadow: '0 0 14px rgba(139,92,246,0.3)' }}>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="nav-icon-btn md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="nav-mobile-panel md:hidden border-t border-white/5 py-3">
              {navLinks.map((link, i) => (
                (!link.auth || user) && (
                  <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `nav-mobile-item flex items-center gap-1.5 px-4 py-3 text-sm font-medium rounded-lg mx-1 mb-1 transition-colors ${isActive ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-white/5'}`}
                    style={{ animationDelay: `${i * 0.04}s` }}>
                    {link.glow && <Sparkles size={13} className="text-fuchsia-300"/>}
                    {link.label}
                  </NavLink>
                )
              ))}
              {user && (
                <>
                  <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="nav-mobile-item flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-lg mx-1" style={{ animationDelay: '0.16s' }}>
                    <LayoutDashboard size={15} className="text-slate-500"/> Dashboard
                  </NavLink>
                  <NavLink to="/chat" onClick={() => setMobileOpen(false)} className="nav-mobile-item flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-lg mx-1" style={{ animationDelay: '0.2s' }}>
                    <MessageSquare size={15} className="text-slate-500"/> Chat
                  </NavLink>
                  <button onClick={handleLogout} className="nav-mobile-item w-full flex items-center gap-2 text-left px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10 rounded-lg mx-1" style={{ animationDelay: '0.24s' }}>
                    <LogOut size={15}/> Sign Out
                  </button>
                </>
              )}
              {!user && (
                <div className="flex gap-2 px-1 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition-colors">Sign In</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;