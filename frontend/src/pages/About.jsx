import { Link } from 'react-router-dom'

const TEAM = [
  { name: 'Aryan Mehta',    role: 'Co-founder & CEO',      avatar: 'AM', color: '#7C3AED' },
  { name: 'Priya Sharma',   role: 'Co-founder & CTO',      avatar: 'PS', color: '#06B6D4' },
  { name: 'Rahul Gupta',    role: 'Head of Product',        avatar: 'RG', color: '#10B981' },
  { name: 'Neha Joshi',     role: 'Lead Designer',          avatar: 'NJ', color: '#F59E0B' },
  { name: 'Dev Patel',      role: 'Backend Engineer',       avatar: 'DP', color: '#EF4444' },
  { name: 'Sara Khan',      role: 'Community Manager',      avatar: 'SK', color: '#8B5CF6' },
]

const VALUES = [
  { icon: '🤝', title: 'Radical Generosity',    desc: 'We believe knowledge shared freely multiplies. No paywalls, no gatekeeping — just people helping people.' },
  { icon: '🌍', title: 'Community First',        desc: 'Every product decision starts with "does this help our community?" Revenue is a byproduct of genuine value.' },
  { icon: '🔒', title: 'Privacy by Default',     desc: 'Your data is yours. We collect only what we need, never sell it, and delete it when you ask.' },
  { icon: '⚡', title: 'Build in the Open',      desc: 'Our roadmap is public, our changelog is honest, and our mistakes are owned. Transparency builds trust.' },
]

const MILESTONES = [
  { year: '2023', q: 'Q1', event: 'SkillBridge idea born from a college project — two friends couldn\'t find a simple way to trade tutoring for design help.' },
  { year: '2023', q: 'Q3', event: 'First 100 users joined in beta. The waitlist hit 3,000 in the first week with zero paid marketing.' },
  { year: '2024', q: 'Q1', event: 'Launched AI skill-matching, video sessions, and the achievement system. Platform grew to 5K members.' },
  { year: '2024', q: 'Q3', event: 'Reached 10K exchanges completed. Average session rating: 4.9 stars. Zero ads. Zero subscriptions.' },
  { year: '2025', q: 'Q2', event: 'Crossed 12K members across 48 countries. Launched Nearby feature and real-time chat. Still free.' },
]

