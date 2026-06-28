import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Camera, Plus, X, Save, MapPin, User, Sparkles, Target, TrendingUp, Link2, Loader } from 'lucide-react';
import api from '../api/axios.js';
import { updateUserField } from '../store/index.js';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = ['student','beginner','intermediate','advanced','expert','professional'];
const SKILL_LEVELS = ['beginner','intermediate','advanced','expert'];
const CATEGORIES = ['Technology','Design','Music','Language','Cooking','Fitness','Art','Business','Writing','Photography','Other'];

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .ep-page { background:#020010; min-height:100vh; padding:32px 24px 80px; font-family:'Inter',sans-serif; color:#F8FAFC; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 18px rgba(124,58,237,0.3)}
    50%{box-shadow:0 0 36px rgba(124,58,237,0.65),0 0 70px rgba(6,182,212,0.25)}
  }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes shimmerBar { 0%{background-position:-200% center} 100%{background-position:200% center} }

  .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; backdrop-filter:blur(20px); }

  .ep-label { font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; font-family:'Space Grotesk',sans-serif; }

  .ep-input, .ep-textarea, .ep-select {
    width:100%; background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1); border-radius:12px;
    padding:12px 16px; color:#F8FAFC; font-size:14px; outline:none;
    transition:all 0.2s ease; font-family:'Inter',sans-serif;
  }
  .ep-input:focus, .ep-textarea:focus, .ep-select:focus { border-color:rgba(124,58,237,0.6); box-shadow:0 0 0 3px rgba(124,58,237,0.12); background:rgba(124,58,237,0.05); }
  .ep-input::placeholder, .ep-textarea::placeholder { color:#475569; }
  .ep-select { cursor:pointer; appearance:none; background-color:#0A0A1A; }
  .ep-textarea { resize:none; }

  .nav-item {
    width:100%; text-align:left; padding:12px 16px; font-size:13px; font-weight:600;
    color:#64748B; background:transparent; border:none; cursor:pointer; border-radius:12px;
    transition:all 0.2s ease; font-family:'Space Grotesk',sans-serif; display:flex; align-items:center; gap:10px;
  }
  .nav-item:hover { background:rgba(124,58,237,0.1); color:#A78BFA; }
  .nav-item.active { background:linear-gradient(135deg,rgba(124,58,237,0.22),rgba(6,182,212,0.15)); color:#F1F5F9; box-shadow:inset 0 0 0 1px rgba(124,58,237,0.4); }

  .nav-tab-mobile {
    padding:8px 16px; border-radius:50px; font-size:12px; font-weight:600; white-space:nowrap; flex-shrink:0;
    cursor:pointer; transition:all 0.2s ease; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(255,255,255,0.1);
  }
  .nav-tab-mobile.active { background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; border-color:transparent; box-shadow:0 0 16px rgba(124,58,237,0.5); }
  .nav-tab-mobile:not(.active) { background:rgba(255,255,255,0.04); color:#94A3B8; }

  .neon-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,#7C3AED,#06B6D4);
    color:white; border:none; border-radius:50px;
    padding:12px 26px; font-weight:700; font-size:14px;
    cursor:pointer; position:relative; overflow:hidden;
    transition:all 0.3s ease; font-family:'Space Grotesk',sans-serif;
    box-shadow:0 0 24px rgba(124,58,237,0.45);
  }
  .neon-btn:hover { transform:translateY(-2px); box-shadow:0 0 36px rgba(124,58,237,0.7); }
  .neon-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .neon-btn-sm {
    display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#7C3AED,#06B6D4);
    color:#fff; border:none; border-radius:50px; padding:9px 18px; font-weight:700; font-size:13px;
    cursor:pointer; font-family:'Space Grotesk',sans-serif; box-shadow:0 0 18px rgba(124,58,237,0.4);
    transition:all 0.25s ease;
  }
  .neon-btn-sm:hover { transform:translateY(-2px); box-shadow:0 0 28px rgba(124,58,237,0.65); }

  .ghost-btn {
    display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.12); color:#A78BFA; border-radius:50px; padding:9px 18px;
    font-weight:600; font-size:13px; cursor:pointer; font-family:'Space Grotesk',sans-serif;
    transition:all 0.2s ease;
  }
  .ghost-btn:hover { background:rgba(124,58,237,0.15); border-color:rgba(124,58,237,0.4); }

  .skill-row {
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:14px; transition:all 0.2s ease;
  }
  .skill-row:hover { background:rgba(124,58,237,0.07); border-color:rgba(124,58,237,0.25); }

  .pill { font-size:11px; font-weight:700; padding:3px 11px; border-radius:50px; font-family:'Space Grotesk',sans-serif; background:rgba(124,58,237,0.18); border:1px solid rgba(124,58,237,0.35); color:#A78BFA; }

  .remove-btn { width:30px; height:30px; border-radius:9px; border:none; background:rgba(239,68,68,0.12); color:#F87171; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; flex-shrink:0; }
  .remove-btn:hover { background:rgba(239,68,68,0.25); }

  .dashed-box { border:1.5px dashed rgba(124,58,237,0.3); border-radius:18px; padding:20px; background:rgba(124,58,237,0.04); }

  .progress-track { width:100%; background:rgba(255,255,255,0.07); border-radius:50px; height:9px; overflow:hidden; }
  .progress-fill { height:100%; border-radius:50px; background:linear-gradient(90deg,#7C3AED,#06B6D4,#7C3AED); background-size:200% 100%; animation:shimmerBar 3s linear infinite; box-shadow:0 0 10px rgba(124,58,237,0.6); transition:width 0.4s ease; }

  .range-slider { width:100%; margin-top:8px; accent-color:#7C3AED; cursor:pointer; }

  .avatar-glow-ring { position:relative; width:96px; height:96px; border-radius:24px; padding:3px; background:linear-gradient(135deg,#7C3AED,#06B6D4); box-shadow:0 0 30px rgba(124,58,237,0.4); flex-shrink:0; }
  .avatar-glow-ring img, .avatar-glow-ring .avatar-fallback { width:100%; height:100%; border-radius:21px; object-fit:cover; }

  .camera-btn { position:absolute; bottom:-4px; right:-4px; width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; border:3px solid #020010; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; box-shadow:0 0 16px rgba(124,58,237,0.5); }
  .camera-btn:hover { transform:scale(1.08); }

  .section-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(124,58,237,0.2); border:1px solid rgba(124,58,237,0.4); border-radius:50px; padding:5px 14px; font-size:11px; font-weight:600; color:#A78BFA; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk',sans-serif; }

  @media (max-width:768px) { .ep-sidebar { display:none !important; } }
  @media (min-width:769px) { .ep-mobile-tabs { display:none !important; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const EditProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    headline: user?.headline || '',
    experienceLevel: user?.experienceLevel || 'beginner',
    website: user?.website || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
  });
  const [newSkillOffered, setNewSkillOffered] = useState({ name:'', category:'', level:'intermediate', description:'' });
  const [newSkillWanted, setNewSkillWanted] = useState({ name:'', category:'', targetLevel:'beginner' });
  const [newProgress, setNewProgress] = useState({ skillName:'', progressPercent:0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      dispatch(updateUserField(data.data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await api.put('/users/avatar', fd, { headers:{ 'Content-Type':'multipart/form-data' }});
      dispatch(updateUserField({ avatar: data.data.avatar }));
      toast.success('Avatar updated!');
    } catch { toast.error('Avatar upload failed'); }
    finally { setUploading(false); }
  };

  const handleAddSkillOffered = async () => {
    if (!newSkillOffered.name.trim()) { toast.error('Skill name required'); return; }
    try {
      const { data } = await api.post('/users/skills/offered', newSkillOffered);
      dispatch(updateUserField({ skillsOffered: data.data.skillsOffered }));
      setNewSkillOffered({ name:'', category:'', level:'intermediate', description:'' });
      toast.success('Skill added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveSkillOffered = async (skillId) => {
    try {
      const { data } = await api.delete('/users/skills/offered/' + skillId);
      dispatch(updateUserField({ skillsOffered: data.data.skillsOffered }));
      toast.success('Skill removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handleAddSkillWanted = async () => {
    if (!newSkillWanted.name.trim()) { toast.error('Skill name required'); return; }
    try {
      const { data } = await api.post('/users/skills/wanted', newSkillWanted);
      dispatch(updateUserField({ skillsWanted: data.data.skillsWanted }));
      setNewSkillWanted({ name:'', category:'', targetLevel:'beginner' });
      toast.success('Skill added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveSkillWanted = async (skillId) => {
    try {
      const { data } = await api.delete('/users/skills/wanted/' + skillId);
      dispatch(updateUserField({ skillsWanted: data.data.skillsWanted }));
    } catch { toast.error('Failed to remove'); }
  };

  const handleUpdateProgress = async () => {
    if (!newProgress.skillName.trim()) return;
    try {
      const { data } = await api.put('/users/learning-progress', newProgress);
      dispatch(updateUserField({ learningProgress: data.data.learningProgress }));
      setNewProgress({ skillName:'', progressPercent:0 });
      toast.success('Progress updated!');
    } catch { toast.error('Failed'); }
  };

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await api.put('/users/location', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        toast.success('Location updated!');
      } catch { toast.error('Location update failed'); }
    }, () => toast.error('Location access denied'));
  };

  const sections = [
    {id:'basic', label:'Basic Info', icon: <User size={15} />},
    {id:'skills-offered', label:'Skills Offered', icon: <Sparkles size={15} />},
    {id:'skills-wanted', label:'Skills Wanted', icon: <Target size={15} />},
    {id:'progress', label:'Progress', icon: <TrendingUp size={15} />},
    {id:'social', label:'Social Links', icon: <Link2 size={15} />},
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="ep-page">
        {/* BG orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.16) 0%,transparent 70%)', animation: 'orb1 16s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'orb2 19s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 940, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 28, animation: 'fadeInUp 0.5s ease both' }}>
            <div className="section-tag" style={{ marginBottom: 14 }}><User size={12} /> Your Profile</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#F8FAFC,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Edit Profile
            </h1>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 6 }}>Keep your profile up to date to get better skill matches</p>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {/* Sidebar */}
            <div className="ep-sidebar" style={{ width: 200, flexShrink: 0 }}>
              <div className="glass" style={{ padding: 10, position: 'sticky', top: 96, animation: 'fadeInUp 0.5s 0.05s ease both' }}>
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActiveSection(s.id)} className={`nav-item ${activeSection === s.id ? 'active' : ''}`}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

              {/* Mobile tabs */}
              <div className="ep-mobile-tabs" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActiveSection(s.id)} className={`nav-tab-mobile ${activeSection === s.id ? 'active' : ''}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Avatar */}
              <div className="glass" style={{ padding: 24, animation: 'fadeInUp 0.5s 0.08s ease both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div className="avatar-glow-ring">
                    {user?.avatar
                      ? <img src={user.avatar} alt={user.name} />
                      : <div className="avatar-fallback" style={{ background: '#0A0A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F8FAFC', fontSize: 30, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{user?.name?.[0]}</div>
                    }
                    <button onClick={() => fileRef.current?.click()} disabled={uploading} className="camera-btn">
                      {uploading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={13} />}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#F1F5F9' }}>{user?.name}</p>
                    <p style={{ fontSize: 13, color: '#64748B' }}>{user?.email}</p>
                    <button onClick={() => fileRef.current?.click()} className="ghost-btn" style={{ marginTop: 10 }}>Change Photo</button>
                  </div>
                </div>
              </div>

              {/* ── Basic Info ─────────────────────────────────────── */}
              {activeSection === 'basic' && (
                <div className="glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeInUp 0.4s ease both' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#F1F5F9' }}>Basic Information</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                    <div>
                      <label className="ep-label">Full Name</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="ep-input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="ep-label">Experience Level</label>
                      <select value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })} className="ep-select">
                        {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="ep-label">Headline</label>
                    <input value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} className="ep-input" placeholder="e.g. Full-Stack Developer & Guitar Enthusiast" maxLength={120} />
                    <p style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>{form.headline.length}/120</p>
                  </div>
                  <div>
                    <label className="ep-label">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} className="ep-textarea" placeholder="Tell people about yourself, your background, and what you're passionate about..." maxLength={1000} />
                    <p style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>{form.bio.length}/1000</p>
                  </div>
                  <div>
                    <label className="ep-label">Location</label>
                    <button onClick={handleLocation} className="ghost-btn"><MapPin size={14} /> Detect My Location</button>
                  </div>
                  <button onClick={handleSave} disabled={saving} className="neon-btn" style={{ alignSelf: 'flex-start' }}>
                    {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Save size={16} />Save Changes</>}
                  </button>
                </div>
              )}

              {/* ── Skills Offered ─────────────────────────────────── */}
              {activeSection === 'skills-offered' && (
                <div className="glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeInUp 0.4s ease both' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#F1F5F9' }}>Skills You Offer</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {user?.skillsOffered?.length ? user.skillsOffered.map(s => (
                      <div key={s._id} className="skill-row">
                        <div>
                          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{s.name}</span>
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <span className="pill">{s.level}</span>
                            {s.category && <span className="pill" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', color: '#22D3EE' }}>{s.category}</span>}
                          </div>
                        </div>
                        <button onClick={() => handleRemoveSkillOffered(s._id)} className="remove-btn"><X size={15} /></button>
                      </div>
                    )) : <p style={{ fontSize: 13, color: '#475569' }}>No skills added yet.</p>}
                  </div>
                  <div className="dashed-box">
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#A78BFA', marginBottom: 14 }}>+ Add New Skill</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label className="ep-label">Skill Name *</label>
                        <input value={newSkillOffered.name} onChange={e => setNewSkillOffered({ ...newSkillOffered, name: e.target.value })} className="ep-input" placeholder="e.g. Python, Guitar" />
                      </div>
                      <div>
                        <label className="ep-label">Category</label>
                        <select value={newSkillOffered.category} onChange={e => setNewSkillOffered({ ...newSkillOffered, category: e.target.value })} className="ep-select">
                          <option value="">Select...</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="ep-label">Level</label>
                        <select value={newSkillOffered.level} onChange={e => setNewSkillOffered({ ...newSkillOffered, level: e.target.value })} className="ep-select">
                          {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label className="ep-label">Description (optional)</label>
                      <input value={newSkillOffered.description} onChange={e => setNewSkillOffered({ ...newSkillOffered, description: e.target.value })} className="ep-input" placeholder="Brief description of your expertise" />
                    </div>
                    <button onClick={handleAddSkillOffered} className="neon-btn-sm"><Plus size={14} />Add Skill</button>
                  </div>
                </div>
              )}

              {/* ── Skills Wanted ──────────────────────────────────── */}
              {activeSection === 'skills-wanted' && (
                <div className="glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeInUp 0.4s ease both' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#F1F5F9' }}>Skills You Want to Learn</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {user?.skillsWanted?.length ? user.skillsWanted.map(s => (
                      <div key={s._id} className="skill-row">
                        <div>
                          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{s.name}</span>
                          <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{s.currentLevel} → {s.targetLevel}</p>
                        </div>
                        <button onClick={() => handleRemoveSkillWanted(s._id)} className="remove-btn"><X size={15} /></button>
                      </div>
                    )) : <p style={{ fontSize: 13, color: '#475569' }}>No skills added yet.</p>}
                  </div>
                  <div className="dashed-box">
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#A78BFA', marginBottom: 14 }}>+ Add Skill to Learn</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label className="ep-label">Skill Name *</label>
                        <input value={newSkillWanted.name} onChange={e => setNewSkillWanted({ ...newSkillWanted, name: e.target.value })} className="ep-input" placeholder="e.g. Spanish, JavaScript" />
                      </div>
                      <div>
                        <label className="ep-label">Category</label>
                        <select value={newSkillWanted.category} onChange={e => setNewSkillWanted({ ...newSkillWanted, category: e.target.value })} className="ep-select">
                          <option value="">Select...</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="ep-label">Target Level</label>
                        <select value={newSkillWanted.targetLevel} onChange={e => setNewSkillWanted({ ...newSkillWanted, targetLevel: e.target.value })} className="ep-select">
                          {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={handleAddSkillWanted} className="neon-btn-sm"><Plus size={14} />Add to List</button>
                  </div>
                </div>
              )}

              {/* ── Progress ───────────────────────────────────────── */}
              {activeSection === 'progress' && (
                <div className="glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.4s ease both' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#F1F5F9' }}>Learning Progress</h2>
                  {user?.learningProgress?.length ? user.learningProgress.map(lp => (
                    <div key={lp._id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{lp.skillName}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: '#A78BFA' }}>{lp.progressPercent}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${lp.progressPercent}%` }} /></div>
                    </div>
                  )) : <p style={{ fontSize: 13, color: '#475569' }}>No progress tracked yet.</p>}
                  <div className="dashed-box">
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#A78BFA', marginBottom: 14 }}>Update Progress</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 14 }}>
                      <div>
                        <label className="ep-label">Skill Name</label>
                        <input value={newProgress.skillName} onChange={e => setNewProgress({ ...newProgress, skillName: e.target.value })} className="ep-input" placeholder="e.g. Python" />
                      </div>
                      <div>
                        <label className="ep-label">Progress ({newProgress.progressPercent}%)</label>
                        <input type="range" min="0" max="100" value={newProgress.progressPercent}
                          onChange={e => setNewProgress({ ...newProgress, progressPercent: parseInt(e.target.value) })}
                          className="range-slider" />
                      </div>
                    </div>
                    <button onClick={handleUpdateProgress} className="neon-btn-sm"><Save size={14} />Save Progress</button>
                  </div>
                </div>
              )}

              {/* ── Social Links ───────────────────────────────────── */}
              {activeSection === 'social' && (
                <div className="glass" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeInUp 0.4s ease both' }}>
                  <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#F1F5F9' }}>Social Links</h2>
                  {[
                    { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
                    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                    { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="ep-label">{label}</label>
                      <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} className="ep-input" placeholder={placeholder} />
                    </div>
                  ))}
                  <button onClick={handleSave} disabled={saving} className="neon-btn" style={{ alignSelf: 'flex-start' }}>
                    {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Save size={16} />Save Links</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;