import { useState } from 'react'
import { Link } from 'react-router-dom'

const TERMS = [
  {
    id: 'accept',
    icon: '✅',
    title: 'Accepting These Terms',
    content: `By creating a SkillBridge account or using our platform, you agree to these Terms of Service. If you're using SkillBridge on behalf of an organization, you represent that you have authority to bind that organization.\n\nWe may update these terms from time to time. When we do, we'll notify you by email and display a banner on the platform. Continued use after 30 days of notice means you accept the changes. If you disagree, you can always delete your account.`,
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Your Account',
    bullets: [
      'You must be at least 13 years old to use SkillBridge. If you\'re under 18, you need parental consent.',
      'One account per person. Creating duplicate accounts to circumvent bans or restrictions is prohibited.',
      'You\'re responsible for keeping your credentials secure. We\'re not liable for unauthorized access caused by your own negligence.',
      'Your username and profile are public. Other users can see your listed skills, bio, and rating.',
      'You can delete your account at any time from Settings. Data deletion follows our Privacy Policy.',
    ],
  },
  {
    id: 'conduct',
    icon: '🤝',
    title: 'Community Rules',
    intro: 'SkillBridge works because people treat each other well. These rules aren\'t bureaucracy — they\'re what makes the exchange possible.',
    bullets: [
      'Be honest about your skills. Don\'t claim expertise you don\'t have.',
      'Honor commitments. If you agree to a session, show up or give advance notice.',
      'No harassment, discrimination, or hate speech. This includes messages, reviews, and profile content.',
      'No spam, unsolicited advertising, or multi-level marketing.',
      'Don\'t use SkillBridge to collect personal data from other users beyond what\'s needed for a skill exchange.',
      'No sharing of illegal content, malware, or anything that violates others\' intellectual property.',
      'Report problems. If you see something wrong, use the report button — don\'t retaliate.',
    ],
  },
  {
    id: 'content',
    icon: '📝',
    title: 'Your Content',
    content: `You own everything you post on SkillBridge — your profile, your messages, your session materials. By posting, you grant us a limited license to display and distribute your content as part of running the platform. We don't claim ownership and we don't use your content for advertising.\n\nYou're responsible for ensuring your content doesn't infringe on anyone else's rights. If you post something that violates copyright, trademark, or another person's privacy, we'll remove it and may suspend your account.`,
  },
  {
    id: 'exchanges',
    icon: '⚡',
    title: 'Skill Exchanges',
    content: `SkillBridge is a platform — we connect people, but we're not a party to any exchange agreement. The terms of each exchange are between the participants.\n\nWe strongly encourage you to be clear about what you're offering and what you expect in return before agreeing to an exchange. Disputes between users are handled through our resolution process, but we can't guarantee outcomes.\n\nIf an exchange goes wrong, report it. We investigate all reports and take action when our community rules have been broken — including removing bad actors from the platform.`,
  },
  {
    id: 'availability',
    icon: '🌐',
    title: 'Availability & Changes',
    content: `We work hard to keep SkillBridge running smoothly, but we can't guarantee 100% uptime. We may occasionally need to take the platform offline for maintenance — we'll give advance notice when possible.\n\nWe're constantly evolving the product. Features may change, be removed, or be added. We'll communicate significant changes but reserve the right to evolve the platform to serve the community better.\n\nWe may suspend or terminate accounts that violate these terms. Serious violations (harassment, illegal activity) may result in immediate termination without notice.`,
  },
  {
    id: 'liability',
    icon: '⚖️',
    title: 'Liability Limits',
    content: `SkillBridge is provided "as is." We make no warranties — express or implied — about the quality, accuracy, or fitness of anything on the platform, including advice from other users.\n\nTo the maximum extent permitted by law, SkillBridge's liability is limited to the amount you've paid us in the last 12 months (which, since we're free, is $0). We're not liable for indirect, incidental, or consequential damages.\n\nThis doesn't limit liability for fraud, gross negligence, or anything that can't be legally excluded in your jurisdiction.`,
  },
  {
    id: 'law',
    icon: '🏛️',
    title: 'Governing Law',
    content: `These terms are governed by the laws of India. Any disputes will be resolved in courts located in Bangalore, Karnataka — unless you're an EU user, in which case local consumer protection laws may give you additional rights.\n\nIf any part of these terms is found unenforceable, the rest remains in effect. Our failure to enforce any right isn't a waiver of that right.`,
  },
]

const Terms = () => {
  const [active, setActive] = useState('accept')

  return (
    <div style={{ background: '#020010', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&display=swap');
        .tos-nav {
          display:flex; align-items:center; gap:10px;
          padding:11px 16px; border-radius:12px; cursor:pointer;
          font-size:13px; font-weight:500; color:rgba(255,255,255,0.4);
          transition:all 0.2s; border:1px solid transparent;
          background:none; width:100%; text-align:left;
        }
        .tos-nav:hover { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.04); }
        .tos-nav.active {
          color:#818cf8; background:rgba(129,140,248,0.08);
          border-color:rgba(129,140,248,0.2);
        }
        .tos-bullet {
          display:flex; gap:12px; align-items:flex-start;
          padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .tos-bullet:last-child { border-bottom:none; }
        .tos-bullet-dot {
          width:6px; height:6px; border-radius:50%;
          background:linear-gradient(135deg,#818cf8,#22d3ee);
          margin-top:9px; flex-shrink:0;
        }
        .tos-glow {
          position:absolute; top:-80px; left:50%; transform:translateX(-50%);
          width:600px; height:400px; border-radius:50%;
          background:radial-gradient(circle,rgba(129,140,248,0.1) 0%,transparent 70%);
          filter:blur(60px); pointer-events:none;
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="tos-glow" />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.25)', marginBottom: 20 }}>
          <span style={{ fontSize: 14 }}>⚖️</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', letterSpacing: '0.05em' }}>TERMS OF SERVICE</span>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,5vw,48px)', lineHeight: 1.1, marginBottom: 16 }}>
          Rules written for{' '}
          <span style={{ background: 'linear-gradient(135deg,#818cf8,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            humans
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.7 }}>
          We've tried to write our terms in plain language. The goal is for you to know exactly what you're agreeing to — not to hide surprises in legalese.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>📅 Effective: June 1, 2025</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>📬 Version 3.1</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'start' }}>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 100 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Jump To</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {TERMS.map(t => (
              <button key={t.id} className={`tos-nav ${active === t.id ? 'active' : ''}`}
                onClick={() => {
                  setActive(t.id)
                  document.getElementById(`tos-${t.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}>
                <span>{t.icon}</span>
                <span>{t.title}</span>
              </button>
            ))}
          </nav>
          <div style={{ marginTop: 32, padding: '16px', background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', marginBottom: 6 }}>📋 Summary</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Be kind. Honor commitments. Don't misrepresent yourself. That's the spirit of it.
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {TERMS.map(t => (
            <section key={t.id} id={`tos-${t.id}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{t.icon}</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#fff' }}>{t.title}</h2>
              </div>
              {t.intro && <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 20 }}>{t.intro}</p>}
              {t.content && t.content.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 16 }}>{para}</p>
              ))}
              {t.bullets && (
                <div>
                  {t.bullets.map((b, i) => (
                    <div key={i} className="tos-bullet">
                      <div className="tos-bullet-dot" />
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Footer note */}
          <section style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Still have questions?</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>
              Legal documents are rarely fun to read. If anything here is confusing, just ask — we'd rather explain it than have you confused.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:legal@skillbridge.app" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#818cf8,#22d3ee)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                legal@skillbridge.app
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

export default Terms