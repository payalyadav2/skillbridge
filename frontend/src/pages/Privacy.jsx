import { useState } from 'react'
import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    id: 'collect',
    icon: '📦',
    title: 'What We Collect',
    content: [
      {
        sub: 'Account Information',
        text: 'When you sign up, we collect your name, email address, and an optional profile photo. You choose what else to share — skills, bio, location — and can change or delete it any time.',
      },
      {
        sub: 'Usage Data',
        text: 'We log which features you use and when — not to profile you, but to understand what\'s working and what isn\'t. This data is aggregated, not tied to you personally in our analytics.',
      },
      {
        sub: 'Messages & Sessions',
        text: 'Chat messages and session content are stored encrypted. We do not read them. They exist solely so you can access them — and they\'re deleted when you delete your account.',
      },
      {
        sub: 'Location (Optional)',
        text: 'The Nearby Users feature uses your location only with explicit permission. Location is never stored on our servers — it\'s matched client-side and discarded immediately.',
      },
    ],
  },
  {
    id: 'use',
    icon: '⚙️',
    title: 'How We Use It',
    content: [
      {
        sub: 'To run the platform',
        text: 'Match you with skills, send notifications, process exchanges, and keep your account secure. No data is used outside of making SkillBridge work for you.',
      },
      {
        sub: 'To improve the product',
        text: 'Aggregate usage patterns help us prioritize what to build next. We never sell this data or use it to make decisions about individual users.',
      },
      {
        sub: 'To communicate with you',
        text: 'We send transactional emails (session reminders, exchange updates) and, only if you opt in, a weekly digest. Unsubscribe with one click — no dark patterns.',
      },
    ],
  },
  {
    id: 'share',
    icon: '🔗',
    title: 'Who We Share It With',
    content: [
      {
        sub: 'Nobody buys your data',
        text: 'We do not sell, rent, or trade your personal information to advertisers, data brokers, or third parties. Full stop.',
      },
      {
        sub: 'Service providers',
        text: 'We use a small number of trusted vendors (email delivery, cloud hosting, payment processing) who are contractually bound to handle your data per our standards — never for their own purposes.',
      },
      {
        sub: 'Legal requirements',
        text: 'If a valid court order requires disclosure, we\'ll comply. We\'ll notify you when legally permitted. We will always challenge overly broad requests.',
      },
    ],
  },
  {
    id: 'rights',
    icon: '⚖️',
    title: 'Your Rights',
    content: [
      {
        sub: 'Access & portability',
        text: 'Request a full export of your data any time — messages, profile, exchange history — in a machine-readable format. Head to Settings → Export Data.',
      },
      {
        sub: 'Correction',
        text: 'Update any personal information directly from your profile. If something\'s wrong that you can\'t fix yourself, email us and we\'ll correct it within 72 hours.',
      },
      {
        sub: 'Deletion',
        text: 'Delete your account and all associated data permanently from Settings → Delete Account. Backups are purged within 30 days. Some aggregate data (anonymised) may remain.',
      },
      {
        sub: 'Objection',
        text: 'Opt out of non-essential data processing at any time. Withdraw consent for location, analytics, or marketing emails independently — each is a separate toggle in Settings.',
      },
    ],
  },
  {
    id: 'security',
    icon: '🔒',
    title: 'Security',
    content: [
      {
        sub: 'Encryption in transit and at rest',
        text: 'All data is encrypted using TLS 1.3 in transit and AES-256 at rest. Passwords are hashed with bcrypt; we never store them in plain text.',
      },
      {
        sub: 'Access controls',
        text: 'Fewer than five engineers have production database access, and all access is logged. We run regular third-party security audits.',
      },
      {
        sub: 'Breach response',
        text: 'If a breach occurs, we\'ll notify affected users within 72 hours — faster if possible. We maintain an incident response plan and test it quarterly.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: '🍪',
    title: 'Cookies',
    content: [
      {
        sub: 'What we set',
        text: 'We use a single session cookie to keep you logged in, and an optional preferences cookie (theme, language). No tracking pixels. No third-party advertising cookies.',
      },
      {
        sub: 'Analytics',
        text: 'We use privacy-focused analytics (no fingerprinting, no cross-site tracking). You can opt out entirely from Settings → Privacy.',
      },
    ],
  },
]

const Privacy = () => {
  const [active, setActive] = useState('collect')

  return (
    <div style={{ background: '#020010', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&display=swap');
        .pp-nav-item {
          display:flex; align-items:center; gap:10px;
          padding:12px 16px; border-radius:12px; cursor:pointer;
          font-size:13px; font-weight:500; color:rgba(255,255,255,0.45);
          transition:all 0.2s; border:1px solid transparent;
          background:none; width:100%; text-align:left;
        }
        .pp-nav-item:hover { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.04); }
        .pp-nav-item.active {
          color:#22d3ee; background:rgba(34,211,238,0.08);
          border-color:rgba(34,211,238,0.2);
        }
        .pp-sub {
          font-weight:600; font-size:15px; color:#fff; margin-bottom:8px;
          display:flex; align-items:center; gap:8px;
        }
        .pp-sub::before {
          content:''; display:block; width:3px; height:16px;
          background:linear-gradient(180deg,#22d3ee,#7C3AED);
          border-radius:2px; flex-shrink:0;
        }
        .pp-glow {
          position:absolute; top:-100px; right:-100px;
          width:400px; height:400px; border-radius:50%;
          background:radial-gradient(circle,rgba(34,211,238,0.06) 0%,transparent 70%);
          filter:blur(60px); pointer-events:none;
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="pp-glow" />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', marginBottom: 20 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee', letterSpacing: '0.05em' }}>PRIVACY POLICY</span>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,5vw,48px)', lineHeight: 1.1, marginBottom: 16 }}>
          Your privacy is not{' '}
          <span style={{ background: 'linear-gradient(135deg,#A78BFA,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            negotiable
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.7 }}>
          We wrote this policy to be read, not to protect us legally. If something is unclear, that's our failure — <a href="mailto:privacy@skillbridge.app" style={{ color: '#22d3ee', textDecoration: 'none' }}>email us</a>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>📅 Last updated: June 2025</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>🌍 Applies globally</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>⚖️ GDPR + CCPA compliant</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'start' }}>

        {/* Sticky sidebar */}
        <aside style={{ position: 'sticky', top: 100 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Sections</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTIONS.map(s => (
              <button key={s.id} className={`pp-nav-item ${active === s.id ? 'active' : ''}`}
                onClick={() => {
                  setActive(s.id)
                  document.getElementById(`pp-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}>
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </nav>
          <div style={{ marginTop: 32, padding: '16px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#34d399', marginBottom: 6 }}>🛡️ TL;DR</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              We don't sell your data. We encrypt everything. You can delete your account any time. That's the short version.
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          {SECTIONS.map(s => (
            <section key={s.id} id={`pp-${s.id}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, color: '#fff' }}>{s.title}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {s.content.map((c, i) => (
                  <div key={i}>
                    <div className="pp-sub">{c.sub}</div>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Contact section */}
          <section style={{ padding: '36px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Questions?</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 20 }}>
              Our privacy team reads every email. We respond within 48 hours — no bots, no form letters.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:privacy@skillbridge.app" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#22d3ee)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                privacy@skillbridge.app
              </a>
              <Link to="/contact" style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Contact Form →
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Privacy