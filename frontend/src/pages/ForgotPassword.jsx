import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, Sparkles } from 'lucide-react';
import api from '../api/axios.js';

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .fp-page { background:#020010; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; font-family:'Inter',sans-serif; color:#F8FAFC; position:relative; overflow:hidden; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.35)}
    50%{box-shadow:0 0 40px rgba(124,58,237,0.7),0 0 80px rgba(6,182,212,0.25)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
  @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(1.08)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes popBounce { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes shimmerBar { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes gridDrift { from{background-position:0 0} to{background-position:60px 60px} }

  .fp-grid-bg {
    position:absolute; inset:0; z-index:0; opacity:0.5;
    background-image:linear-gradient(rgba(124,58,237,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.07) 1px,transparent 1px);
    background-size:48px 48px; animation:gridDrift 12s linear infinite;
    mask-image:radial-gradient(ellipse 60% 50% at 50% 40%, black 0%, transparent 75%);
  }

  .fp-card { background:rgba(255,255,255,0.045); border:1px solid rgba(255,255,255,0.1); border-radius:24px; backdrop-filter:blur(24px); padding:38px 34px; width:100%; max-width:420px; position:relative; z-index:1; box-shadow:0 30px 80px rgba(0,0,0,0.5); }

  .fp-logo-badge { width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg,#7C3AED,#06B6D4); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 20px rgba(124,58,237,0.5); animation:glowPulse 3s infinite; flex-shrink:0; }

  .fp-label { font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; font-family:'Space Grotesk',sans-serif; }

  .fp-input-wrap { position:relative; display:flex; align-items:center; }
  .fp-input-wrap svg { position:absolute; left:16px; pointer-events:none; color:#475569; transition:color 0.2s ease; }
  .fp-input {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:14px;
    padding:13px 16px 13px 44px; color:#F8FAFC; font-size:14px; outline:none; transition:all 0.2s ease; font-family:'Inter',sans-serif;
  }
  .fp-input:focus { border-color:rgba(124,58,237,0.6); box-shadow:0 0 0 3px rgba(124,58,237,0.14); background:rgba(124,58,237,0.06); }
  .fp-input:focus ~ svg, .fp-input-wrap:has(.fp-input:focus) svg { color:#A78BFA; }
  .fp-input::placeholder { color:#475569; }

  .fp-error { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#F87171; border-radius:14px; padding:12px 16px; font-size:13px; margin-bottom:18px; animation:fadeInUp 0.3s ease both; }

  .fp-submit-btn {
    width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
    background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; border:none; border-radius:50px;
    padding:14px; font-weight:700; font-size:14px; cursor:pointer; position:relative; overflow:hidden;
    transition:all 0.3s ease; font-family:'Space Grotesk',sans-serif; box-shadow:0 0 26px rgba(124,58,237,0.45);
  }
  .fp-submit-btn::before {
    content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
    transition:left 0.5s;
  }
  .fp-submit-btn:hover::before { left:100%; }
  .fp-submit-btn:hover { transform:translateY(-2px); box-shadow:0 0 38px rgba(124,58,237,0.7); }
  .fp-submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .fp-back-link { display:flex; align-items:center; justify-content:center; gap:6px; text-align:center; font-size:13px; color:#64748B; text-decoration:none; transition:color 0.2s ease; font-family:'Space Grotesk',sans-serif; font-weight:500; }
  .fp-back-link:hover { color:#A78BFA; }

  .fp-success-icon {
    width:80px; height:80px; border-radius:50%; margin:0 auto 22px; display:flex; align-items:center; justify-content:center;
    background:rgba(124,58,237,0.15); border:2px solid rgba(124,58,237,0.35); font-size:36px;
    animation:popBounce 0.5s ease both, glowPulse 3s 0.5s infinite;
  }

  .fp-cta-btn {
    display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff;
    border:none; border-radius:50px; padding:12px 28px; font-weight:700; font-size:14px; cursor:pointer;
    font-family:'Space Grotesk',sans-serif; box-shadow:0 0 26px rgba(124,58,237,0.45); transition:all 0.3s ease;
    text-decoration:none;
  }
  .fp-cta-btn:hover { transform:translateY(-2px); box-shadow:0 0 38px rgba(124,58,237,0.7); }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="fp-page">
        {/* Grid + orbs */}
        <div className="fp-grid-bg" />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '8%', left: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 70%)', animation: 'orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.18) 0%,transparent 70%)', animation: 'orb2 17s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', animation: 'orb3 11s ease-in-out infinite' }} />
        </div>

        <div className="fp-card" style={{ animation: 'fadeInUp 0.6s ease both' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30, textDecoration: 'none' }}>
            <div className="fp-logo-badge">🤝</div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 17, background: 'linear-gradient(135deg,#F8FAFC,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              SkillBridge
            </span>
          </Link>

          {status === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="fp-success-icon">📧</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 21, color: '#F1F5F9', marginBottom: 8 }}>Check your inbox!</h2>
              <p style={{ color: '#64748B', fontSize: 13, marginBottom: 26, lineHeight: 1.6 }}>Reset link sent if that email exists in our system.</p>
              <Link to="/login" className="fp-cta-btn">
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 50, padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#A78BFA', letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 14 }}>
                  <Sparkles size={11} /> Account Recovery
                </span>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 25, color: '#F8FAFC', letterSpacing: '-0.01em' }}>Forgot password?</h2>
                <p style={{ color: '#64748B', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>No worries — enter your email and we'll send you a reset link.</p>
              </div>

              {error && <div className="fp-error">{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="fp-label">Email address</label>
                  <div className="fp-input-wrap">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="fp-input"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="fp-submit-btn">
                  {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Sending...</> : 'Send Reset Link'}
                </button>
                <Link to="/login" className="fp-back-link">
                  <ArrowLeft size={13} /> Back to login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;