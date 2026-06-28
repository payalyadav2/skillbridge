import { Link } from 'react-router-dom'

const SITEMAP = [
  {
    category: 'Explore',
    color: '#22d3ee',
    icon: '🔍',
    pages: [
      { label: 'Home',             to: '/',            desc: 'Platform overview & how it works' },
      { label: 'Browse Skills',    to: '/skills',      desc: 'Search and filter all listed skills' },
      { label: 'Nearby Users',     to: '/nearby',      desc: 'Find people to exchange skills with locally' },
      { label: 'AI Tools',         to: '/ai',          desc: 'AI-powered skill matching and suggestions' },
    ],
  },
  {
    category: 'My Space',
    color: '#818cf8',
    icon: '👤',
    pages: [
      { label: 'Dashboard',        to: '/dashboard',   desc: 'Your personal skill exchange hub' },
      { label: 'Exchanges',        to: '/exchanges',   desc: 'Track active and past skill exchanges' },
      { label: 'Sessions',         to: '/sessions',    desc: 'Schedule and join live skill sessions' },
      { label: 'Messages',         to: '/chat',        desc: 'Direct messages with exchange partners' },
      { label: 'Achievements',     to: '/achievements',desc: 'Badges, milestones, and your skill journey' },
      { label: 'Reviews',          to: '/reviews',     desc: 'Feedback you\'ve given and received' },
    ],
  },
  {
    category: 'Account',
    color: '#34d399',
    icon: '🔑',
    pages: [
      { label: 'Sign Up',          to: '/signup',            desc: 'Create your free SkillBridge account' },
      { label: 'Log In',           to: '/login',             desc: 'Access your existing account' },
      { label: 'Forgot Password',  to: '/forgot-password',   desc: 'Reset your password via email' },
      { label: 'Verify Email',     to: '/verify-email',      desc: 'Confirm your email address' },
      { label: 'Edit Profile',     to: '/profile/edit',      desc: 'Update your skills, bio, and photo' },
    ],
  },
  {
    category: 'Company',
    color: '#F59E0B',
    icon: '🏢',
    pages: [
      { label: 'About Us',         to: '/about',       desc: 'Our story, mission, team, and values' },
      { label: 'Contact',          to: '/contact',     desc: 'Get in touch with the SkillBridge team' },
      { label: 'Privacy Policy',   to: '/privacy',     desc: 'How we handle and protect your data' },
      { label: 'Terms of Service', to: '/terms',       desc: 'Rules and agreements for using SkillBridge' },
      { label: 'Sitemap',          to: '/sitemap',     desc: 'You\'re here — a full map of all pages' },
    ],
  },
]

const Sitemap = () => (
  <div style={{ background: '#020010', minHeight: '100vh', color: '#F8FAFC', fontFamily: "'Inter',sans-serif" }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&display=swap');
      .sm-page-link {
        display:flex; align-items:center; gap:12px;
        padding:14px 16px; border-radius:12px;
        text-decoration:none; transition:all 0.2s;
        border:1px solid rgba(255,255,255,0.05);
        background:rgba(255,255,255,0.02);
      }
      .sm-page-link:hover {
        background:rgba(255,255,255,0.05);
        border-color:rgba(34,211,238,0.2);
        transform:translateX(4px);
      }
      .sm-arrow {
        margin-left:auto; font-size:14px;
        color:rgba(255,255,255,0.2);
        transition:all 0.2s;
      }
      .sm-page-link:hover .sm-arrow {
        color:rgba(34,211,238,0.7);
        transform:translateX(3px);
      }
      .sm-glow {
        position:absolute; top:-150px; left:50%; transform:translateX(-50%);
        width:700px; height:500px; border-radius:50%;
        background:radial-gradient(circle,rgba(34,211,238,0.07) 0%,rgba(124,58,237,0.05) 40%,transparent 70%);
        filter:blur(60px); pointer-events:none;
      }
    `}</style>

    {/* ── HERO ── */}
    <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="sm-glow" />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)', marginBottom: 20 }}>
        <span>🗺️</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#22d3ee', letterSpacing: '0.05em' }}>SITEMAP</span>
      </div>
      <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,5vw,48px)', lineHeight: 1.1, marginBottom: 16 }}>
        Every page,{' '}
        <span style={{ background: 'linear-gradient(135deg,#A78BFA,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          one place
        </span>
      </h1>
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
        A complete map of everything on SkillBridge — useful if you're looking for something specific or just exploring.
      </p>
    </div>

    {/* ── GRID ── */}
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(460px,1fr))', gap: 32 }}>
        {SITEMAP.map(cat => (
          <div key={cat.category}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${cat.color}25` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cat.color}15`, border: `1px solid ${cat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{cat.icon}</div>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: cat.color, margin: 0 }}>{cat.category}</h2>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>{cat.pages.length} pages</span>
            </div>

            {/* Pages list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cat.pages.map(p => (
                <Link key={p.to} to={p.to} className="sm-page-link">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0, boxShadow: `0 0 8px ${cat.color}60` }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{p.desc}</div>
                  </div>
                  <span className="sm-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <div style={{ marginTop: 64, padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            ['20', 'Total Pages'],
            ['4', 'Sections'],
            ['100%', 'Free to use'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 32, background: 'linear-gradient(135deg,#22d3ee,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default Sitemap