const About = () => (
  <div style={{ background: '#020010', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

      .ab-hero-glow {
        position:absolute; top:-200px; left:50%; transform:translateX(-50%);
        width:800px; height:800px; border-radius:50%;
        background:radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%);
        filter:blur(60px); pointer-events:none;
      }
      .ab-card {
        background:rgba(255,255,255,0.03);
        border:1px solid rgba(255,255,255,0.07);
        border-radius:20px;
        transition:all 0.3s;
      }
      .ab-card:hover {
        border-color:rgba(124,58,237,0.3);
        box-shadow:0 0 40px rgba(124,58,237,0.1), 0 20px 40px rgba(0,0,0,0.3);
        transform:translateY(-4px);
      }
      .ab-team-card {
        background:rgba(255,255,255,0.02);
        border:1px solid rgba(255,255,255,0.06);
        border-radius:16px;
        padding:28px 24px;
        text-align:center;
        transition:all 0.3s;
      }
      .ab-team-card:hover {
        border-color:rgba(34,211,238,0.25);
        box-shadow:0 0 30px rgba(34,211,238,0.06);
        transform:translateY(-3px);
      }
      .ab-avatar {
        width:64px; height:64px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-family:'Space Grotesk',sans-serif;
        font-weight:800; font-size:18px; color:#fff;
        margin:0 auto 16px;
        box-shadow:0 0 20px rgba(0,0,0,0.3);
      }
      .ab-timeline-dot {
        width:12px; height:12px; border-radius:50%;
        background:linear-gradient(135deg,#7C3AED,#22d3ee);
        flex-shrink:0; margin-top:4px;
        box-shadow:0 0 12px rgba(34,211,238,0.4);
      }
      .ab-stat-num {
        font-family:'Space Grotesk',sans-serif;
        font-weight:800; font-size:40px;
        background:linear-gradient(135deg,#22d3ee,#818cf8);
        -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        background-clip:text;
      }
      .ab-section-label {
        font-family:'Space Grotesk',sans-serif;
        font-size:11px; font-weight:700; letter-spacing:0.15em;
        text-transform:uppercase; color:#22d3ee;
      }
      .ab-h2 {
        font-family:'Space Grotesk',sans-serif;
        font-weight:800; font-size:clamp(32px,5vw,52px);
        line-height:1.1; letter-spacing:-0.02em;
      }
      .ab-3d-cube {
        width:80px; height:80px;
        position:relative;
        transform-style:preserve-3d;
        animation:ab-rotate 8s linear infinite;
      }
      @keyframes ab-rotate {
        from { transform:rotateY(0deg) rotateX(15deg); }
        to   { transform:rotateY(360deg) rotateX(15deg); }
      }
      .ab-cube-face {
        position:absolute; width:80px; height:80px;
        border:1px solid rgba(34,211,238,0.3);
        background:rgba(34,211,238,0.04);
        display:flex; align-items:center; justify-content:center;
        font-size:28px;
      }
    `}</style>

    {/* ── HERO ────────────────────────────────────────────────────────────── */}
    <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 80px', textAlign: 'center' }}>
      <div className="ab-hero-glow" />

      {/* 3D floating cube */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48, perspective: '400px' }}>
        <div className="ab-3d-cube">
          <div className="ab-cube-face" style={{ transform: 'translateZ(40px)' }}>🤝</div>
          <div className="ab-cube-face" style={{ transform: 'rotateY(180deg) translateZ(40px)' }}>💡</div>
          <div className="ab-cube-face" style={{ transform: 'rotateY(90deg) translateZ(40px)' }}>🌍</div>
          <div className="ab-cube-face" style={{ transform: 'rotateY(-90deg) translateZ(40px)' }}>⚡</div>
          <div className="ab-cube-face" style={{ transform: 'rotateX(90deg) translateZ(40px)' }}>🚀</div>
          <div className="ab-cube-face" style={{ transform: 'rotateX(-90deg) translateZ(40px)' }}>❤️</div>
        </div>
      </div>

      <div className="ab-section-label" style={{ marginBottom: 16 }}>Our Story</div>
      <h1 className="ab-h2" style={{ maxWidth: 720, margin: '0 auto 24px' }}>
        We built the platform we{' '}
        <span style={{ background: 'linear-gradient(135deg,#A78BFA,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          wished existed
        </span>
      </h1>
      <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7 }}>
        SkillBridge started as a simple idea: what if learning didn't require money — just the willingness to teach something you already know?
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
        {[['12K+', 'Members'], ['340+', 'Skills'], ['8.2K+', 'Exchanges'], ['48', 'Countries']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div className="ab-stat-num">{n}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>

    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

      {/* ── MISSION ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 100 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div className="ab-section-label" style={{ marginBottom: 16 }}>Mission</div>
            <h2 className="ab-h2" style={{ fontSize: 'clamp(28px,4vw,42px)', marginBottom: 24 }}>
              Knowledge has no price tag
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 20 }}>
              Every skill learned through money creates a barrier. Every skill shared freely creates a bridge. We're obsessively focused on removing every friction point between people who want to learn and people who want to teach.
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
              We're not a marketplace. We're not a course platform. We're a community where expertise flows freely, and the only currency is generosity.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ padding: 32, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
              <blockquote style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1.4, color: '#fff', marginBottom: 16 }}>
                "The best investment you can make is in yourself — and the best return is teaching others."
              </blockquote>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>— SkillBridge founding principle</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="ab-section-label" style={{ marginBottom: 16 }}>What We Stand For</div>
          <h2 className="ab-h2" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Our core values</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {VALUES.map(v => (
            <div key={v.title} className="ab-card" style={{ padding: '32px 28px' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 12, color: '#fff' }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="ab-section-label" style={{ marginBottom: 16 }}>How We Got Here</div>
          <h2 className="ab-h2" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Our journey</h2>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MILESTONES.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 24, paddingBottom: 40, position: 'relative' }}>
              {/* Line */}
              {i < MILESTONES.length - 1 && (
                <div style={{ position: 'absolute', left: 5, top: 20, bottom: 0, width: 2, background: 'linear-gradient(180deg,rgba(34,211,238,0.3),rgba(124,58,237,0.1))' }} />
              )}
              <div className="ab-timeline-dot" />
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#22d3ee' }}>{m.year}</span>
                  <span style={{ fontSize: 11, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, padding: '2px 8px', color: '#A78BFA', fontWeight: 600 }}>{m.q}</span>
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="ab-section-label" style={{ marginBottom: 16 }}>The People</div>
          <h2 className="ab-h2" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>Meet the team</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 16, maxWidth: 500, margin: '16px auto 0' }}>
            A small, passionate crew working remotely across India — obsessed with building something genuinely useful.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          {TEAM.map(t => (
            <div key={t.name} className="ab-team-card">
              <div className="ab-avatar" style={{ background: `linear-gradient(135deg,${t.color},${t.color}88)`, boxShadow: `0 0 20px ${t.color}44` }}>
                {t.avatar}
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 80, textAlign: 'center' }}>
        <div style={{ padding: '64px 40px', background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.06))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
          <h2 className="ab-h2" style={{ fontSize: 'clamp(24px,4vw,38px)', marginBottom: 16 }}>
            Ready to be part of this?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            Join 12,000+ people who are learning and teaching every day. Free forever.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#22d3ee)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
              Join Free →
            </Link>
            <Link to="/contact" style={{ padding: '14px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  </div>
)

export default About