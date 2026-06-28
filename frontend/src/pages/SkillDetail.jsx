import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, MapPin, Calendar, Eye, Send, ArrowLeft, Sparkles, Clock, Layers, Tag as TagIcon, ShieldCheck } from 'lucide-react';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';
import Modal from '../components/common/Modal.jsx';
import toast from 'react-hot-toast';

const TYPE_STYLE = {
  offered: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30', label: '✦ Skill Offered' },
  wanted: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-400/30', label: '◇ Skill Wanted' },
};

const LEVEL_STYLE = {
  beginner: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/25' },
  intermediate: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-400/25' },
  advanced: { text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-400/25' },
};

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [form, setForm] = useState({ skillOffered: '', message: '', exchangeType: 'online' });
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    api.get('/skills/' + id).then(({ data }) => setSkill(data.data.skill))
      .catch(() => navigate('/skills')).finally(() => setLoading(false));
  }, [id]);

  // Dynamic SEO — each skill page needs its own title/description/canonical for proper indexing,
  // since this content is generated per-record and a static index.html can't cover it.
  useEffect(() => {
    if (!skill) return;
    const prevTitle = document.title;
    const pageTitle = `${skill.title} — ${skill.category} Skill Exchange | SkillBridge`;
    const pageDesc = (skill.description || '').slice(0, 155).trim() || `Exchange skills with ${skill.owner?.name || 'a SkillBridge member'} — ${skill.title} (${skill.level}) on SkillBridge.`;
    document.title = pageTitle;

    const setMeta = (selector, attr, content) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) el.setAttribute('property', selector.match(/"(.+)"/)[1]);
        else el.setAttribute('name', selector.match(/"(.+)"/)[1]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    setMeta('meta[name="description"]', 'content', pageDesc);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', pageDesc);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', pageDesc);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/skills/' + id);

    let jsonLd = document.getElementById('skill-jsonld');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.id = 'skill-jsonld';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: skill.title,
      description: pageDesc,
      category: skill.category,
      provider: skill.owner?.name ? { '@type': 'Person', name: skill.owner.name } : undefined,
      areaServed: skill.owner?.location?.city || undefined,
    });

    return () => { document.title = prevTitle; };
  }, [skill, id]);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!form.skillOffered) { toast.error('Please select a skill to offer'); return; }
    setSending(true);
    try {
      await api.post('/exchanges', {
        receiverId: skill.owner._id,
        skillOffered: { name: form.skillOffered },
        skillWanted: { name: skill.title },
        message: form.message,
        exchangeType: form.exchangeType,
      });
      toast.success('Exchange request sent!');
      setRequestModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSending(false); }
  };

  if (loading) return <PageLoader/>;
  if (!skill) return null;

  const isOwner = user?._id === skill.owner?._id;
  const typeStyle = TYPE_STYLE[skill.type] || TYPE_STYLE.offered;
  const levelStyle = LEVEL_STYLE[skill.level] || LEVEL_STYLE.beginner;

  return (
    <div className="relative min-h-screen bg-[#020010] text-slate-100 overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-fuchsia-600/15 blur-[120px] animate-[float1_18s_ease-in-out_infinite]"/>
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-cyan-500/12 blur-[120px] animate-[float2_22s_ease-in-out_infinite]"/>
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}/>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.15)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,238,0.4)} 50%{box-shadow:0 0 0 6px rgba(34,211,238,0)} }
        @keyframes tilt3d { 0%,100%{transform:rotateY(0deg) rotateX(0deg)} 50%{transform:rotateY(2deg) rotateX(-1deg)} }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .glass { background: rgba(255,255,255,0.035); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-strong { background: rgba(255,255,255,0.05); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); }
        .neon-text { background: linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6); background-size: 200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation: shimmer 6s linear infinite; }
        .owner-card { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); transform-style: preserve-3d; }
        .owner-card:hover { transform: translateY(-3px) rotateX(2deg); }
        .online-ring { animation: ringPulse 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .owner-card, .online-ring, .animate-[float1_18s_ease-in-out_infinite], .animate-[float2_22s_ease-in-out_infinite] { animation: none !important; }
          .owner-card:hover { transform: none; }
        }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">

        <button onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 glass border border-white/5 mb-7 transition-colors ${mounted ? 'fade-up' : 'opacity-0'}`}>
          <ArrowLeft size={15}/> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <div className={`glass-strong rounded-2xl p-6 md:p-7 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '60ms' }}>
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                    {typeStyle.label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}>
                    {skill.level}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Eye size={13}/>{skill.viewCount} views
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2 text-slate-100">{skill.title}</h1>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 mb-5">
                <Layers size={12}/> {skill.category}
              </span>

              <div className="h-px bg-white/5 mb-5"/>

              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-[15px]">{skill.description}</p>

              {skill.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {skill.tags.map(tag=>(
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] glass border border-white/5 text-slate-400">
                      <TagIcon size={10}/> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={`glass-strong rounded-2xl p-6 md:p-7 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '120ms' }}>
              <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles size={15} className="text-cyan-300"/> Exchange Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Exchange Type', value: skill.exchangePreference==='online'?'💻 Online':skill.exchangePreference==='in-person'?'📍 In-Person':'💻📍 Both' },
                  { label: 'Session Duration', value: skill.duration || 'Flexible', icon: Clock },
                  { label: 'Category', value: skill.category },
                  { label: 'Level', value: skill.level?.charAt(0).toUpperCase()+skill.level?.slice(1) },
                ].map(item=>(
                  <div key={item.label} className="p-3.5 rounded-xl glass border border-white/5">
                    <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-wide">{item.label}</p>
                    <p className="font-medium text-slate-200 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Owner Card — signature element: 3D tilt-on-hover premium profile card */}
            {skill.owner && (
              <div className={`owner-card glass-strong rounded-2xl p-6 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '90ms' }}>
                <Link to={"/profile/"+skill.owner._id} className="flex items-center gap-3 mb-4 group">
                  <div className="relative">
                    {skill.owner.avatar
                      ? <img src={skill.owner.avatar} alt={skill.owner.name} className="w-14 h-14 rounded-full object-cover border border-white/10"/>
                      : <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>{skill.owner.name?.[0]}</div>
                    }
                    {skill.owner.isOnline && (
                      <span className="online-ring absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0420]"/>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">{skill.owner.name}</p>
                    <p className="text-xs text-slate-500">{skill.owner.experienceLevel}</p>
                    {skill.owner.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-amber-300 mt-0.5">
                        <Star size={12} fill="currentColor"/>
                        <span className="text-xs font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{skill.owner.averageRating}</span>
                      </div>
                    )}
                  </div>
                </Link>

                {skill.owner.location?.city && (
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mb-4">
                    <MapPin size={13} className="text-slate-500"/>{skill.owner.location.city}
                  </p>
                )}

                {skill.owner.skillsOffered?.slice(0,3).length > 0 && (
                  <div className="mb-5">
                    <p className="text-[11px] text-slate-500 mb-2 uppercase tracking-wide">Also offers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.owner.skillsOffered.slice(0,3).map(s=>(
                        <span key={s._id} className="px-2.5 py-1 rounded-full text-[11px] glass border border-white/5 text-slate-300">{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {!isOwner && user && (
                  <button onClick={() => setRequestModal(true)}
                    className="group relative w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
                    <Send size={15}/> Request Exchange
                  </button>
                )}
                {!user && (
                  <Link to="/login"
                    className="w-full text-center block py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
                    Login to Exchange
                  </Link>
                )}
                {isOwner && (
                  <Link to="/profile/edit"
                    className="w-full text-center block py-3 rounded-xl font-semibold text-sm text-slate-300 glass border border-white/10 hover:text-slate-100 transition-colors">
                    Edit Your Skills
                  </Link>
                )}
              </div>
            )}

            {/* Similar Skills */}
            <div className={`glass-strong rounded-2xl p-6 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '150ms' }}>
              <h3 className="font-semibold text-slate-200 mb-3 text-sm flex items-center gap-2">
                <Layers size={14} className="text-cyan-300"/> More in {skill.category}
              </h3>
              <Link to={"/skills?category="+skill.category}
                className="block w-full text-center py-2.5 rounded-xl text-sm font-medium glass border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30 transition-colors">
                Browse {skill.category}
              </Link>
            </div>

            <div className={`flex items-center gap-2 text-[11px] text-slate-500 px-2 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '180ms' }}>
              <ShieldCheck size={13} className="text-emerald-400"/> Verified listing — moderated by SkillBridge
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Modal */}
      <Modal isOpen={requestModal} onClose={()=>setRequestModal(false)} title="Request Exchange">
        <form onSubmit={handleRequest} className="p-6 space-y-4 bg-[#040016] text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <div className="p-3.5 rounded-xl glass border border-cyan-400/20">
            <p className="text-sm text-cyan-200 font-medium">You're requesting: <strong>{skill.title}</strong></p>
            <p className="text-xs text-slate-400 mt-0.5">From {skill.owner?.name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">What skill will you offer in return?</label>
            <select value={form.skillOffered} onChange={e=>setForm({...form,skillOffered:e.target.value})}
              className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" required>
              <option value="" className="bg-[#0a0420]">Choose your skill...</option>
              {user?.skillsOffered?.map(s=>(
                <option key={s._id} value={s.name} className="bg-[#0a0420]">{s.name} ({s.level})</option>
              ))}
            </select>
            {!user?.skillsOffered?.length && (
              <p className="text-xs text-amber-400 mt-1.5">
                You need to <Link to="/profile/edit" className="underline">add skills to your profile</Link> first.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Exchange Preference</label>
            <div className="flex gap-2">
              {['online','in-person'].map(t=>(
                <button type="button" key={t} onClick={()=>setForm({...form,exchangeType:t})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.exchangeType===t
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                      : 'border-white/10 text-slate-500 hover:text-slate-300'
                  }`}>
                  {t==='online'?'💻 Online':'📍 In-Person'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Message (optional)</label>
            <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
              rows={3} placeholder="Introduce yourself and why you'd like to exchange..."
              className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"/>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={()=>setRequestModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 border border-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={sending}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
              {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Send Request 🤝'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillDetail;