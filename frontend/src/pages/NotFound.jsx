import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .nf-page { background:#020010; min-height:80vh; display:flex; align-items:center; justify-content:center; padding:24px; font-family:'Inter',sans-serif; color:#F8FAFC; position:relative; overflow:hidden; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
  @keyframes gridDrift { from{background-position:0 0} to{background-position:60px 60px} }
  @keyframes floatBob { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
  @keyframes glitch {
    0%,100% { clip-path: inset(0 0 0 0); transform:translate(0,0); }
    20% { clip-path: inset(20% 0 60% 0); transform:translate(-3px,1px); }
    40% { clip-path: inset(60% 0 10% 0); transform:translate(3px,-1px); }
    60% { clip-path: inset(10% 0 70% 0); transform:translate(-2px,2px); }
    80% { clip-path: inset(80% 0 5% 0); transform:translate(2px,-2px); }
  }
  @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }

  .nf-grid-bg {
    position:absolute; inset:0; z-index:0; opacity:0.5;
    background-image:linear-gradient(rgba(124,58,237,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.07) 1px,transparent 1px);
    background-size:48px 48px; animation:gridDrift 14s linear infinite;
    mask-image:radial-gradient(ellipse 60% 50% at 50% 45%, black 0%, transparent 75%);
  }

  .nf-404-wrap { position:relative; display:inline-block; }
  .nf-404 {
    font-family:'JetBrains Mono',monospace; font-size:clamp(5rem,16vw,9rem); font-weight:700; line-height:1;
    background:linear-gradient(135deg,#A78BFA,#06B6D4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    position:relative; letter-spacing:-2px;
  }
  .nf-404-glitch1, .nf-404-glitch2 {
    position:absolute; inset:0; font-family:'JetBrains Mono',monospace; font-size:clamp(5rem,16vw,9rem); font-weight:700; line-height:1;
    letter-spacing:-2px;
  }
  .nf-404-glitch1 { color:#06B6D4; opacity:0.7; animation:glitch 3.5s infinite linear; }
  .nf-404-glitch2 { color:#7C3AED; opacity:0.7; animation:glitch 3.5s infinite linear reverse; animation-delay:0.15s; }

  .nf-scan-overlay { position:absolute; top:-10%; left:-10%; width:120%; height:6px; background:linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent); animation:scanLine 4s ease-in-out infinite; pointer-events:none; }

  .nf-emoji { font-size:64px; display:inline-block; animation:floatBob 4s ease-in-out infinite; filter:drop-shadow(0 0 24px rgba(124,58,237,0.4)); }

  .nf-btn-primary {
    display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff;
    border:none; border-radius:50px; padding:13px 28px; font-weight:700; font-size:14px; cursor:pointer;
    font-family:'Space Grotesk',sans-serif; box-shadow:0 0 26px rgba(124,58,237,0.45); transition:all 0.3s ease;
    text-decoration:none; position:relative; overflow:hidden;
  }
  .nf-btn-primary::before {
    content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent); transition:left 0.5s;
  }
  .nf-btn-primary:hover::before { left:100%; }
  .nf-btn-primary:hover { transform:translateY(-2px); box-shadow:0 0 38px rgba(124,58,237,0.7); }

  .nf-btn-secondary {
    display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.14);
    color:#A78BFA; border-radius:50px; padding:13px 28px; font-weight:700; font-size:14px; cursor:pointer;
    font-family:'Space Grotesk',sans-serif; transition:all 0.25s ease; text-decoration:none;
  }
  .nf-btn-secondary:hover { background:rgba(124,58,237,0.16); border-color:rgba(124,58,237,0.4); transform:translateY(-2px); }

  .nf-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(124,58,237,0.18); border:1px solid rgba(124,58,237,0.4); border-radius:50px; padding:5px 14px; font-size:11px; font-weight:700; color:#A78BFA; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk',sans-serif; }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const NotFound = () => (
  <>
    <style>{STYLES}</style>
    <div className="nf-page">
      {/* Grid + orbs */}
      <div className="nf-grid-bg" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)', animation: 'orb1 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '8%', right: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.16) 0%,transparent 70%)', animation: 'orb2 17s ease-in-out infinite' }} />
      </div>

      <div style={{ textAlign: 'center', padding: '0 16px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.6s ease both', maxWidth: 520 }}>

        <span className="nf-emoji">🤷</span>

        <div className="nf-404-wrap" style={{ display: 'block', margin: '8px 0 6px' }}>
          <span className="nf-404">404</span>
          <span className="nf-404-glitch1" aria-hidden="true">404</span>
          <span className="nf-404-glitch2" aria-hidden="true">404</span>
          <div className="nf-scan-overlay" />
        </div>

        <div className="nf-tag" style={{ marginBottom: 18 }}>Signal Lost</div>

        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#F8FAFC', marginBottom: 14, letterSpacing: '-0.01em' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 32, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 32px' }}>
          The page you're looking for doesn't exist. Maybe the skill exchange is happening somewhere else?
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="nf-btn-primary"><Home size={16} /> Go Home</Link>
          <Link to="/skills" className="nf-btn-secondary"><Search size={16} /> Browse Skills</Link>
        </div>
      </div>
    </div>
  </>
);

export default NotFound;