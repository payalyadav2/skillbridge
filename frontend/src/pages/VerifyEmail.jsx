import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../api/axios.js';

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading');
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(2);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const id = params.get('id');
    if (!token || !id) { setStatus('error'); return; }
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`)
      .then(({ data }) => {
        localStorage.setItem('accessToken', data.data.accessToken);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, []);

  // Countdown + redirect only fires after success, giving the user a visible cue before navigation
  useEffect(() => {
    if (status !== 'success') return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); window.location.href = '/dashboard'; return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020010] text-slate-100 overflow-hidden px-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={`absolute -top-32 -left-24 w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000 animate-[float1_18s_ease-in-out_infinite] ${
          status === 'success' ? 'bg-emerald-500/15' : status === 'error' ? 'bg-rose-500/15' : 'bg-cyan-500/15'
        }`}/>
        <div className={`absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] transition-colors duration-1000 animate-[float2_22s_ease-in-out_infinite] ${
          status === 'success' ? 'bg-cyan-500/10' : status === 'error' ? 'bg-orange-500/10' : 'bg-fuchsia-600/10'
        }`}/>
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}/>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.15)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes iconPop3d { 0%{opacity:0; transform:rotateY(-90deg) scale(0.5)} 60%{transform:rotateY(10deg) scale(1.05)} 100%{opacity:1; transform:rotateY(0deg) scale(1)} }
        @keyframes ringExpand { 0%{transform:scale(0.8); opacity:0.6} 100%{transform:scale(1.6); opacity:0} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .glass-strong { background: rgba(255,255,255,0.05); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); }
        .neon-text { background: linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6); background-size: 200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation: shimmer 6s linear infinite; }
        .icon-3d { animation: iconPop3d 0.6s cubic-bezier(0.34,1.56,0.64,1) both; transform-style: preserve-3d; }
        .pulse-ring { animation: ringExpand 1.8s ease-out infinite; }
        .spin-slow { animation: spinSlow 1.4s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .icon-3d, .pulse-ring, .spin-slow, .animate-[float1_18s_ease-in-out_infinite], .animate-[float2_22s_ease-in-out_infinite] { animation: none !important; }
        }
      `}</style>

      <div className={`relative z-10 glass-strong rounded-3xl p-8 md:p-10 text-center max-w-md w-full ${mounted ? 'fade-up' : 'opacity-0'}`}>

        {status === 'loading' && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full glass border border-cyan-400/20"/>
              <Loader2 size={32} className="text-cyan-300 spin-slow relative z-10"/>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Verifying your email...</h2>
            <p className="text-slate-500 text-sm">This usually takes just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <span className="pulse-ring absolute inset-0 rounded-full border-2 border-emerald-400/50"/>
              <div className="icon-3d w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 0 30px rgba(16,185,129,0.35)' }}>
                <CheckCircle2 size={36} className="text-white"/>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-100">Email <span className="neon-text">Verified!</span></h2>
            <p className="text-slate-400 mb-1">Your account is now active.</p>
            <p className="text-slate-500 text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Redirecting in {countdown}s...
            </p>
            <Link to="/dashboard"
              className="group mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
              Go now <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform"/>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="icon-3d w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f43f5e,#fb923c)', boxShadow: '0 0 30px rgba(244,63,94,0.3)' }}>
                <XCircle size={36} className="text-white"/>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-100">Verification Failed</h2>
            <p className="text-slate-400 mb-7 text-sm">This link is invalid or has expired. Verification links are single-use and time-limited for your security.</p>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
              Back to Login
            </Link>
          </>
        )}

        {status !== 'loading' && (
          <div className="flex items-center justify-center gap-2 mt-7 pt-5 border-t border-white/5 text-[11px] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400"/> Secured by SkillBridge
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;