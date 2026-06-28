import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios.js';
import { SkeletonCard } from '../components/common/Loader.jsx';

const CATEGORIES = ['Technology','Design','Music','Language','Cooking','Fitness','Art','Business','Writing','Photography','Video & Film','Crafts','Sports','Academia','Finance','Marketing','Teaching','Other'];
const LEVELS = ['beginner','intermediate','advanced','expert'];

const TYPE_STYLE = {
  offered: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30', label: '✦ Offering' },
  wanted: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-400/30', label: '◇ Wanted' },
};

// Signature element: card tilts in 3D following the mouse position — a subtle "depth follows you" interaction
const SkillCard = ({ skill, index }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const typeStyle = TYPE_STYLE[skill.type] || TYPE_STYLE.offered;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <Link to={"/skills/"+skill._id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group block fade-up"
      style={{ animationDelay: `${Math.min(index, 9) * 50}ms` }}
    >
      <div
        className="relative glass-strong rounded-2xl p-5 h-full transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.12)] [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.15s ease-out' }}
      >
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
            {typeStyle.label}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium glass border border-white/10 text-slate-400 capitalize">{skill.level}</span>
        </div>
        <h3 className="font-bold text-slate-100 mb-1.5 line-clamp-1 group-hover:text-cyan-300 transition-colors">{skill.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">{skill.description}</p>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] glass border border-white/10 text-slate-400">{skill.category}</span>
          {skill.exchangePreference && (
            <span className="px-2.5 py-1 rounded-full text-[11px] glass border border-white/10 text-slate-400">
              {skill.exchangePreference==='online'?'💻 Online':skill.exchangePreference==='in-person'?'📍 In-Person':'💻📍 Both'}
            </span>
          )}
        </div>
        {skill.owner && (
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              {skill.owner.avatar
                ? <img src={skill.owner.avatar} alt={skill.owner.name} className="w-7 h-7 rounded-full object-cover border border-white/10"/>
                : <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>{skill.owner.name?.[0]}</div>
              }
              <div>
                <p className="text-xs font-medium text-slate-300">{skill.owner.name}</p>
                {skill.owner.averageRating > 0 && (
                  <p className="text-xs text-amber-300 flex items-center gap-0.5"><Star size={10} fill="currentColor"/>{skill.owner.averageRating}</p>
                )}
              </div>
            </div>
            {skill.owner.isOnline && <span className="w-2 h-2 bg-emerald-400 rounded-full" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.7)' }}/>}
          </div>
        )}
      </div>
    </Link>
  );
};

const Skills = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    level: '',
    type: '',
    exchangePreference: '',
  });

  const fetchSkills = useCallback(async (pageNum = 1, reset = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 12 });
      Object.entries(filters).forEach(([k,v]) => { if (v) params.set(k, v); });
      const { data } = await api.get('/skills?' + params.toString());
      if (reset) {
        setSkills(data.data);
      } else {
        setSkills(prev => [...prev, ...data.data]);
      }
      setTotal(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { setPage(1); fetchSkills(1, true); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSkills(1, true);
  };

  const clearFilter = (key) => setFilters(f => ({ ...f, [key]: '' }));
  const activeFilters = Object.entries(filters).filter(([k,v]) => v && k !== 'q');

  return (
    <div className="relative min-h-screen bg-[#020010] text-slate-100 overflow-hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-fuchsia-600/15 blur-[120px] animate-[float1_18s_ease-in-out_infinite]"/>
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-cyan-500/12 blur-[120px] animate-[float2_22s_ease-in-out_infinite]"/>
        <div className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full bg-indigo-600/10 blur-[110px] animate-[float3_20s_ease-in-out_infinite]"/>
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}/>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.15)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.05)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(16px)} to{opacity:1; transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slideDown { from{opacity:0; transform:translateY(-10px); max-height:0} to{opacity:1; transform:translateY(0); max-height:300px} }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .glass { background: rgba(255,255,255,0.035); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-strong { background: rgba(255,255,255,0.05); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); }
        .glass-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); }
        .glass-input:focus { border-color: rgba(34,211,238,0.5); box-shadow: 0 0 0 3px rgba(34,211,238,0.12); }
        .neon-text { background: linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6); background-size: 200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation: shimmer 6s linear infinite; }
        .filter-panel { animation: slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .filter-panel, .animate-[float1_18s_ease-in-out_infinite], .animate-[float2_22s_ease-in-out_infinite], .animate-[float3_20s_ease-in-out_infinite] { animation: none !important; }
        }
      `}</style>

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">

        {/* Header */}
        <div className={`mb-8 ${mounted ? 'fade-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-medium tracking-wide text-cyan-300 mb-3">
            <Sparkles size={12}/> DISCOVER SKILLS
          </div>
          <h1 className="text-3xl md:text-[2.5rem] font-bold leading-tight tracking-tight">
            Browse <span className="neon-text">Skills</span>
          </h1>
          <p className="text-slate-400 mt-2 text-[15px]">
            {total > 0 ? <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{total}</span> : ''}{total > 0 ? ' skills available for exchange' : 'Find skills to learn or people to teach'}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className={`flex gap-3 mb-5 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '60ms' }}>
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input
              value={filters.q}
              onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
              placeholder="Search skills, e.g. Python, Guitar, Yoga..."
              className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
            />
          </div>
          <button type="submit"
            className="group relative px-6 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
            Search
          </button>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl glass border transition-colors ${showFilters ? 'border-cyan-400/40 text-cyan-300' : 'border-white/10 text-slate-400 hover:text-slate-200'}`}>
            <SlidersHorizontal size={18}/>
          </button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filter-panel glass-strong rounded-2xl p-6 mb-6 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                <select value={filters.category} onChange={e=>setFilters(f=>({...f,category:e.target.value}))}
                  className="glass-input w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none">
                  <option value="" className="bg-[#0a0420]">All Categories</option>
                  {CATEGORIES.map(c=><option key={c} value={c} className="bg-[#0a0420]">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Level</label>
                <select value={filters.level} onChange={e=>setFilters(f=>({...f,level:e.target.value}))}
                  className="glass-input w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none">
                  <option value="" className="bg-[#0a0420]">All Levels</option>
                  {LEVELS.map(l=><option key={l} value={l} className="bg-[#0a0420]">{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
                <select value={filters.type} onChange={e=>setFilters(f=>({...f,type:e.target.value}))}
                  className="glass-input w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none">
                  <option value="" className="bg-[#0a0420]">All Types</option>
                  <option value="offered" className="bg-[#0a0420]">Offered</option>
                  <option value="wanted" className="bg-[#0a0420]">Wanted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Exchange</label>
                <select value={filters.exchangePreference} onChange={e=>setFilters(f=>({...f,exchangePreference:e.target.value}))}
                  className="glass-input w-full px-3 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none">
                  <option value="" className="bg-[#0a0420]">Any</option>
                  <option value="online" className="bg-[#0a0420]">Online</option>
                  <option value="in-person" className="bg-[#0a0420]">In-Person</option>
                  <option value="both" className="bg-[#0a0420]">Both</option>
                </select>
              </div>
            </div>
            <button onClick={() => setFilters({q:'',category:'',level:'',type:'',exchangePreference:''})}
              className="mt-4 text-sm text-slate-400 hover:text-rose-300 transition-colors">
              Clear All Filters
            </button>
          </div>
        )}

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-5">
            {activeFilters.map(([k,v])=>(
              <span key={k} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
                {v}
                <button onClick={()=>clearFilter(k)} className="hover:text-white"><X size={12}/></button>
              </span>
            ))}
          </div>
        )}

        {/* Skills Grid */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="glass-strong rounded-2xl p-5 h-48 animate-pulse">
                <div className="h-4 w-20 bg-white/5 rounded-full mb-4"/>
                <div className="h-5 w-3/4 bg-white/5 rounded mb-2"/>
                <div className="h-3 w-full bg-white/5 rounded mb-1.5"/>
                <div className="h-3 w-2/3 bg-white/5 rounded"/>
              </div>
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div className="glass-strong rounded-3xl py-20 px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl glass flex items-center justify-center border border-white/10">
              <Search size={26} className="text-cyan-300"/>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">No skills found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((skill, i) => <SkillCard key={skill._id} skill={skill} index={i}/>)}
            </div>
            {skills.length < total && (
              <div className="text-center mt-10">
                <button
                  onClick={() => { const next = page + 1; setPage(next); fetchSkills(next, false); }}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl text-sm font-semibold glass border border-white/10 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/30 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Loading...' : `Load More (${total - skills.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Skills;