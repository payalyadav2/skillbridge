import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

// ── Social icons as inline SVG ────────────────────────────────────────────────
const TwitterX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const LinkedIn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const GitHub = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)
const Discord = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)
const ArrowUpRight = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M7 7h10v10"/>
  </svg>
)

// ── Nav columns (all links preserved) ─────────────────────────────────────────
const NAV = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Skills',    to: '/skills' },
      { label: 'Nearby Users',     to: '/nearby' },
      { label: 'AI Tools',         to: '/ai' },
      { label: 'Achievements',     to: '/achievements' },
    ],
  },
  {
    title: 'My Space',
    links: [
      { label: 'Dashboard',        to: '/dashboard' },
      { label: 'Exchanges',        to: '/exchanges' },
      { label: 'Sessions',         to: '/sessions' },
      { label: 'Messages',         to: '/chat' },
      { label: 'Reviews',          to: '/reviews' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign Up',          to: '/signup' },
      { label: 'Log In',           to: '/login' },
      { label: 'Edit Profile',     to: '/profile/edit' },
      { label: 'Verify Email',     to: '/verify-email' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',            to: '/about' },
      { label: 'How It Works',     to: '/how' },
      { label: 'Privacy Policy',   to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Contact',          to: '/contact' },
    ],
  },
]

const SOCIAL = [
  { Icon: TwitterX, href: 'https://twitter.com/skillbridge',           label: 'Twitter / X' },
  { Icon: LinkedIn, href: 'https://linkedin.com/company/skillbridge',  label: 'LinkedIn' },
  { Icon: GitHub,   href: 'https://github.com/skillbridge',            label: 'GitHub' },
  { Icon: Discord,  href: 'https://discord.gg/skillbridge',            label: 'Discord' },
]

// ── Component ─────────────────────────────────────────────────────────────────
const Footer = () => {
  const { user } = useSelector(state => state.auth)
  const year = new Date().getFullYear()
  const footerRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <footer ref={footerRef} className={`ft-root${revealed ? ' ft-revealed' : ''}`} style={{ position: 'relative', background: '#010008', overflow: 'hidden' }}>
      <style>{`
        .ft-shimmer-border {
          position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(34,211,238,0.55) 20%,rgba(167,139,250,0.55) 50%,rgba(244,114,182,0.45) 80%,transparent);
          background-size:200% 100%;
          animation:ft-border-shimmer 7s linear infinite;
        }
        @keyframes ft-border-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .ft-orb-l {
          position:absolute; left:-100px; bottom:-100px;
          width:300px; height:300px; border-radius:50%;
          background:radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%);
          filter:blur(40px); pointer-events:none;
        }
        .ft-orb-r {
          position:absolute; right:-70px; top:-40px;
          width:260px; height:260px; border-radius:50%;
          background:radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 70%);
          filter:blur(40px); pointer-events:none;
        }

        /* Scroll-reveal: each top-level block fades + rises in, staggered */
        .ft-fade {
          opacity:0; transform:translateY(14px);
          transition:opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1);
        }
        .ft-revealed .ft-fade { opacity:1; transform:translateY(0); }

        .ft-logo-mark {
          width:34px; height:34px; border-radius:10px;
          background:linear-gradient(135deg,#7C3AED,#06B6D4);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; box-shadow:0 0 14px rgba(124,58,237,0.35);
          transition:transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s;
        }
        .ft-brand:hover .ft-logo-mark { transform:scale(1.08) rotate(-4deg); box-shadow:0 0 20px rgba(124,58,237,0.55); }

        .ft-social {
          width:32px; height:32px; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.5);
          text-decoration:none;
          transition:transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .ft-social:hover {
          background:rgba(34,211,238,0.14);
          border-color:rgba(34,211,238,0.4);
          color:#22d3ee;
          box-shadow:0 0 14px rgba(34,211,238,0.25);
          transform:translateY(-3px) scale(1.05);
        }

        .ft-col-title {
          font-family:'Space Grotesk',sans-serif;
          font-size:10.5px; font-weight:700;
          color:#22d3ee;
          text-transform:uppercase; letter-spacing:0.12em;
          margin:0 0 12px 0;
        }
        .ft-link {
          position:relative;
          font-size:12.5px;
          color:rgba(255,255,255,0.42);
          text-decoration:none;
          transition:color 0.2s;
          display:inline-block;
        }
        .ft-link::after {
          content:''; position:absolute; left:0; bottom:-3px; height:1px; width:0;
          background:linear-gradient(90deg,#22d3ee,#a78bfa);
          transition:width 0.25s cubic-bezier(.16,1,.3,1);
        }
        .ft-link:hover { color:rgba(255,255,255,0.95); }
        .ft-link:hover::after { width:100%; }

        .ft-cta {
          display:inline-flex; align-items:center; gap:5px;
          padding:8px 16px; border-radius:9px;
          font-weight:700; font-size:12.5px; text-decoration:none;
          transition:transform 0.2s, box-shadow 0.2s, filter 0.2s;
          white-space:nowrap;
        }
        .ft-cta-primary { background:linear-gradient(135deg,#22d3ee,#818cf8); color:#020010; box-shadow:0 0 16px rgba(34,211,238,0.22); }
        .ft-cta-primary:hover { transform:translateY(-1px); box-shadow:0 0 24px rgba(34,211,238,0.4); filter:brightness(1.05); }
        .ft-cta-ghost { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.75); }
        .ft-cta-ghost:hover { border-color:rgba(34,211,238,0.35); color:#22d3ee; transform:translateY(-1px); }

        .ft-status-dot { position:relative; width:7px; height:7px; flex-shrink:0; }
        .ft-status-dot::before {
          content:''; position:absolute; inset:0; border-radius:50%; background:#34d399;
        }
        .ft-status-dot::after {
          content:''; position:absolute; inset:0; border-radius:50%; background:#34d399;
          animation:ft-ping 1.8s ease-out infinite;
        }
        @keyframes ft-ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.4);opacity:0} }

        .ft-bottom-link {
          font-size:11px; color:rgba(255,255,255,0.28); text-decoration:none; transition:color 0.2s;
        }
        .ft-bottom-link:hover { color:rgba(255,255,255,0.65); }

        .ft-main-grid { display:grid; grid-template-columns:minmax(180px,1.3fr) repeat(4,1fr); gap:28px 24px; }
        @media (max-width:900px) { .ft-main-grid { grid-template-columns:1fr 1fr; } }
        @media (max-width:560px) { .ft-main-grid { grid-template-columns:1fr; } }

        @media (prefers-reduced-motion: reduce) {
          .ft-fade { opacity:1 !important; transform:none !important; transition:none !important; }
          .ft-shimmer-border, .ft-status-dot::after { animation:none !important; }
          .ft-social, .ft-logo-mark, .ft-cta { transition:none !important; }
        }
      `}</style>

      <div className="ft-shimmer-border" />
      <div className="ft-orb-l" />
      <div className="ft-orb-r" />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0', position: 'relative', zIndex: 1 }}>

        {/* ── Top row: brand + social + CTA ──────────────────────────────── */}
        <div className="ft-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
          <Link to="/" className="ft-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div className="ft-logo-mark">🤝</div>
            <div>
              <div style={{
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 16, lineHeight: 1.1,
                background: 'linear-gradient(135deg,#A78BFA,#22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>SkillBridge</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>Trade skills, not money</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 7 }}>
              {SOCIAL.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ft-social" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
            {!user ? (
              <Link to="/signup" className="ft-cta ft-cta-primary">Join Free <ArrowUpRight /></Link>
            ) : (
              <Link to="/dashboard" className="ft-cta ft-cta-ghost">Dashboard <ArrowUpRight /></Link>
            )}
          </div>
        </div>

        {/* ── Link grid ───────────────────────────────────────────────────── */}
        <div className="ft-main-grid" style={{ marginBottom: 28 }}>
          <div className="ft-fade" style={{ transitionDelay: '0.05s' }}>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.38)', margin: 0, maxWidth: 230 }}>
              The community platform for skill exchange — teach what you know, learn what you need. Free forever.
            </p>
          </div>

          {NAV.map((col, i) => (
            <div key={col.title} className="ft-fade" style={{ transitionDelay: `${0.1 + i * 0.06}s` }}>
              <h4 className="ft-col-title">{col.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="ft-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────────── */}
        <div className="ft-fade" style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 0 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
              © {year} SkillBridge
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="ft-status-dot" />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>All systems operational</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Sitemap', '/sitemap']].map(([label, to]) => (
              <Link key={label} to={to} className="ft-bottom-link">{label}</Link>
            ))}
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>|</span>
            <a href="mailto:hello@skillbridge.app" className="ft-bottom-link">hello@skillbridge.app</a>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer