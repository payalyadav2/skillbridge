import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Zap, Star, Sparkles, Globe, Shield, Video, Trophy, Brain, ChevronRight } from 'lucide-react';
import api from '../api/axios.js';

/* ─── Data ──────────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { name: 'Technology', emoji: '💻', color: '#7C3AED', glow: '#7C3AED40' },
  { name: 'Design', emoji: '🎨', color: '#EC4899', glow: '#EC489940' },
  { name: 'Music', emoji: '🎵', color: '#06B6D4', glow: '#06B6D440' },
  { name: 'Language', emoji: '🌍', color: '#10B981', glow: '#10B98140' },
  { name: 'Cooking', emoji: '🍳', color: '#F59E0B', glow: '#F59E0B40' },
  { name: 'Fitness', emoji: '💪', color: '#EF4444', glow: '#EF444440' },
  { name: 'Business', emoji: '📊', color: '#8B5CF6', glow: '#8B5CF640' },
  { name: 'Photography', emoji: '📸', color: '#3B82F6', glow: '#3B82F640' },
];

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Gemini AI finds perfect skill partners based on your goals and expertise — no manual searching needed.', color: '#7C3AED' },
  { icon: Video, title: 'Live Video Sessions', desc: 'Built-in video calls with screen sharing. Learn face-to-face from anywhere in the world.', color: '#06B6D4' },
  { icon: Globe, title: 'Local Community Map', desc: 'Interactive map shows skilled neighbors nearby. Meet in person or connect online seamlessly.', color: '#10B981' },
  { icon: Trophy, title: 'Achievement System', desc: 'Earn badges, level up, and build your reputation as you complete more exchanges.', color: '#F59E0B' },
  { icon: Shield, title: 'Verified Skills', desc: 'AI-generated assessments verify expertise before you invest time in an exchange.', color: '#EC4899' },
  { icon: Sparkles, title: 'Zero Cost Exchange', desc: 'No money involved — ever. Pure skill-for-skill trading that benefits both parties equally.', color: '#8B5CF6' },
];

const STEPS = [
  { num: '01', title: 'Create Profile', desc: 'List your skills to teach and what you want to learn.', icon: '👤' },
  { num: '02', title: 'AI Finds Matches', desc: 'Our AI pairs you with people who have complementary needs.', icon: '🤖' },
  { num: '03', title: 'Send a Request', desc: 'Propose a skill exchange in seconds.', icon: '📨' },
  { num: '04', title: 'Start Learning', desc: 'Chat, schedule sessions, and grow together.', icon: '🚀' },
];

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numeric = parseInt(target.replace(/\D/g, ''));
        const duration = 2000;
        const steps = 60;
        const increment = numeric / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numeric) { setCount(numeric); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Floating 3D Card (Hero decoration) ───────────────────────────────── */
