import { useState } from 'react'

const TOPICS = [
  { id: 'general',  icon: '💬', label: 'General Question' },
  { id: 'bug',      icon: '🐛', label: 'Report a Bug' },
  { id: 'account',  icon: '👤', label: 'Account Issue' },
  { id: 'privacy',  icon: '🔒', label: 'Privacy Concern' },
  { id: 'partner',  icon: '🤝', label: 'Partnership' },
  { id: 'press',    icon: '📰', label: 'Press / Media' },
]

const CHANNELS = [
  {
    icon: '✉️',
    title: 'Email Us',
    handle: 'hello@skillbridge.app',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@skillbridge.app',
    color: '#22d3ee',
  },
  {
    icon: '💬',
    title: 'Discord Community',
    handle: 'discord.gg/skillbridge',
    sub: '3,200+ members, very active',
    href: 'https://discord.gg/skillbridge',
    color: '#5865F2',
  },
  {
    icon: '🐦',
    title: 'Twitter / X',
    handle: '@skillbridge',
    sub: 'Fastest for public feedback',
    href: 'https://twitter.com/skillbridge',
    color: '#1DA1F2',
  },
]

const Contact = () => {
  const [topic, setTopic] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message || !topic) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    setSent(true)
  }

  return (
    <div style={{ background: '#020010', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&display=swap');
        .ct-input {
          width:100%; padding:14px 16px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.09);
          border-radius:12px;
          color:#f8fafc; font-size:14px; font-family:'Inter',sans-serif;
          outline:none; transition:all 0.2s; box-sizing:border-box;
          resize:none;
        }
        .ct-input::placeholder { color:rgba(255,255,255,0.2); }
        .ct-input:focus {
          border-color:rgba(34,211,238,0.4);
          box-shadow:0 0 0 3px rgba(34,211,238,0.08);
          background:rgba(255,255,255,0.06);
        }
        .ct-topic {
          padding:12px 16px; border-radius:12px; cursor:pointer;
          font-size:13px; font-weight:500; transition:all 0.2s;
          border:1px solid rgba(255,255,255,0.08);
          background:rgba(255,255,255,0.03);
          color:rgba(255,255,255,0.5);
          display:flex; align-items:center; gap:8px;
          white-space:nowrap;
        }
        .ct-topic:hover {
          border-color:rgba(34,211,238,0.25);
          color:rgba(255,255,255,0.8);
          background:rgba(34,211,238,0.04);
        }
        .ct-topic.selected {
          border-color:rgba(34,211,238,0.4);
          color:#22d3ee;
          background:rgba(34,211,238,0.08);
          box-shadow:0 0 16px rgba(34,211,238,0.08);
        }
        .ct-send {
          width:100%; padding:15px;
          border-radius:12px; border:none; cursor:pointer;
          font-size:15px; font-weight:700;
          background:linear-gradient(135deg,#7C3AED,#22d3ee);
          color:#fff; transition:all 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .ct-send:hover:not(:disabled) {
          box-shadow:0 0 30px rgba(34,211,238,0.3);
          transform:translateY(-1px);
        }
        .ct-send:disabled { opacity:0.5; cursor:not-allowed; }
        .ct-channel {
          padding:24px; border-radius:16px;
          background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.07);
          transition:all 0.25s;
          text-decoration:none;
          display:block;
        }
        .ct-channel:hover {
          transform:translateY(-3px);
          border-color:rgba(34,211,238,0.25);
          box-shadow:0 16px 40px rgba(0,0,0,0.3), 0 0 20px rgba(34,211,238,0.05);
        }
        .ct-glow {
          position:absolute; top:-100px; right:-50px;
          width:500px; height:500px; border-radius:50%;
          background:radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%);
          filter:blur(60px); pointer-events:none;
        }
        @keyframes ct-spin { to { transform:rotate(360deg); } }
        @keyframes ct-checkIn {
          from { opacity:0; transform:scale(0.6) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="ct-glow" />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)', marginBottom: 20 }}>
          <span>✉️</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee', letterSpacing: '0.05em' }}>CONTACT US</span>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,5vw,48px)', lineHeight: 1.1, marginBottom: 16 }}>
          We actually{' '}
          <span style={{ background: 'linear-gradient(135deg,#A78BFA,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            read these
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          No ticket system, no chatbot, no 14-day wait. A real person replies — usually within a few hours.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>

          {/* ── FORM ── */}
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', animation: 'ct-checkIn 0.5s ease' }}>
                <div style={{ fontSize: 72, marginBottom: 24 }}>✅</div>
                <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Message received!</h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
                  We'll get back to you at <strong style={{ color: '#22d3ee' }}>{form.email}</strong> within 24 hours. Sometimes much faster.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Topic picker */}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    What's this about? *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TOPICS.map(t => (
                      <button key={t.id} className={`ct-topic ${topic === t.id ? 'selected' : ''}`}
                        onClick={() => setTopic(t.id)}>
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Name *</label>
                    <input className="ct-input" placeholder="Aryan Mehta"
                      value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address *</label>
                    <input className="ct-input" type="email" placeholder="you@example.com"
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message *</label>
                  <textarea className="ct-input" rows={6}
                    placeholder="Tell us what's on your mind. The more detail, the faster we can help."
                    value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                </div>

                <button className="ct-send" disabled={!form.name || !form.email || !form.message || !topic || loading}
                  onClick={handleSubmit}>
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'ct-spin 0.7s linear infinite' }} />
                      Sending...
                    </>
                  ) : (
                    <>Send Message ✈️</>
                  )}
                </button>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0 }}>
                  By sending this form, you agree to our{' '}
                  <a href="/privacy" style={{ color: 'rgba(34,211,238,0.6)', textDecoration: 'none' }}>Privacy Policy</a>
                </p>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Other Ways to Reach Us
            </div>
            {CHANNELS.map(c => (
              <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer" className="ct-channel">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}15`, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: c.color, fontWeight: 500, marginBottom: 4 }}>{c.handle}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{c.sub}</div>
                  </div>
                </div>
              </a>
            ))}

            {/* Response time card */}
            <div style={{ marginTop: 8, padding: '20px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Team is online
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['General queries', '~4 hrs'], ['Bug reports', '~1 hr'], ['Account issues', '~2 hrs'], ['Privacy requests', '48 hrs']].map(([type, time]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{type}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Office */}
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Registered Office</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>
                SkillBridge Technologies Pvt. Ltd.<br />
                HSR Layout, Bengaluru<br />
                Karnataka 560102, India<br />
                🇮🇳 CIN: U85300KA2023PTC123456
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Contact