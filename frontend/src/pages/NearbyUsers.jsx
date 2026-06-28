import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Sliders, Star, Users, Map as MapIcon, List } from 'lucide-react';
import api from '../api/axios.js';
import { PageLoader } from '../components/common/Loader.jsx';
import toast from 'react-hot-toast';

const DEFAULT_CENTER = { lat: 26.9124, lng: 75.7873 }; // Jaipur

/* Dark mode style array for Google Maps to match the app theme */
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e1b3a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161430' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#7C3AED' }, { weight: 0.3 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06141f' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#020010' }] },
];

/* ─── Shared Styles ─────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .nu-page { background:#020010; height:calc(100vh - 64px); display:flex; flex-direction:column; font-family:'Inter',sans-serif; color:#F8FAFC; overflow:hidden; }

  @keyframes fadeInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse {
    0%,100%{box-shadow:0 0 16px rgba(124,58,237,0.35)}
    50%{box-shadow:0 0 32px rgba(124,58,237,0.7)}
  }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes onlinePulse {
    0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.6)}
    50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}
  }
  @keyframes radarPing {
    0%{transform:scale(0.3);opacity:0.8}
    100%{transform:scale(2.2);opacity:0}
  }

  .nu-glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); backdrop-filter:blur(20px); }

  .nu-header {
    padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.08);
    display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; flex-shrink:0;
    background:rgba(255,255,255,0.025);
  }

  .nu-toggle-btn {
    display:inline-flex; align-items:center; gap:6px; border-radius:50px; padding:9px 16px; font-weight:700;
    font-size:12px; cursor:pointer; font-family:'Space Grotesk',sans-serif; border:1px solid rgba(255,255,255,0.1);
    transition:all 0.2s ease;
  }
  .nu-toggle-btn.primary { background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; border-color:transparent; box-shadow:0 0 18px rgba(124,58,237,0.45); }
  .nu-toggle-btn.secondary { background:rgba(255,255,255,0.04); color:#94A3B8; }
  .nu-toggle-btn.secondary:hover { background:rgba(124,58,237,0.14); color:#A78BFA; border-color:rgba(124,58,237,0.35); }

  .nu-slider { width:110px; accent-color:#7C3AED; cursor:pointer; }

  .nu-map-wrap { flex:1; position:relative; background:#0a0a1a; }
  .nu-map-wrap .gm-style { background:#0a0a1a !important; }

  .nu-locate-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:10; background:rgba(2,0,16,0.85); backdrop-filter:blur(6px); }
  .nu-pulse-loader { position:absolute; top:16px; left:50%; transform:translateX(-50%); z-index:5; display:flex; align-items:center; gap:8px; padding:10px 18px; border-radius:50px; font-size:13px; color:#CBD5E1; }

  .nu-panel { overflow-y:auto; background:rgba(255,255,255,0.025); flex-shrink:0; }
  .nu-panel::-webkit-scrollbar { width:6px; }
  .nu-panel::-webkit-scrollbar-thumb { background:rgba(124,58,237,0.3); border-radius:10px; }

  .nu-user-row {
    padding:16px 20px; cursor:pointer; transition:background 0.2s ease; border-bottom:1px solid rgba(255,255,255,0.05);
  }
  .nu-user-row:hover { background:rgba(124,58,237,0.08); }
  .nu-user-row.active { background:rgba(124,58,237,0.14); }

  .nu-skill-pill { font-size:10px; font-weight:700; padding:3px 10px; border-radius:50px; background:rgba(124,58,237,0.18); border:1px solid rgba(124,58,237,0.35); color:#A78BFA; font-family:'Space Grotesk',sans-serif; }
  .nu-skill-pill.more { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); color:#64748B; }

  .nu-online-dot { position:absolute; bottom:-1px; right:-1px; width:11px; height:11px; border-radius:50%; background:#10B981; border:2px solid #020010; animation:onlinePulse 2s infinite; }

  .nu-action-btn-primary {
    flex:1; text-align:center; padding:8px; border-radius:50px; font-size:12px; font-weight:700;
    background:linear-gradient(135deg,#7C3AED,#06B6D4); color:#fff; text-decoration:none; font-family:'Space Grotesk',sans-serif;
    box-shadow:0 0 14px rgba(124,58,237,0.4); transition:all 0.2s ease;
  }
  .nu-action-btn-primary:hover { box-shadow:0 0 22px rgba(124,58,237,0.6); }
  .nu-action-btn-secondary {
    flex:1; text-align:center; padding:8px; border-radius:50px; font-size:12px; font-weight:700;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:#A78BFA; text-decoration:none;
    font-family:'Space Grotesk',sans-serif; transition:all 0.2s ease;
  }
  .nu-action-btn-secondary:hover { background:rgba(124,58,237,0.15); }

  .nu-radar-dot { position:relative; width:14px; height:14px; border-radius:50%; background:#7C3AED; box-shadow:0 0 10px #7C3AED; }
  .nu-radar-dot::before { content:''; position:absolute; inset:0; border-radius:50%; background:#7C3AED; animation:radarPing 2s ease-out infinite; }

  @media (max-width:768px) { .nu-side-panel { display:none !important; } .nu-side-panel.list-active { display:flex !important; flex:1 !important; width:100% !important; } }
  @media (prefers-reduced-motion:reduce) { *,*::before,*::after{animation-duration:0.01ms !important} }
`;

const NearbyUsers = () => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance] = useState(25);
  const [selectedUser, setSelectedUser] = useState(null);
  const [listView, setListView] = useState(false);

  // Load Google Maps
  useEffect(() => {
    const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!GMAPS_KEY) {
      console.warn('Google Maps API key not set. Using fallback list view.');
      setMapLoaded(false);
      setListView(true);
      return;
    }

    if (window.google?.maps) { setMapLoaded(true); return; }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => { console.warn('Maps load failed'); setListView(true); };
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) return;
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      backgroundColor: '#0a0a1a',
    });
    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [mapLoaded]);

  // Get user location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationGranted(true);
        if (googleMapRef.current) {
          googleMapRef.current.setCenter(loc);
          googleMapRef.current.setZoom(14);
          // Add user marker
          new window.google.maps.Marker({
            map: googleMapRef.current,
            position: loc,
            title: 'You are here',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#7C3AED',
              fillOpacity: 1,
              strokeColor: '#06B6D4',
              strokeWeight: 3,
            },
          });
        }
        fetchNearby(loc.lat, loc.lng);
      },
      () => { toast.error('Location access denied'); setLoading(false); }
    );
  }, [maxDistance]);

  useEffect(() => {
    requestLocation();
  }, []);

  const fetchNearby = async (lat, lng) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/nearby?latitude=${lat}&longitude=${lng}&maxDistance=${maxDistance}&limit=30`);
      setUsers(data.data.users || []);
      placeMarkers(data.data.users || [], lat, lng);
    } catch (err) {
      toast.error('Failed to fetch nearby users');
    } finally {
      setLoading(false);
    }
  };

  const placeMarkers = (nearbyUsers, myLat, myLng) => {
    if (!googleMapRef.current || !window.google) return;
    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    nearbyUsers.forEach(u => {
      if (!u.location?.coordinates?.[1]) return;
      const lat = u.location.coordinates[1];
      const lng = u.location.coordinates[0];

      const marker = new window.google.maps.Marker({
        map: googleMapRef.current,
        position: { lat, lng },
        title: u.name,
        icon: {
          url: u.avatar || '',
          scaledSize: u.avatar ? new window.google.maps.Size(40, 40) : undefined,
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(20, 20),
        },
        label: u.avatar ? undefined : {
          text: u.name[0],
          color: '#fff',
          fontWeight: 'bold',
        },
      });

      marker.addListener('click', () => {
        setSelectedUser(u);
        const content = `
          <div style="padding:10px;max-width:200px;font-family:'Space Grotesk',sans-serif;background:#0A0A1A;border-radius:8px;">
            <p style="font-weight:700;color:#F1F5F9;margin:0 0 4px">${u.name}</p>
            <p style="font-size:12px;color:#94A3B8;margin:0 0 6px">${u.skillsOffered?.slice(0,2).map(s=>s.name).join(', ') || 'No skills listed'}</p>
            <a href="/profile/${u._id}" style="color:#A78BFA;font-size:12px;font-weight:600;text-decoration:none">View Profile →</a>
          </div>`;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const handleDistanceChange = (newDist) => {
    setMaxDistance(newDist);
    if (userLocation) fetchNearby(userLocation.lat, userLocation.lng);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="nu-page">

        {/* Header */}
        <div className="nu-header" style={{ animation: 'fadeInUp 0.4s ease both' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={19} color="#A78BFA" /> Nearby Users
            </h1>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{users.length} people within {maxDistance}km</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'none' }} className="nu-distance-desktop" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={14} color="#475569" />
              <span style={{ fontSize: 12, color: '#94A3B8', width: 42, fontFamily: "'JetBrains Mono',monospace" }}>{maxDistance}km</span>
              <input
                type="range" min="5" max="100" step="5" value={maxDistance}
                onChange={e => handleDistanceChange(parseInt(e.target.value))}
                className="nu-slider"
              />
            </div>
            <button onClick={() => setListView(v => !v)} className={`nu-toggle-btn ${listView ? 'primary' : 'secondary'}`}>
              {listView ? <MapIcon size={13} /> : <List size={13} />} {listView ? 'Map' : 'List'}
            </button>
            <button onClick={requestLocation} className="nu-toggle-btn secondary">
              <Navigation size={13} /> Re-center
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Map */}
          {!listView && (
            <div className="nu-map-wrap">
              {!locationGranted && !loading && (
                <div className="nu-locate-overlay">
                  <div className="nu-glass" style={{ borderRadius: 20, padding: '36px 30px', textAlign: 'center', maxWidth: 340, animation: 'fadeInUp 0.4s ease both' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'glowPulse 3s infinite' }}>
                      <MapPin size={28} color="#A78BFA" />
                    </div>
                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#F1F5F9', marginBottom: 8 }}>Location Access Required</h3>
                    <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>Share your location to see people nearby</p>
                    <button onClick={requestLocation} className="nu-toggle-btn primary" style={{ padding: '10px 24px' }}>Enable Location</button>
                  </div>
                </div>
              )}
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
              {loading && (
                <div className="nu-glass nu-pulse-loader">
                  <div className="nu-radar-dot" />
                  Finding people nearby...
                </div>
              )}
            </div>
          )}

          {/* Side Panel / List View */}
          <div
            className={`nu-panel nu-side-panel ${listView ? 'list-active' : ''}`}
            style={{
              width: listView ? '100%' : 320,
              flex: listView ? 1 : 'none',
              borderLeft: listView ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {loading && listView ? (
              <PageLoader />
            ) : users.length === 0 && !loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
                <Users size={36} color="#334155" style={{ marginBottom: 14 }} />
                <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>No users found nearby</p>
                <p style={{ fontSize: 12, color: '#475569' }}>Try increasing the search radius</p>
                <div style={{ marginTop: 18 }}>
                  <input
                    type="range" min="5" max="100" step="5" value={maxDistance}
                    onChange={e => handleDistanceChange(parseInt(e.target.value))}
                    className="nu-slider" style={{ width: 160 }}
                  />
                  <p style={{ fontSize: 11, color: '#475569', marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>{maxDistance}km radius</p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, color: '#A78BFA' }}>{users.length} people nearby</p>
                </div>
                <div>
                  {users.map((u, i) => (
                    <div
                      key={u._id}
                      className={`nu-user-row ${selectedUser?._id === u._id ? 'active' : ''}`}
                      onClick={() => setSelectedUser(u)}
                      style={{ animation: `fadeInUp 0.3s ${Math.min(i, 10) * 0.03}s ease both` }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          {u.avatar
                            ? <img src={u.avatar} alt={u.name} style={{ width: 46, height: 46, borderRadius: 14, objectFit: 'cover' }} />
                            : <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, boxShadow: '0 0 14px rgba(124,58,237,0.4)' }}>{u.name?.[0]}</div>
                          }
                          {u.isOnline && <span className="nu-online-dot" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{u.name}</p>
                            {u.averageRating > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FCD34D', fontSize: 11, flexShrink: 0 }}>
                                <Star size={11} fill="currentColor" />{u.averageRating}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
                            {u.location?.city && `📍 ${u.location.city} · `}
                            {u.experienceLevel}
                          </p>
                          {u.skillsOffered?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                              {u.skillsOffered.slice(0, 3).map(s => (
                                <span key={s._id} className="nu-skill-pill">{s.name}</span>
                              ))}
                              {u.skillsOffered.length > 3 && (
                                <span className="nu-skill-pill more">+{u.skillsOffered.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedUser?._id === u._id && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'fadeInUp 0.25s ease both' }}>
                          <Link to={"/profile/" + u._id} className="nu-action-btn-secondary">View Profile</Link>
                          <Link to={"/chat"} className="nu-action-btn-primary">Message</Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NearbyUsers;