function FloatingCard({ style, className = '', children }) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'floatY 4s ease-in-out infinite',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Hero Particles (lightweight, GPU-only transform/opacity) ─────────── */
function HeroParticles({ count = 28 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 12,
      drift: (Math.random() - 0.5) * 60,
      color: ['#7C3AED', '#06B6D4', '#EC4899'][i % 3],
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map(p => (
        <span
          key={p.id}
          className="hero-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
const Home = () => {
  const { user } = useSelector(state => state.auth);
  const [recentSkills, setRecentSkills] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    api.get('/skills?limit=6&sort=-createdAt').then(({ data }) => {
      setRecentSkills(data.data || []);
    }).catch(() => {});
  }, []);

  // Mouse-follow glow + subtle parallax, scoped to the hero only, rAF-throttled for smoothness
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const handle = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setMousePos({ x, y });
      });
    };

    el.addEventListener('mousemove', handle);
    return () => {
      el.removeEventListener('mousemove', handle);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const px = (mousePos.x - 0.5) * 20;
  const py = (mousePos.y - 0.5) * 20;

  return (
    <>
      {/* ── Global Styles ──────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
          --bg-deep: #020010;
          --neon-purple: #7C3AED;
          --neon-cyan: #06B6D4;
          --neon-pink: #EC4899;
          --neon-green: #10B981;
          --glass-bg: rgba(255,255,255,0.05);
          --glass-border: rgba(255,255,255,0.12);
          --text-primary: #F8FAFC;
          --text-muted: #94A3B8;
        }

        .sb-page { background: #020010; font-family: 'Inter', sans-serif; color: #F8FAFC; overflow-x: hidden; }

        /* Grid background (static sections, unchanged) */
        .grid-bg {
          background-image:
            linear-gradient(rgba(124,58,237,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.15) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ════════════════════════════════════════════════════════════
           HERO — industry-level animation layer
           ════════════════════════════════════════════════════════════ */

        .hero-section {
          position: relative;
          isolation: isolate;
        }

        /* Moving grid — drifts slowly downward, masked so it fades at the edges */
        .hero-grid-moving {
          position: absolute;
          inset: -60px;
          background-image:
            linear-gradient(rgba(124,58,237,0.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.16) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 85%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 85%);
          animation: gridDrift 14s linear infinite;
          will-change: transform;
          z-index: 0;
        }
        @keyframes gridDrift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, 56px, 0); }
        }

        /* Aurora — slow rotating colour wash behind everything */
        .hero-aurora {
          position: absolute;
          inset: -45%;
          background:
            radial-gradient(circle at 22% 25%, rgba(124,58,237,0.38), transparent 38%),
            radial-gradient(circle at 78% 30%, rgba(6,182,212,0.30), transparent 38%),
            radial-gradient(circle at 45% 80%, rgba(236,72,153,0.24), transparent 38%);
          filter: blur(80px);
          animation: auroraSpin 24s linear infinite;
          will-change: transform;
          z-index: 0;
          opacity: 0.9;
        }
        @keyframes auroraSpin {
          0%   { transform: translate3d(-6%, -4%, 0) rotate(0deg) scale(1); }
          50%  { transform: translate3d(6%, 4%, 0) rotate(180deg) scale(1.08); }
          100% { transform: translate3d(-6%, -4%, 0) rotate(360deg) scale(1); }
        }

        /* Spotlight beam from the top */
        .hero-spotlight {
          position: absolute;
          top: -320px;
          left: 50%;
          width: 900px;
          height: 720px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(255,255,255,0.07), transparent 70%);
          filter: blur(70px);
          z-index: 0;
          pointer-events: none;
        }

        /* Mouse-follow glow */
        .hero-mouse-glow {
          position: absolute;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.20), rgba(6,182,212,0.08) 45%, transparent 72%);
          transform: translate3d(-50%, -50%, 0);
          filter: blur(50px);
          z-index: 1;
          pointer-events: none;
          transition: left 0.25s ease-out, top 0.25s ease-out;
        }

        /* Rotating decorative ring behind the heading */
        .hero-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 620px;
          height: 620px;
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 50%;
          transform: translate3d(-50%, -50%, 0) rotate(0deg);
          animation: ringSpin 50s linear infinite;
          z-index: 0;
          pointer-events: none;
        }
        .hero-ring::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #06B6D4;
          box-shadow: 0 0 12px #06B6D4, 0 0 24px #06B6D4;
        }
        .hero-ring-outer {
          width: 760px;
          height: 760px;
          border-color: rgba(6,182,212,0.12);
          animation-duration: 70s;
          animation-direction: reverse;
        }
        @keyframes ringSpin {
          to { transform: translate3d(-50%, -50%, 0) rotate(360deg); }
        }

        /* Floating particles rising through the hero */
        .hero-particle {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          opacity: 0;
          animation: particleRise linear infinite;
          will-change: transform, opacity;
        }
        @keyframes particleRise {
          0%   { transform: translate3d(0, 0, 0) translateX(0); opacity: 0; }
          10%  { opacity: 0.8; }
          85%  { opacity: 0.5; }
          100% { transform: translate3d(var(--drift), -640px, 0); opacity: 0; }
        }

        /* Animated gradient heading */
        .hero-gradient-text {
          background: linear-gradient(90deg, #A78BFA, #06B6D4, #EC4899, #A78BFA);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 7s linear infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        /* Animated gradient mesh (legacy orbs, kept for lower sections) */
        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -20px) rotate(120deg); }
          66% { transform: translate(-20px, 30px) rotate(240deg); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes floatY2 {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.2); }
          50% { box-shadow: 0 0 40px rgba(124,58,237,0.7), 0 0 100px rgba(124,58,237,0.3); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateOrb {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade-up { animation: fadeInUp 0.8s ease forwards; }
        .animate-fade-up-d1 { animation: fadeInUp 0.8s 0.1s ease both; }
        .animate-fade-up-d2 { animation: fadeInUp 0.8s 0.2s ease both; }
        .animate-fade-up-d3 { animation: fadeInUp 0.8s 0.3s ease both; }
        .animate-fade-up-d4 { animation: fadeInUp 0.8s 0.4s ease both; }

        /* Glass card */
        .glass-card {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(124,58,237,0.5);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(124,58,237,0.2);
        }

        /* Animated glowing border for hero floating cards */
        .glass-card-glow {
          position: relative;
        }
        .glass-card-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(120deg, transparent, #7C3AED, #06B6D4, transparent);
          background-size: 250% 250%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderGlow 5s linear infinite;
          pointer-events: none;
        }
        @keyframes borderGlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 250% 50%; }
        }

        /* Neon button */
        .btn-neon {
          background: linear-gradient(135deg, #7C3AED, #06B6D4);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 14px 32px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 0 30px rgba(124,58,237,0.5);
          font-family: 'Space Grotesk', sans-serif;
        }
        .btn-neon::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .btn-neon:hover::before { left: 100%; }
        .btn-neon:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 0 20px #7C3AED, 0 0 50px #7C3AED, 0 0 90px #06B6D4;
        }

        .btn-ghost {
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50px;
          padding: 14px 32px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          font-family: 'Space Grotesk', sans-serif;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(124,58,237,0.6);
          transform: translateY(-2px);
        }

        /* Scroll indicator */
        .hero-scroll-indicator {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 3;
          opacity: 0.7;
        }
        .hero-scroll-indicator span {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #64748B;
          font-family: 'JetBrains Mono', monospace;
        }
        .hero-scroll-indicator .dot {
          width: 18px;
          height: 28px;
          border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          position: relative;
        }
        .hero-scroll-indicator .dot::after {
          content: '';
          position: absolute;
          top: 5px;
          left: 50%;
          width: 3px;
          height: 6px;
          margin-left: -1.5px;
          border-radius: 2px;
          background: #06B6D4;
          animation: scrollDot 1.8s ease-in-out infinite;
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        /* Category flip card */
        .flip-card { perspective: 1000px; cursor: pointer; }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 120px;
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%; height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .flip-card-back { transform: rotateY(180deg); }

        /* Step connector */
        .step-connector {
          background: linear-gradient(90deg, #7C3AED, #06B6D4);
          height: 2px;
          flex: 1;
          opacity: 0.4;
          position: relative;
          overflow: hidden;
        }
        .step-connector::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: shimmer 3s infinite;
        }

        /* Orb */
        .orb {
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #7C3AED, #06B6D4, #EC4899, #7C3AED);
          animation: rotateOrb 8s linear infinite;
          filter: blur(40px);
          opacity: 0.6;
        }

        /* Skill badge */
        .skill-type-offer {
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3));
          border: 1px solid rgba(124,58,237,0.5);
          color: #A78BFA;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .skill-type-want {
          background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(245,158,11,0.3));
          border: 1px solid rgba(236,72,153,0.5);
          color: #F9A8D4;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Section heading */
        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.4);
          border-radius: 50px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #A78BFA;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-family: 'Space Grotesk', sans-serif;
        }

        @media (max-width: 768px) {
          .hero-float-cards { display: none; }
          .orb { width: 200px; height: 200px; }
          .hero-ring, .hero-ring-outer { display: none; }
          .hero-mouse-glow { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
          .hero-mouse-glow { display: none; }
        }
      `}</style>

      <div className="sb-page">

        {/* ── JSON-LD SEO ───────────────────────────────────────────────────── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SkillBridge",
          "description": "AI-powered local skill exchange platform. Trade skills directly — teach what you know, learn what you want.",
          "url": "https://skillbridge.app",
          "potentialAction": { "@type": "SearchAction", "target": "https://skillbridge.app/skills?q={search_term_string}", "query-input": "required name=search_term_string" }
        })}} />

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="hero-section"
          style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
        >

          {/* Aurora wash */}
          <div className="hero-aurora" />

          {/* Slow-drifting grid, masked to a soft vignette */}
          <div className="hero-grid-moving" />

          {/* Top-down spotlight */}
          <div className="hero-spotlight" />

          {/* Rotating decorative rings behind the heading */}
          <div className="hero-ring hero-ring-outer" />
          <div className="hero-ring" />

          {/* Cursor-follow glow */}
          <div
            className="hero-mouse-glow"
            style={{ left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%` }}
          />

          {/* Original animated gradient orbs — kept, layered above aurora */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', animation: 'meshMove 12s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)', animation: 'meshMove 15s ease-in-out infinite reverse' }} />
          </div>

          {/* Floating particles rising through the hero */}
          <HeroParticles count={28} />

          {/* Scanline effect */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)', zIndex: 1, pointerEvents: 'none' }} />

          {/* Floating UI cards (decorative) */}
          <div className="hero-float-cards" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            <FloatingCard className="glass-card-glow" style={{ top: '18%', right: '8%', animationDelay: '0s', animationDuration: '5s', minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍💻</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', fontFamily: 'Space Grotesk' }}>Rahul K.</div>
                  <div style={{ fontSize: 11, color: '#A78BFA' }}>Teaches React</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>Wants: Guitar Lessons 🎸</div>
            </FloatingCard>

            <FloatingCard style={{ top: '55%', right: '5%', animationDelay: '1.5s', animationDuration: '6s', minWidth: '170px' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>🏆</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', fontFamily: 'Space Grotesk' }}>Achievement!</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>5 skills exchanged</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard style={{ top: '25%', left: '5%', animationDelay: '0.8s', animationDuration: '7s', minWidth: '160px' }}>
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>✓ AI Match Found!</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>98% compatibility</div>
            </FloatingCard>

            <FloatingCard style={{ bottom: '25%', left: '6%', animationDelay: '2s', animationDuration: '5.5s', minWidth: '150px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🎸</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>Guitar ↔ Python</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Live session</div>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Hero content */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              maxWidth: '900px',
              margin: '0 auto',
              padding: '120px 24px 80px',
              textAlign: 'center',
              transform: `translate3d(${px * -0.3}px, ${py * -0.3}px, 0)`,
              transition: 'transform 0.2s ease-out',
            }}
          >

            <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 50, padding: '8px 20px', marginBottom: 32, fontSize: 13, fontWeight: 600, color: '#A78BFA', fontFamily: 'Space Grotesk' }}>
              <Zap size={14} style={{ color: '#F59E0B' }} />
              AI-Powered Skill Exchange Platform
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'glowPulse 2s infinite' }} />
            </div>

            <h1
              className="animate-fade-up-d1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(2.8rem, 7vw, 5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 24,
                letterSpacing: '-0.02em',
              }}
            >
              Teach What You Know,{' '}
              <span className="hero-gradient-text">
                Learn What You Want
              </span>
            </h1>

            <p className="animate-fade-up-d2" style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}>
              SkillBridge connects people who swap skills — no money, just knowledge.
              Cook in exchange for coding. Design for guitar lessons. Anything goes.
            </p>

            <div className="animate-fade-up-d3" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 60 }}>
              {user ? (
                <Link to="/dashboard" className="btn-neon">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-neon">
                    Start Exchanging Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/skills" className="btn-ghost">
                    Browse Skills
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="animate-fade-up-d4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { value: '5000', suffix: '+', label: 'Learners' },
                { value: '12000', suffix: '+', label: 'Exchanges Done' },
                { value: '200', suffix: '+', label: 'Skill Categories' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg, #A78BFA, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll-indicator">
            <span>Scroll</span>
            <div className="dot" />
          </div>
        </section>

        {/* ── CATEGORIES ─────────────────────────────────────────────────────── */}
        <section style={{ padding: '100px 24px', position: 'relative' }} className="grid-bg">
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="section-tag"><Star size={12} /> Explore</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 12 }}>
                Every Skill Has Value
              </h2>
              <p style={{ color: '#64748B', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
                From tech to cooking — find your next skill exchange
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.name}
                  to={`/skills?category=${cat.name}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      {/* Front */}
                      <div
                        className="flip-card-front"
                        style={{
                          background: `radial-gradient(circle at center, ${cat.glow} 0%, rgba(2,0,16,0.8) 100%)`,
                          border: `1px solid ${cat.color}30`,
                        }}
                      >
                        <div style={{ fontSize: 36 }}>{cat.emoji}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', fontFamily: 'Space Grotesk' }}>{cat.name}</div>
                      </div>
                      {/* Back */}
                      <div
                        className="flip-card-back"
                        style={{
                          background: `linear-gradient(135deg, ${cat.color}30, ${cat.glow})`,
                          border: `1px solid ${cat.color}60`,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: cat.color, fontFamily: 'Space Grotesk' }}>Explore →</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{cat.name} skills</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
        <section style={{ padding: '100px 24px', background: 'rgba(124,58,237,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="section-tag"><Zap size={12} /> Process</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 12 }}>
                Four Steps to Start
              </h2>
              <p style={{ color: '#64748B', fontSize: 16 }}>No friction, no fees — just skill exchange</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
              {STEPS.map((step, i) => (
                <React.Fragment key={step.num}>
                  <div style={{ textAlign: 'center', flex: '1 1 180px', maxWidth: 220, padding: '0 8px' }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7C3AED20, #06B6D420)',
                      border: '2px solid rgba(124,58,237,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, margin: '0 auto 16px',
                      boxShadow: '0 0 30px rgba(124,58,237,0.3)',
                      animation: 'glowPulse 3s ease-in-out infinite',
                      animationDelay: `${i * 0.5}s`,
                    }}>{step.icon}</div>

                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#7C3AED', fontWeight: 700, marginBottom: 8, letterSpacing: 2 }}>{step.num}</div>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#F8FAFC' }}>{step.title}</h3>
                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>

                  {/* Connector */}
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', paddingTop: 36, minWidth: 40 }}>
                      <div className="step-connector" style={{ width: 40 }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────────────── */}
        <section style={{ padding: '100px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div className="section-tag"><Sparkles size={12} /> Features</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: 12 }}>
                Everything You Need
              </h2>
              <p style={{ color: '#64748B', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
                A complete platform built for effective skill sharing
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="glass-card"
                  style={{ padding: '28px', cursor: 'default', animationDelay: `${i * 0.1}s` }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${f.color}20`,
                    border: `1px solid ${f.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                    boxShadow: `0 0 20px ${f.color}20`,
                  }}>
                    <f.icon size={24} color={f.color} />
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#F8FAFC' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECENT SKILLS ──────────────────────────────────────────────────── */}
        {recentSkills.length > 0 && (
          <section style={{ padding: '80px 24px', background: 'rgba(6,182,212,0.03)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="section-tag" style={{ marginBottom: 8 }}><Globe size={12} /> Live</div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700 }}>Recently Listed Skills</h2>
                </div>
                <Link to="/skills" className="btn-ghost" style={{ padding: '10px 22px', fontSize: 13 }}>
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {recentSkills.map(skill => (
                  <Link
                    key={skill._id}
                    to={`/skills/${skill._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <span className={skill.type === 'offered' ? 'skill-type-offer' : 'skill-type-want'}>
                          {skill.type === 'offered' ? '✦ Offering' : '◇ Wanted'}
                        </span>
                        {skill.level && (
                          <span style={{ fontSize: 10, color: '#64748B', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>{skill.level}</span>
                        )}
                      </div>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#F1F5F9' }}>{skill.title}</h3>
                      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{skill.description}</p>
                      {skill.owner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                            {skill.owner.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>{skill.owner.name}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.15) 100%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(124,58,237,0.2)', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}><Zap size={12} /> Get Started</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
              Ready to Start Exchanging?
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 17, marginBottom: 40, lineHeight: 1.6 }}>
              Join thousands trading skills in their community.<br />No money. No middlemen. Just learning.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-neon" style={{ fontSize: 16, padding: '16px 36px' }}>
                Create Free Account <ArrowRight size={20} />
              </Link>
              <Link to="/skills" className="btn-ghost" style={{ fontSize: 16, padding: '16px 36px' }}>
                Browse Skills
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;