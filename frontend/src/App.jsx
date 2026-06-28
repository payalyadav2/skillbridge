import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchCurrentUser } from './store/index.js';
import { SocketProvider } from './context/SocketContext.jsx';

import Navbar from './components/common/Navbar.jsx';
import AdminNavbar from './components/common/AdminNavbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Skills from './pages/Skills.jsx';
import SkillDetail from './pages/SkillDetail.jsx';
import Chat from './pages/Chat.jsx';
import Exchanges from './pages/Exchanges.jsx';
import Sessions from './pages/Sessions.jsx';
import SessionRoom from './pages/SessionRoom.jsx';
import NearbyUsers from './pages/NearbyUsers.jsx';
import AITools from './pages/AITools.jsx';
import Achievements from './pages/Achievements.jsx';
import Reviews from './pages/Reviews.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import About from './pages/About.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Contact from './pages/Contact.jsx';
import Sitemap from './pages/Sitemap.jsx';

// Routes that render as standalone, full-screen flows — no public Navbar/Footer chrome.
const AUTH_ONLY_PATHS = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];

const AppContent = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { accessToken, initialized } = useSelector(state => state.auth);
  const mainRef = useRef(null);

  const isAuthPage = AUTH_ONLY_PATHS.includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  // Industry-site behaviour: every navigation starts the new page from the top,
  // never inherits scroll position from the page you came from.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Re-trigger the fade/rise-in transition on the new page without unmounting
    // the route tree (so things like sockets/local state in nested routes survive).
    const el = mainRef.current;
    if (el) {
      el.classList.remove('page-transition-play');
      void el.offsetWidth; // force reflow so the animation restarts
      el.classList.add('page-transition-play');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch({ type: 'auth/fetchMe/rejected' });
    }
  }, []);

  // FIX 1: Global loading screen — dark theme consistent with all pages
  if (!initialized && accessToken) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020010',
        }}
      >
        {/* Ambient orbs */}
        <div style={{
          position: 'fixed', top: '20%', left: '15%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed', bottom: '20%', right: '15%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', position: 'relative' }}>
          {/* Neon spinner */}
          <div style={{
            width: '52px', height: '52px',
            border: '3px solid rgba(34,211,238,0.15)',
            borderTop: '3px solid #22d3ee',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(34,211,238,0.3)',
          }} />
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(34,211,238,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
          }}>
            Loading SkillBridge...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    // FIX 2: bg-gray-50 → #020010 so no white flash between page transitions
    <div style={{ minHeight: '100vh', background: '#020010', display: 'flex', flexDirection: 'column' }}>
      {/* Auth pages (login/signup/etc.) render standalone — no Navbar/Footer chrome.
          Admin gets its own minimal AdminNavbar instead of the public Navbar.
          Every other route keeps the normal Navbar + Footer. */}
      {!isAuthPage && (isAdminPage ? <AdminNavbar /> : <Navbar />)}
      <main ref={mainRef} className="page-transition-play" style={{ flex: 1 }}>
        <style>{`
          @keyframes pageFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .page-transition-play { animation: pageFadeIn 0.4s cubic-bezier(0.16,1,0.3,1); }
          @media (prefers-reduced-motion: reduce) {
            .page-transition-play { animation: none !important; }
          }
        `}</style>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/exchanges" element={<Exchanges />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/session/:roomId" element={<SessionRoom />} />
            <Route path="/nearby" element={<NearbyUsers />} />
            <Route path="/ai" element={<AITools />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/reviews" element={<Reviews />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Company pages */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sitemap" element={<Sitemap />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
};

const App = () => (
  <BrowserRouter basename="/skillbridge">
    <SocketProvider>
      <AppContent />
    </SocketProvider>
    {/* FIX 3: Toaster — dark glass theme consistent with design system */}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(15, 10, 40, 0.95)',
          color: '#e2e8f0',
          borderRadius: '14px',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: "'Space Grotesk', sans-serif",
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(34,211,238,0.06)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#22d3ee', secondary: 'rgba(15,10,40,0.95)' },
          style: {
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(34,211,238,0.1)',
          },
        },
        error: {
          iconTheme: { primary: '#f43f5e', secondary: 'rgba(15,10,40,0.95)' },
          style: {
            border: '1px solid rgba(244, 63, 94, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(244,63,94,0.1)',
          },
        },
      }}
    />
  </BrowserRouter>
);

export default App;