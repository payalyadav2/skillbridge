import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Zap, Mail, Lock, Loader, Sparkles } from 'lucide-react'
import { loginUser } from '../store/index.js'

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .lg-page { background:#020010; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; font-family:'Inter',sans-serif; color:#F8FAFC; position:relative; overflow:hidden; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.35)}
    50%{box-shadow:0 0 40px rgba(124,58,237,0.7),0 0 80px rgba(6,182,212,0.25)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
  @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(1.08)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes gridDrift { from{background-position:0 0} to{background-position:60px 60px} }

  .lg-grid-bg {
    position:absolute; inset:0; z-index:0; opacity:0.5;
    background-image:linear-gradient(rgba(124,58,237,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.07) 1px,transparent 1px);
    background-size:48px 48px; animation:gridDrift 12s linear infinite;
    mask-image:radial-gradient(ellipse 60% 50% at 50% 40%, black 0%, transparent 75%);
  }

  .lg-card { background:rgba(255,255,255,0.045); border:1px solid rgba(255,255,255,0.1); border-radius:24px; backdrop-filter:blur(24px); padding:38px 34px; width:100%; max-width:420px; position:relative; z-index:1; box-shadow:0 30px 80px rgba(0,0,0,0.5); }

  .lg-logo-badge { width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#7C3AED,#06B6D4); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 0 26px rgba(124,58,237,0.5); animation:glowPulse 3s infinite; }

  .lg-label { font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; font-family:'Space Grotesk',sans-serif; }

  .lg-input-wrap { position:relative; display:flex; align-items:center; }
  .lg-input-wrap > svg { position:absolute; left:16px; pointer-events:none; color:#475569; z-index:1; }
  .lg-input {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:14px;
    padding:13px 16px 13px 44px; color:#F8FAFC; font-size:14px; outline:none; transition:all 0.2s ease; font-family:'Inter',sans-serif;
  }
  .lg-input.has-toggle { padding-right:44px; }
  .lg-input:focus { border-color:rgba(124,58,237,0.6); box-shadow:0 0 0 3px rgba(124,58,237,0.14); background:rgba(124,58,237,0.06); }
  .lg-input::placeholder { color:#475569; }

  .lg-eye-btn { position:absolute; right:14px; background:none; border:none; color:#475569; cursor:pointer; display:flex; align-items:center; transition:color 0.2s ease; z-index:1; }
  .lg-eye-btn:hover { color:#A78BFA; }

  .lg-forgot-link { font-size:13px; color:#A78BFA; text-decoration:none; font-weight:600; font-family:'Space Grotesk',sans-serif; transition:color 0.2s ease; }
  .lg-forgot-link:hover { color:#06B6D4; }

  .lg-submit-btn {
    width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
    background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; border:none; border-radius:50px;
    padding:14px; font-weight:700; font-size:14px; cursor:pointer; position:relative; overflow:hidden;
    transition:all 0.3s ease; font-family:'Space Grotesk',sans-serif; box-shadow:0 0 26px rgba(124,58,237,0.45);
  }
  .lg-submit-btn::before {
    content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
    transition:left 0.5s;
  }
  .lg-submit-btn:hover::before { left:100%; }
  .lg-submit-btn:hover { transform:translateY(-2px); box-shadow:0 0 38px rgba(124,58,237,0.7); }
  .lg-submit-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }

  .lg-signup-link { color:#A78BFA; font-weight:700; text-decoration:none; font-family:'Space Grotesk',sans-serif; transition:color 0.2s ease; }
  .lg-signup-link:hover { color:#06B6D4; }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const { loading: isLoading } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true })
    } else {
      setError(result.payload || 'Login failed')
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="lg-page">
        {/* Grid + orbs */}
        <div className="lg-grid-bg" />
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '8%', left: '8%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 70%)', animation: 'orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.18) 0%,transparent 70%)', animation: 'orb2 17s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', animation: 'orb3 11s ease-in-out infinite' }} />
        </div>

        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInUp 0.6s ease both' }}>
          <div className="lg-card">
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div className="lg-logo-badge">
                <Zap size={24} color="#fff" />
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 50, padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#A78BFA', letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 14 }}>
                <Sparkles size={11} /> Welcome Back
              </span>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 25, color: '#F8FAFC', letterSpacing: '-0.01em' }}>Welcome back</h1>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 8 }}>Sign in to your SkillBridge account</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#FDA4AF', borderRadius: 14, padding: '12px 14px', fontSize: 13 }} role="alert">
                  {error}
                </div>
              )}
              <div>
                <label className="lg-label">Email address</label>
                <div className="lg-input-wrap">
                  <Mail size={16} />
                  <input
                    type="email"
                    className="lg-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="lg-label">Password</label>
                <div className="lg-input-wrap">
                  <Lock size={16} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="lg-input has-toggle"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="lg-eye-btn">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/forgot-password" className="lg-forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="lg-submit-btn" disabled={isLoading}>
                {isLoading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Signing in...</> : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 26 }}>
              Don't have an account?{' '}
              <Link to="/signup" className="lg-signup-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
export default Login