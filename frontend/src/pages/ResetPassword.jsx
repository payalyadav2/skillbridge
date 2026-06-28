import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const ResetPassword = () => {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [focused, setFocused] = useState('');
  const orb1 = useRef(null);
  const orb2 = useRef(null);
  const orb3 = useRef(null);

  useEffect(() => {
    const s = form.password;
    let score = 0;
    if (s.length >= 6) score++;
    if (s.length >= 10) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    setStrength(score);
  }, [form.password]);

  useEffect(() => {
    if (status !== 'success') return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); window.location.href = '/login'; return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const handleMouse = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (orb1.current) orb1.current.style.transform = `translate(${x * 40 - 20}px, ${y * 40 - 20}px)`;
      if (orb2.current) orb2.current.style.transform = `translate(${-x * 30 + 15}px, ${-y * 30 + 15}px)`;
      if (orb3.current) orb3.current.style.transform = `translate(${x * 20 - 10}px, ${y * 20 - 10}px)`;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const params = new URLSearchParams(window.location.search);
    setStatus('loading');
    try {
      await api.post('/auth/reset-password', {
        token: params.get('token'),
        id: params.get('id'),
        password: form.password
      });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    }
  };

  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

  const match = form.confirm && form.password === form.confirm;
  const mismatch = form.confirm && form.password !== form.confirm;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-root {
          min-height: 100vh;
          background: #020010;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .rp-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .rp-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); top: -100px; right: -100px; }
        .rp-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%); bottom: -80px; left: -80px; }
        .rp-orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%); top: 40%; left: 50%; transform: translateX(-50%); }

        .rp-grid-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .rp-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.1), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .rp-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 2rem;
        }
        .rp-logo-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .rp-logo-icon svg { width: 20px; height: 20px; fill: white; }
        .rp-logo-text { font-size: 16px; font-weight: 600; color: white; letter-spacing: -0.02em; }

        .rp-heading { font-size: 26px; font-weight: 700; color: white; letter-spacing: -0.03em; margin-bottom: 6px; }
        .rp-sub { font-size: 14px; color: rgba(255,255,255,0.45); margin-bottom: 2rem; }

        .rp-field { margin-bottom: 1rem; }
        .rp-label { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.5); margin-bottom: 6px; letter-spacing: 0.04em; text-transform: uppercase; }

        .rp-input-wrap {
          position: relative;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .rp-input-wrap::before {
          content: '';
          position: absolute; inset: -1px;
          border-radius: 13px;
          background: linear-gradient(135deg, rgba(99,102,241,0), rgba(99,102,241,0));
          transition: background 0.3s;
          z-index: 0;
        }
        .rp-input-wrap.focused::before {
          background: linear-gradient(135deg, rgba(99,102,241,0.6), rgba(168,85,247,0.4));
        }
        .rp-input-wrap.match::before { background: linear-gradient(135deg, rgba(34,197,94,0.5), rgba(16,185,129,0.3)); }
        .rp-input-wrap.mismatch::before { background: linear-gradient(135deg, rgba(239,68,68,0.5), rgba(239,68,68,0.3)); }

        .rp-input {
          position: relative; z-index: 1;
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 13px 44px 13px 16px;
          font-size: 15px;
          font-family: 'Space Grotesk', sans-serif;
          color: white;
          outline: none;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .rp-input::placeholder { color: rgba(255,255,255,0.2); }
        .rp-input:focus { background: rgba(255,255,255,0.07); border-color: transparent; }

        .rp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          z-index: 2; cursor: pointer; color: rgba(255,255,255,0.3);
          background: none; border: none; padding: 4px;
          transition: color 0.2s;
          display: flex; align-items: center;
        }
        .rp-eye:hover { color: rgba(255,255,255,0.7); }
        .rp-eye svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        .rp-strength-bar { margin-top: 8px; }
        .rp-strength-track {
          display: flex; gap: 4px; margin-bottom: 4px;
        }
        .rp-strength-seg {
          flex: 1; height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.08);
          transition: background 0.4s;
        }
        .rp-strength-label { font-size: 11px; color: rgba(255,255,255,0.35); font-family: 'JetBrains Mono', monospace; }

        .rp-match-hint {
          font-size: 11px; margin-top: 5px; font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
        }

        .rp-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 8px;
        }
        .rp-error svg { width: 16px; height: 16px; stroke: #f87171; fill: none; stroke-width: 2; stroke-linecap: round; flex-shrink: 0; }

        .rp-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
          color: white; cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.3s;
          box-shadow: 0 0 30px rgba(99,102,241,0.3);
          margin-top: 1.5rem;
          letter-spacing: 0.01em;
        }
        .rp-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s;
        }
        .rp-btn:hover::before { left: 100%; }
        .rp-btn:hover { transform: translateY(-1px); box-shadow: 0 0 50px rgba(99,102,241,0.45); }
        .rp-btn:active { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .rp-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .rp-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .rp-back { text-align: center; margin-top: 1.25rem; font-size: 13px; color: rgba(255,255,255,0.3); }
        .rp-back a { color: rgba(139,92,246,0.8); text-decoration: none; font-weight: 500; }
        .rp-back a:hover { color: #8b5cf6; }

        /* Success state */
        .rp-success { text-align: center; padding: 1rem 0; }
        .rp-success-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          animation: successPulse 1.5s ease infinite;
        }
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 0 16px rgba(16,185,129,0); }
        }
        .rp-success-icon svg { width: 32px; height: 32px; stroke: #10b981; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .rp-success-title { font-size: 22px; font-weight: 700; color: white; letter-spacing: -0.02em; margin-bottom: 8px; }
        .rp-success-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; }
        .rp-countdown {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px; padding: 8px 16px;
          font-size: 13px; color: rgba(255,255,255,0.5);
          font-family: 'JetBrains Mono', monospace;
        }
        .rp-countdown-num { font-size: 18px; font-weight: 600; color: #10b981; min-width: 24px; text-align: center; }

        .rp-card { animation: cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }

        .rp-field { animation: fieldIn 0.4s ease both; }
        .rp-field:nth-child(1) { animation-delay: 0.1s; }
        .rp-field:nth-child(2) { animation-delay: 0.2s; }
        @keyframes fieldIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

        @media (max-width: 480px) {
          .rp-card { padding: 1.75rem 1.5rem; border-radius: 20px; }
          .rp-heading { font-size: 22px; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-orb rp-orb-1" ref={orb1} />
        <div className="rp-orb rp-orb-2" ref={orb2} />
        <div className="rp-orb rp-orb-3" ref={orb3} />
        <div className="rp-grid-overlay" />

        <div className="rp-card">
          {status === 'success' ? (
            <div className="rp-success">
              <div className="rp-success-icon">
                <svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>
              </div>
              <h2 className="rp-success-title">Password updated</h2>
              <p className="rp-success-sub">Your new password is set. Taking you to login.</p>
              <div className="rp-countdown">
                <span>Redirecting in</span>
                <span className="rp-countdown-num">{countdown}</span>
                <span>sec</span>
              </div>
            </div>
          ) : (
            <>
              <div className="rp-logo">
                <div className="rp-logo-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                </div>
                <span className="rp-logo-text">SkillBridge</span>
              </div>

              <h1 className="rp-heading">Set new password</h1>
              <p className="rp-sub">Choose something strong — you won't be able to reuse this link.</p>

              {error && (
                <div className="rp-error">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="rp-field">
                  <div className="rp-label">
                    <span>New password</span>
                    {form.password && (
                      <span style={{ color: strengthColors[strength], fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                        {strengthLabels[strength]}
                      </span>
                    )}
                  </div>
                  <div className={`rp-input-wrap ${focused === 'password' ? 'focused' : ''}`}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="rp-input"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                      required
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                      {showPass
                        ? <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {form.password && (
                    <div className="rp-strength-bar">
                      <div className="rp-strength-track">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="rp-strength-seg" style={{ background: i <= strength ? strengthColors[strength] : undefined }} />
                        ))}
                      </div>
                      <span className="rp-strength-label">
                        {strength < 3 ? 'Add uppercase, numbers or symbols' : 'Looking good!'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rp-field">
                  <div className="rp-label"><span>Confirm password</span></div>
                  <div className={`rp-input-wrap ${focused === 'confirm' ? 'focused' : ''} ${match ? 'match' : ''} ${mismatch ? 'mismatch' : ''}`}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="rp-input"
                      placeholder="Repeat password"
                      value={form.confirm}
                      onChange={e => setForm({ ...form, confirm: e.target.value })}
                      onFocus={() => setFocused('confirm')}
                      onBlur={() => setFocused('')}
                      required
                    />
                    <button type="button" className="rp-eye" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm">
                      {showConfirm
                        ? <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {form.confirm && (
                    <div className="rp-match-hint" style={{ color: match ? '#10b981' : '#f87171' }}>
                      {match ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </div>
                  )}
                </div>

                <button type="submit" className="rp-btn" disabled={status === 'loading'}>
                  <div className="rp-btn-inner">
                    {status === 'loading' ? (
                      <>
                        <div className="rp-spinner" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg style={{ width: 18, height: 18, stroke: 'white', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }} viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Reset password
                      </>
                    )}
                  </div>
                </button>
              </form>

              <div className="rp-back">
                Remember it now? <Link to="/login">Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;