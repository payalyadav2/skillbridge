import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { registerUser } from '../store/index.js';
import toast from 'react-hot-toast';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(state => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // bot trap — real users never see/fill this

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  const pwChecks = [
    { label: 'At least 6 characters', valid: form.password.length >= 6 },
    { label: 'Contains a letter', valid: /[a-zA-Z]/.test(form.password) },
    { label: 'Contains a number', valid: /[0-9]/.test(form.password) },
  ];

  // Strength score drives the signature 3D meter — purely client-side UX signal, never trust this for real validation
  const strength = useMemo(() => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 6) score++;
    if (form.password.length >= 10) score++;
    if (/[a-z]/.test(form.password) && /[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^a-zA-Z0-9]/.test(form.password)) score++;
    return Math.min(score, 5);
  }, [form.password]);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];
  const strengthColor = ['', '#f87171', '#fb923c', '#facc15', '#34d399', '#22d3ee'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Honeypot field — if a bot fills this hidden field, silently reject without revealing the trap
    if (honeypot) { setError('Something went wrong. Please try again.'); return; }
    if (!form.name.trim() || !form.email || !form.password) {
      setError('All fields are required'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    const result = await dispatch(registerUser({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to SkillBridge!');
      navigate('/dashboard');
    } else {
      setError(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#020010] text-slate-100 overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.15)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes tilt3d { 0%,100%{transform:rotateY(-3deg) rotateX(1deg)} 50%{transform:rotateY(3deg) rotateX(-1deg)} }
        @keyframes barGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .glass { background: rgba(255,255,255,0.035); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); }
        .glass-input:focus { border-color: rgba(34,211,238,0.5); box-shadow: 0 0 0 3px rgba(34,211,238,0.12); }
        .neon-text { background: linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6); background-size: 200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation: shimmer 6s linear infinite; }
        .brand-card { animation: tilt3d 10s ease-in-out infinite; transform-style: preserve-3d; }
        .strength-bar { transform-origin: left; animation: barGrow 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .honeypot-field { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; opacity: 0; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .brand-card, .strength-bar { animation: none !important; }
        }
      `}</style>

      {/* Honeypot — invisible to humans, traps simple bots; never gets focus/tab order */}
      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="company_website">Company Website</label>
        <input id="company_website" type="text" name="company_website" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </div>

      {/* LEFT — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-fuchsia-600/15 blur-[100px] animate-[float1_18s_ease-in-out_infinite]"/>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] animate-[float2_22s_ease-in-out_infinite]"/>
        </div>

        <div className={`w-full max-w-md relative ${mounted ? 'fade-up' : 'opacity-0'}`}>
          <Link to="/" className="flex items-center gap-2.5 mb-9">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>🤝</div>
            <span className="font-bold text-xl neon-text">SkillBridge</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-medium tracking-wide text-cyan-300 mb-4">
            <Sparkles size={12}/> JOIN THE COMMUNITY
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Create your account</h1>
          <p className="text-slate-400 mb-8 text-[15px]">Join thousands exchanging skills, free forever.</p>

          {error && (
            <div className="bg-rose-500/10 border border-rose-400/30 text-rose-200 rounded-xl p-3.5 mb-6 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" noValidate>
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input id="name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Smith" maxLength={80}
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  autoComplete="name" required/>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com" maxLength={120}
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  autoComplete="email" required/>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input id="password" type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a password" maxLength={128}
                  className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
                  autoComplete="new-password" required/>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>

              {/* Signature element: 3D segmented strength meter */}
              {form.password && (
                <div className="mt-3 fade-up">
                  <div className="flex gap-1.5 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        {i <= strength && (
                          <div className="strength-bar h-full rounded-full" style={{ background: strengthColor, boxShadow: `0 0 8px ${strengthColor}` }}/>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] font-medium mb-2" style={{ color: strengthColor }} aria-live="polite">
                    Password strength: {strengthLabel}
                  </p>
                  <div className="space-y-1">
                    {pwChecks.map(c => (
                      <div key={c.label} className={`flex items-center gap-2 text-[12px] transition-colors ${c.valid ? 'text-emerald-300' : 'text-slate-500'}`}>
                        <Check size={12} className={c.valid ? 'opacity-100' : 'opacity-30'}/>
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="group relative w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-2 overflow-hidden flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><span>Create Account</span><ArrowRight size={18}/></>}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-500 mt-5 leading-relaxed">
            By signing up, you agree to our <Link to="/terms" className="underline hover:text-slate-300">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-slate-300">Privacy Policy</Link>.
          </p>
          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-300 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* RIGHT — Brand showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0a0420,#1e0a3c)' }}/>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-cyan-500/15 blur-[100px]"/>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-fuchsia-600/15 blur-[100px]"/>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '44px 44px' }}/>
        </div>

        <div className="relative z-10 max-w-md text-center [perspective:1200px]">
          <div className="brand-card glass rounded-3xl p-10 border border-white/10">
            <div className="text-7xl mb-6">🌟</div>
            <h2 className="text-3xl font-bold mb-4 text-slate-100">Start Your Skill Journey Today</h2>
            <p className="text-slate-400 leading-relaxed">
              List your skills, find your matches, and start learning from real people in your community — all for free.
            </p>
            <div className="flex items-center justify-center gap-2 mt-7 pt-6 border-t border-white/10 text-[12px] text-slate-500">
              <ShieldCheck size={14} className="text-emerald-400"/> Encrypted &amp; privacy-first by design
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;