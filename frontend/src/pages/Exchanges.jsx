import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle, XCircle, Clock, MessageSquare, Star, Handshake, Loader } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal.jsx';
import { PageLoader } from '../components/common/Loader.jsx';

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .ex-page { background:#020010; min-height:100vh; padding:32px 24px 80px; font-family:'Inter',sans-serif; color:#F8FAFC; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes orb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
  @keyframes handshakeFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-6px) rotate(3deg)} }

  .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; backdrop-filter:blur(20px); transition:all 0.3s ease; }
  .glass-hover:hover { background:rgba(255,255,255,0.06); border-color:rgba(124,58,237,0.3); transform:translateY(-3px); box-shadow:0 16px 50px rgba(124,58,237,0.16); }

  .section-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(124,58,237,0.2); border:1px solid rgba(124,58,237,0.4); border-radius:50px; padding:5px 14px; font-size:11px; font-weight:600; color:#A78BFA; letter-spacing:1px; text-transform:uppercase; font-family:'Space Grotesk',sans-serif; }

  .neon-btn-sm {
    display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#7C3AED,#06B6D4);
    color:#fff; border:none; border-radius:50px; padding:9px 18px; font-weight:700; font-size:13px;
    cursor:pointer; font-family:'Space Grotesk',sans-serif; box-shadow:0 0 18px rgba(124,58,237,0.4);
    transition:all 0.25s ease; white-space:nowrap;
  }
  .neon-btn-sm:hover { transform:translateY(-2px); box-shadow:0 0 28px rgba(124,58,237,0.65); }
  .neon-btn-sm:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

  .danger-btn-sm {
    display:inline-flex; align-items:center; justify-content:center; gap:6px; background:rgba(239,68,68,0.14);
    color:#F87171; border:1px solid rgba(239,68,68,0.35); border-radius:50px; padding:8px 16px; font-weight:700;
    font-size:13px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all 0.2s ease;
  }
  .danger-btn-sm:hover { background:rgba(239,68,68,0.25); }

  .ghost-btn-sm {
    display:inline-flex; align-items:center; justify-content:center; gap:6px; background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.12); color:#94A3B8; border-radius:50px; padding:8px 16px;
    font-weight:600; font-size:13px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all 0.2s ease;
    text-decoration:none;
  }
  .ghost-btn-sm:hover { background:rgba(124,58,237,0.15); border-color:rgba(124,58,237,0.4); color:#A78BFA; }

  .secondary-btn-sm {
    display:inline-flex; align-items:center; justify-content:center; gap:6px; background:rgba(6,182,212,0.14);
    border:1px solid rgba(6,182,212,0.35); color:#22D3EE; border-radius:50px; padding:8px 16px;
    font-weight:700; font-size:13px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all 0.2s ease;
    text-decoration:none;
  }
  .secondary-btn-sm:hover { background:rgba(6,182,212,0.25); }

  .filter-pill {
    padding:8px 18px; border-radius:50px; font-size:13px; font-weight:600; white-space:nowrap; flex-shrink:0;
    cursor:pointer; transition:all 0.2s ease; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(255,255,255,0.1);
  }
  .filter-pill.active { background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; border-color:transparent; box-shadow:0 0 18px rgba(124,58,237,0.5); }
  .filter-pill:not(.active) { background:rgba(255,255,255,0.04); color:#94A3B8; }
  .filter-pill:not(.active):hover { background:rgba(124,58,237,0.12); color:#A78BFA; }

  .status-badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:5px 12px; border-radius:50px; font-family:'Space Grotesk',sans-serif; text-transform:capitalize; flex-shrink:0; }

  .skill-box { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:14px 16px; }

  .ex-input, .ex-textarea {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px;
    padding:12px 16px; color:#F8FAFC; font-size:14px; outline:none; transition:all 0.2s ease; font-family:'Inter',sans-serif;
  }
  .ex-input:focus, .ex-textarea:focus { border-color:rgba(124,58,237,0.6); box-shadow:0 0 0 3px rgba(124,58,237,0.12); background:rgba(124,58,237,0.05); }
  .ex-textarea { resize:none; }
  .ex-label { font-size:12px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; font-family:'Space Grotesk',sans-serif; }

  .star-btn { font-size:30px; background:none; border:none; cursor:pointer; transition:transform 0.15s ease; filter:grayscale(1) opacity(0.3); }
  .star-btn.filled { filter:none; opacity:1; }
  .star-btn:hover { transform:scale(1.15); }

  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const STATUS_STYLE = {
  pending:   { bg: 'rgba(245,158,11,0.16)', border: 'rgba(245,158,11,0.4)', text: '#FCD34D' },
  accepted:  { bg: 'rgba(16,185,129,0.16)', border: 'rgba(16,185,129,0.4)', text: '#34D399' },
  rejected:  { bg: 'rgba(239,68,68,0.16)', border: 'rgba(239,68,68,0.4)', text: '#F87171' },
  cancelled: { bg: 'rgba(100,116,139,0.16)', border: 'rgba(100,116,139,0.4)', text: '#94A3B8' },
  completed: { bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.45)', text: '#A78BFA' },
  expired:   { bg: 'rgba(100,116,139,0.16)', border: 'rgba(100,116,139,0.4)', text: '#94A3B8' },
};

const STATUS_ICONS = {
  pending: <Clock size={12} />,
  accepted: <CheckCircle size={12} />,
  rejected: <XCircle size={12} />,
  cancelled: <XCircle size={12} />,
  completed: <Star size={12} />,
  expired: <XCircle size={12} />,
};

const ExchangeCard = ({ exchange, currentUserId, onAccept, onReject, onComplete, onCancel, onReview, index }) => {
  const isSender = exchange.sender?._id === currentUserId;
  const other = isSender ? exchange.receiver : exchange.sender;
  const st = STATUS_STYLE[exchange.status] || STATUS_STYLE.cancelled;

  return (
    <div className="glass glass-hover" style={{ padding: 22, animation: `fadeInUp 0.5s ${Math.min(index, 8) * 0.05}s ease both` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {other?.avatar
            ? <img src={other.avatar} alt={other.name} style={{ width: 46, height: 46, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>{other?.name?.[0]}</div>
          }
          <div>
            <Link to={"/profile/" + other?._id} style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#F1F5F9', textDecoration: 'none' }}>{other?.name}</Link>
            <p style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{isSender ? 'You sent this request' : 'Sent you a request'}</p>
          </div>
        </div>
        <span className="status-badge" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.text }}>
          {STATUS_ICONS[exchange.status]}{exchange.status}
        </span>
      </div>

      <div className="skill-box" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: '#475569', marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Offering</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#34D399' }}>{exchange.skillOffered?.name}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#475569', marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Wants</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#22D3EE' }}>{exchange.skillWanted?.name}</p>
          </div>
        </div>
        {exchange.message && (
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', fontStyle: 'italic' }}>
            "{exchange.message}"
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {exchange.status === 'pending' && !isSender && (
          <>
            <button onClick={() => onAccept(exchange._id)} className="neon-btn-sm" style={{ flex: 1, justifyContent: 'center' }}><CheckCircle size={13} />Accept</button>
            <button onClick={() => onReject(exchange._id)} className="danger-btn-sm" style={{ flex: 1 }}><XCircle size={13} />Decline</button>
          </>
        )}
        {exchange.status === 'pending' && isSender && (
          <button onClick={() => onCancel(exchange._id)} className="danger-btn-sm">Cancel Request</button>
        )}
        {exchange.status === 'accepted' && (
          <>
            {exchange.conversationId && (
              <Link to={"/chat/" + exchange.conversationId} className="secondary-btn-sm" style={{ flex: 1 }}><MessageSquare size={13} />Chat</Link>
            )}
            <button onClick={() => onComplete(exchange._id)} className="neon-btn-sm" style={{ flex: 1, justifyContent: 'center' }}><CheckCircle size={13} />Mark Complete</button>
          </>
        )}
        {exchange.status === 'completed' && (
          <>
            {isSender && !exchange.senderReviewed && (
              <button onClick={() => onReview(exchange)} className="neon-btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Star size={13} />Leave Review</button>
            )}
            {!isSender && !exchange.receiverReviewed && (
              <button onClick={() => onReview(exchange)} className="neon-btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Star size={13} />Leave Review</button>
            )}
          </>
        )}
        <Link to={"/profile/" + other?._id} className="ghost-btn-sm">View Profile</Link>
      </div>
    </div>
  );
};

const Exchanges = () => {
  const { user } = useSelector(s => s.auth);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchExchanges = () => {
    const params = statusFilter ? '?status=' + statusFilter : '';
    api.get('/exchanges' + params).then(({ data }) => {
      setExchanges(data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchExchanges(); }, [statusFilter]);

  const handleAccept = async (id) => {
    try {
      await api.put('/exchanges/' + id + '/accept');
      toast.success('Exchange accepted! You can now chat.');
      fetchExchanges();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    try {
      await api.put('/exchanges/' + id + '/reject');
      toast.success('Request declined');
      fetchExchanges();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleComplete = async (id) => {
    try {
      await api.put('/exchanges/' + id + '/complete');
      toast.success('Exchange completed! 🎉');
      fetchExchanges();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.put('/exchanges/' + id + '/cancel');
      toast.success('Request cancelled');
      fetchExchanges();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        exchangeRequestId: reviewModal._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted!');
      setReviewModal(null);
      fetchExchanges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  const statuses = ['', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'];

  if (loading) return <PageLoader />;

  return (
    <>
      <style>{STYLES}</style>
      <div className="ex-page">
        {/* BG orbs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.16) 0%,transparent 70%)', animation: 'orb1 16s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'orb2 19s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14, animation: 'fadeInUp 0.5s ease both' }}>
            <div>
              <div className="section-tag" style={{ marginBottom: 12 }}><Handshake size={12} /> Exchanges</div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#F8FAFC,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                My Exchanges
              </h1>
              <p style={{ color: '#64748B', fontSize: 14, marginTop: 6 }}>{exchanges.length} exchange{exchanges.length !== 1 ? 's' : ''}</p>
            </div>
            <Link to="/skills" className="neon-btn-sm">Find New Exchanges</Link>
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 26, overflowX: 'auto', paddingBottom: 4, animation: 'fadeInUp 0.5s 0.05s ease both' }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`filter-pill ${statusFilter === s ? 'active' : ''}`}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>

          {exchanges.length === 0 ? (
            <div className="glass" style={{ textAlign: 'center', padding: '64px 24px', animation: 'fadeInUp 0.5s 0.1s ease both' }}>
              <div style={{ fontSize: 56, marginBottom: 16, display: 'inline-block', animation: 'handshakeFloat 3s ease-in-out infinite' }}>🤝</div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>No exchanges yet</h3>
              <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Start by browsing skills and sending exchange requests</p>
              <Link to="/skills" className="neon-btn-sm" style={{ padding: '12px 26px' }}>Browse Skills</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 18 }}>
              {exchanges.map((ex, i) => (
                <ExchangeCard key={ex._id} exchange={ex} currentUserId={user?._id} index={i}
                  onAccept={handleAccept} onReject={handleReject}
                  onComplete={handleComplete} onCancel={handleCancel}
                  onReview={setReviewModal} />
              ))}
            </div>
          )}

          {/* Review Modal */}
          <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review">
            <form onSubmit={handleSubmitReview} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, background: '#020010' }}>
              <div>
                <label className="ex-label">Rating</label>
                <div style={{ display: 'flex', gap: 6, animation: 'popIn 0.3s ease both' }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <button type="button" key={r} onClick={() => setReviewForm(f => ({ ...f, rating: r }))} className={`star-btn ${r <= reviewForm.rating ? 'filled' : ''}`}>
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="ex-label">Your Review</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4} placeholder="Share your experience with this skill exchange..." className="ex-textarea" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setReviewModal(null)} className="ghost-btn-sm" style={{ flex: 1, padding: '12px 18px' }}>Cancel</button>
                <button type="submit" disabled={submittingReview} className="neon-btn-sm" style={{ flex: 1, padding: '12px 18px', justifyContent: 'center' }}>
                  {submittingReview ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Submit Review ⭐'}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default Exchanges;