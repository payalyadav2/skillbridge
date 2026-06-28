import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, Video, Clock, Play, X, Plus, ChevronRight, MapPin, Phone, Sparkles } from 'lucide-react';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';
import Modal from '../components/common/Modal.jsx';
import toast from 'react-hot-toast';
import { format, isPast, isFuture } from 'date-fns';

const STATUS_GLOW = {
  scheduled: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-400/30', glow: 'shadow-[0_0_18px_rgba(34,211,238,0.25)]', dot: 'bg-cyan-400' },
  ongoing: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-400/30', glow: 'shadow-[0_0_18px_rgba(52,211,153,0.35)]', dot: 'bg-emerald-400' },
  completed: { text: 'text-indigo-300', bg: 'bg-indigo-500/10', border: 'border-indigo-400/30', glow: 'shadow-[0_0_14px_rgba(129,140,248,0.2)]', dot: 'bg-indigo-400' },
  cancelled: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-400/20', glow: '', dot: 'bg-slate-500' },
  'no-show': { text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-400/30', glow: 'shadow-[0_0_14px_rgba(251,113,133,0.25)]', dot: 'bg-rose-400' },
};

const TYPE_ICON = { video: Video, 'in-person': MapPin, phone: Phone };

const Sessions = () => {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [exchanges, setExchanges] = useState([]);
  const [schedForm, setSchedForm] = useState({ exchangeRequestId:'', title:'', scheduledAt:'', duration:60, type:'video', description:'' });
  const [scheduling, setScheduling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchSessions = () => {
    const params = filter === 'upcoming' ? '?upcoming=true' : filter !== 'all' ? '?status=' + filter : '';
    api.get('/sessions' + params).then(({ data }) => setSessions(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions(); }, [filter]);

  useEffect(() => {
    if (scheduleModal) {
      api.get('/exchanges?status=accepted').then(({ data }) => setExchanges(data.data));
    }
  }, [scheduleModal]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!schedForm.exchangeRequestId || !schedForm.title || !schedForm.scheduledAt) {
      toast.error('Please fill all required fields'); return;
    }
    setScheduling(true);
    try {
      await api.post('/sessions', schedForm);
      toast.success('Session scheduled!');
      setScheduleModal(false);
      fetchSessions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setScheduling(false); }
  };

  const handleEndSession = async (id) => {
    try {
      await api.put('/sessions/' + id + '/end');
      toast.success('Session ended');
      fetchSessions();
    } catch { toast.error('Failed'); }
  };

  const handleCancelSession = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await api.put('/sessions/' + id + '/cancel');
      toast.success('Session cancelled');
      fetchSessions();
    } catch { toast.error('Failed'); }
  };

  const filters = [
    { id: 'upcoming', label: 'Upcoming', icon: '◷' },
    { id: 'completed', label: 'Completed', icon: '◉' },
    { id: 'all', label: 'All', icon: '◈' },
  ];

  // Stats for the header strip — counts derived from currently loaded sessions
  const stats = useMemo(() => {
    const upcoming = sessions.filter(s => isFuture(new Date(s.scheduledAt)) && s.status === 'scheduled').length;
    const live = sessions.filter(s => s.status === 'ongoing').length;
    const done = sessions.filter(s => s.status === 'completed').length;
    return { upcoming, live, done, total: sessions.length };
  }, [sessions]);

  if (loading) return <PageLoader/>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020010] text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] rounded-full bg-fuchsia-600/20 blur-[120px] animate-[float1_18s_ease-in-out_infinite]"/>
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-cyan-500/15 blur-[120px] animate-[float2_22s_ease-in-out_infinite]"/>
        <div className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full bg-indigo-600/15 blur-[110px] animate-[float3_20s_ease-in-out_infinite]"/>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }}/>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.1)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.15)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.05)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(18px)} to{opacity:1; transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulseGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin3d { from{transform:rotateY(0deg)} to{transform:rotateY(360deg)} }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .glass { background: rgba(255,255,255,0.035); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-strong { background: rgba(255,255,255,0.05); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); }
        .neon-text { background: linear-gradient(90deg,#22d3ee,#a78bfa,#f472b6); background-size: 200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation: shimmer 6s linear infinite; }
        .date-3d { transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .date-card:hover .date-3d { transform: rotateY(180deg); }
        .date-3d-face { position:absolute; inset:0; backface-visibility:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:0.875rem; }
        .date-3d-back { transform: rotateY(180deg); }
        .reduce-motion-safe { }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .animate-[float1_18s_ease-in-out_infinite], .animate-[float2_22s_ease-in-out_infinite], .animate-[float3_20s_ease-in-out_infinite] { animation: none !important; }
          .date-3d { transition: none !important; }
        }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">

        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-9 ${mounted ? 'fade-up' : 'opacity-0'}`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-medium tracking-wide text-cyan-300 mb-3">
              <Sparkles size={12} className="text-cyan-300"/> LIVE SCHEDULE
            </div>
            <h1 className="text-3xl md:text-[2.5rem] font-bold leading-tight tracking-tight">
              My <span className="neon-text">Sessions</span>
            </h1>
            <p className="text-slate-400 mt-2 text-[15px]">Where skill exchanges become real conversations.</p>
          </div>
          <button
            onClick={() => setScheduleModal(true)}
            className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm overflow-hidden self-start md:self-auto"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
            <Plus size={16}/> Schedule Session
          </button>
        </div>

        {/* Stat strip — signature element: a mini timeline-style readout */}
        <div className={`grid grid-cols-3 gap-3 md:gap-4 mb-9 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '80ms' }}>
          {[
            { label: 'Upcoming', value: stats.upcoming, color: 'text-cyan-300', ring: 'border-cyan-400/25' },
            { label: 'Live now', value: stats.live, color: 'text-emerald-300', ring: 'border-emerald-400/25' },
            { label: 'Completed', value: stats.done, color: 'text-indigo-300', ring: 'border-indigo-400/25' },
          ].map((s, i) => (
            <div key={i} className={`glass rounded-2xl px-4 py-4 border ${s.ring} text-center md:text-left`}>
              <p className={`text-2xl md:text-3xl font-bold ${s.color}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{String(s.value).padStart(2,'0')}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className={`flex gap-2 mb-8 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '140ms' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                filter === f.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/40 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.18)]'
                  : 'glass border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
              }`}>
              <span className="mr-1.5 opacity-70">{f.icon}</span>{f.label}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className={`glass-strong rounded-3xl py-20 px-6 text-center ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '180ms' }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl glass flex items-center justify-center border border-white/10">
              <Calendar size={26} className="text-cyan-300"/>
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">No sessions yet</h3>
            <p className="text-slate-500 mb-7 max-w-sm mx-auto">Schedule a session once you've accepted a skill exchange — your calendar starts here.</p>
            <button onClick={() => setScheduleModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
              <Plus size={16}/> Schedule a Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, idx) => {
              const isHost = session.host?._id === user?._id;
              const other = isHost ? session.participant : session.host;
              const isUpcoming = isFuture(new Date(session.scheduledAt)) && session.status === 'scheduled';
              const isOngoing = session.status === 'ongoing';
              const glow = STATUS_GLOW[session.status] || STATUS_GLOW.scheduled;
              const TypeIcon = TYPE_ICON[session.type] || Video;

              return (
                <div key={session._id}
                  className={`group relative glass-strong rounded-2xl p-5 md:p-6 transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 ${glow.glow} fade-up`}
                  style={{ animationDelay: `${Math.min(idx,8) * 60 + 200}ms` }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* 3D flip date card */}
                      <div className="date-card flex-shrink-0 w-16 h-[4.5rem] [perspective:800px]">
                        <div className="date-3d relative w-full h-full">
                          <div className="date-3d-face text-white" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
                            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">{format(new Date(session.scheduledAt), 'MMM')}</span>
                            <span className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{format(new Date(session.scheduledAt), 'd')}</span>
                          </div>
                          <div className="date-3d-face date-3d-back text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
                            <Clock size={16} className="mb-1 opacity-90"/>
                            <span className="text-xs font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{format(new Date(session.scheduledAt), 'h:mm a')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-100 truncate">{session.title}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${glow.bg} ${glow.text} ${glow.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${glow.dot}`} style={session.status === 'ongoing' ? { animation: 'pulseGlow 1.6s ease-in-out infinite' } : {}}/>
                            {session.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-400">
                          <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-500"/>{format(new Date(session.scheduledAt), 'h:mm a')}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-500"/>{session.duration} min</span>
                          <span className="flex items-center gap-1.5"><TypeIcon size={13} className="text-slate-500"/>{session.type}</span>
                        </div>
                        {other && (
                          <Link to={"/profile/"+other._id} className="flex items-center gap-2 mt-3 group/link">
                            {other.avatar
                              ? <img src={other.avatar} alt={other.name} className="w-6 h-6 rounded-full object-cover border border-white/10"/>
                              : <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>{other.name?.[0]}</div>
                            }
                            <span className="text-[13px] text-slate-300 group-hover/link:text-cyan-300 transition-colors">{other.name}</span>
                            <span className="text-[11px] text-slate-500">{isHost ? '(participant)' : '(host)'}</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 flex-shrink-0 w-full md:w-auto">
                      {(isUpcoming || isOngoing) && session.type === 'video' && session.roomId && (
                        <Link to={"/session/"+session.roomId}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
                          <Video size={13}/> {isOngoing ? 'Rejoin' : 'Join Call'}
                        </Link>
                      )}
                      {isOngoing && isHost && (
                        <button onClick={() => handleEndSession(session._id)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-200 bg-rose-500/15 border border-rose-400/30 hover:bg-rose-500/25 transition-colors">
                          End Session
                        </button>
                      )}
                      {isUpcoming && (
                        <button onClick={() => handleCancelSession(session._id)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors">
                          Cancel
                        </button>
                      )}
                      {session.status === 'completed' && (
                        <Link to={"/exchanges"}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-indigo-200 bg-indigo-500/15 border border-indigo-400/30 hover:bg-indigo-500/25 transition-colors">
                          Leave Review
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Agenda */}
                  {session.agendaItems?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[11px] text-slate-500 mb-2 uppercase tracking-wide">Agenda</p>
                      <div className="flex flex-wrap gap-2">
                        {session.agendaItems.map((item, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-[12px] glass text-slate-300 border border-white/5">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={scheduleModal} onClose={() => setScheduleModal(false)} title="Schedule a Session" size="lg">
        <form onSubmit={handleSchedule} className="p-6 space-y-4 bg-[#040016] text-slate-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Exchange Request *</label>
            <select value={schedForm.exchangeRequestId} onChange={e => setSchedForm(f=>({...f,exchangeRequestId:e.target.value}))}
              className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]" required>
              <option value="" className="bg-[#0a0420]">Select accepted exchange...</option>
              {exchanges.map(ex => {
                const other = ex.sender?._id === user?._id ? ex.receiver : ex.sender;
                return <option key={ex._id} value={ex._id} className="bg-[#0a0420]">{ex.skillOffered?.name} ↔ {ex.skillWanted?.name} with {other?.name}</option>;
              })}
            </select>
            {!exchanges.length && <p className="text-xs text-amber-400 mt-1.5">No accepted exchanges. <Link to="/exchanges" className="underline">View your exchanges</Link>.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Title *</label>
            <input value={schedForm.title} onChange={e=>setSchedForm(f=>({...f,title:e.target.value}))}
              className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
              placeholder="e.g. Python Basics - Session 1" required/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date & Time *</label>
              <input type="datetime-local" value={schedForm.scheduledAt} onChange={e=>setSchedForm(f=>({...f,scheduledAt:e.target.value}))}
                className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
                required min={new Date().toISOString().slice(0,16)}/>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration</label>
              <select value={schedForm.duration} onChange={e=>setSchedForm(f=>({...f,duration:parseInt(e.target.value)}))}
                className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
                {[30,45,60,90,120].map(d=><option key={d} value={d} className="bg-[#0a0420]">{d} min</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Session Type</label>
            <div className="flex gap-2">
              {[{id:'video',label:'Video',icon:Video},{id:'in-person',label:'In-Person',icon:MapPin},{id:'phone',label:'Phone',icon:Phone}].map(t=>(
                <button type="button" key={t.id} onClick={()=>setSchedForm(f=>({...f,type:t.id}))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    schedForm.type===t.id
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                      : 'border-white/10 text-slate-500 hover:text-slate-300'
                  }`}>
                  <t.icon size={14}/> {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (optional)</label>
            <textarea value={schedForm.description} onChange={e=>setSchedForm(f=>({...f,description:e.target.value}))} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl glass border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 resize-none focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]"
              placeholder="What will you cover in this session?"/>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setScheduleModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 border border-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={scheduling}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
              {scheduling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Calendar size={15}/> Schedule Session</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sessions;