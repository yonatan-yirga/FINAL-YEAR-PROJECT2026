/**
 * Dashboards
 * Split-layout: main content (left) + live sidebar (right)
 * Airy, system-grade
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import useAuth from '../hooks/useAuth';
import applicationService  from '../services/applicationService';
import internshipService   from '../services/internshipService';
import advisorService      from '../services/advisorService';
import departmentService   from '../services/departmentService';
import notificationService from '../services/notificationService';
import reportService       from '../services/reportService';
import { API_URL } from '../services/api';
import { 
  ClipboardList, Clock, CheckCircle, XCircle, Search, FileText, 
  GraduationCap, MessageSquare, User, Trophy, Award, Link2, 
  Building2, FileCheck, Target, Shield, Users, UserCheck, UserCircle,
  BarChart3, TrendingUp, Calendar, Video, Lock, Eye,
  Briefcase, Send, Edit, Trash2, Plus, Settings, Home
} from 'lucide-react';

const BACKEND_URL = API_URL.replace('/api', '');

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const cleanBackend = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  return `${cleanBackend}${cleanUrl}`;
};

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
export const T = {
  navy:   '#2D3142',  // Gunmetal (was navy)
  navyD:  '#1f2230',  // Darker Gunmetal
  gold:   '#ADACB5',  // French Gray (was gold)
  bg:     '#D8D5DB',  // Platinum
  white:  '#FFFFFF',
  card:   '#FFFFFF',
  border: '#ADACB5',  // French Gray
  muted:  '#8B8A94',  // Darker French Gray
  text:   '#2D3142',  // Gunmetal
  green:  '#15803D',
  greenL: '#DCFCE7',
  amber:  '#B45309',
  amberL: '#FEF3C7',
  red:    '#B91C1C',
  redL:   '#FEE2E2',
  blue:   '#2D3142',  // Gunmetal
  blueL:  '#D8D5DB',  // Platinum
  glass:  'rgba(255, 255, 255, 0.7)',
  glassH: 'rgba(255, 255, 255, 0.9)',
};

/* ─── Global style injection ─────────────────────────────────────────────── */
export const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  
  @keyframes pathGlow { 0% { opacity: 0.4; } 50% { opacity: 1; filter: brightness(1.2); } 100% { opacity: 0.4; } }
  @keyframes nodePulse { 0% { box-shadow: 0 0 0 0 rgba(15, 45, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(15, 45, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(15, 45, 94, 0); } }
  @keyframes cardEnter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes glint { from { left: -100%; } to { left: 200%; } }

  .db-root * { font-family:var(--font-main); box-sizing:border-box; }
  .db-root { background:var(--bg-root); min-height:100vh; transition:var(--transition); color:var(--text-main); animation: cardEnter 0.6s ease-out; }
  
  .db-body { display:grid; grid-template-columns:1fr 300px; gap:24px; max-width:1280px; margin:0 auto; padding:28px 32px 48px; }
  @media(max-width:1024px){ .db-body{ grid-template-columns:1fr; } .db-sidebar{ order:-1; display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; } }
  
  .db-section-title { font-size:11px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--text-muted); margin:24px 0 14px; }
  /* Smaller Cards */
  .db-card { background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; overflow:hidden; box-shadow: var(--shadow-md); transition: var(--transition); }
  
  /* Smaller Intelligence Stat Cards */
  .db-stat { background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; cursor:default; transition:var(--transition); box-shadow:var(--shadow-md); position:relative; overflow:hidden; }
  .db-stat:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); }
  .db-stat-bg-icon { position:absolute; right:-5px; bottom:-5px; font-size:60px; opacity:0.04; transform:rotate(-15deg); pointer-events:none; transition: var(--transition); }
  .db-stat:hover .db-stat-bg-icon { transform: rotate(0) scale(1.1); opacity: 0.08; }
  .db-stat-val { font-family:var(--font-mono); font-size:28px; font-weight:700; color:var(--text-bright); line-height:1; letter-spacing:-1px; }

  /* Smaller Command Modules */
  .db-nav { background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; cursor:pointer; text-align:left; width:100%; transition:var(--transition); position:relative; overflow:hidden; box-shadow: var(--shadow-sm); }
  .db-nav:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); border-color: var(--accent-navy); }
  .db-nav::after { content:''; position:absolute; top:0; left:-100%; width:50%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); transform: skewX(-20deg); pointer-events:none; }
  .db-nav:hover::after { animation: glint 0.8s ease-out; }
  
  .db-row { display:flex; align-items:center; justify-content:space-between; padding:13px 18px; border-bottom:1px solid var(--border-subtle); transition: var(--transition); }
  .db-row:hover { background: rgba(0,0,0,0.02); }
  
  /* Welcome Center */
  .db-welcome { background: linear-gradient(135deg, var(--accent-navy) 0%, #1f2230 180%); border-radius:16px; padding:28px; margin-bottom:24px; position:relative; overflow:hidden; color:#fff; box-shadow:var(--shadow-md); }
  .db-welcome::before { content:''; position:absolute; right:-20px; top:-20px; width:180px; height:180px; border-radius:50%; background:rgba(173,172,181,0.15); filter:blur(50px); }

  /* Journey Path */
  .journey-container { background: var(--bg-glass); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 28px 24px; position: relative; overflow: hidden; }
  .journey-path-track { position: absolute; top: 56px; left: 60px; right: 60px; height: 3px; background: var(--border-subtle); z-index: 0; border-radius: 4px; }
  .journey-path-fill { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, var(--accent-navy), var(--text-muted)); border-radius: 4px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 12px var(--accent-navy); animation: pathGlow 2s infinite; }
  
  .journey-step { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; width:20%; transition: var(--transition); }
  .step-node { width:36px; height:36px; border-radius:50%; background:var(--bg-surface); border:2px solid var(--border-subtle); color:var(--text-muted); display:flex; align-items:center; justify-content:center; font-size:16px; transition:var(--transition); z-index:2; }
  .step-active .step-node { transform: scale(1.1); border-color: var(--accent-navy); background: var(--accent-navy); color: #fff; animation: nodePulse 1.8s infinite; }
  .step-done .step-node { background: var(--status-success); border-color: var(--status-success); color: #fff; }
  .step-label { font-size:11px; font-weight:700; color:var(--text-muted); margin-top:12px; text-transform:uppercase; letter-spacing:0.8px; transition: var(--transition); }
  .step-active .step-label { color: var(--accent-navy); font-weight: 800; }
  
  /* Sidebar Timeline */
  .timeline-container { position: relative; padding-left: 20px; }
  .timeline-container::before { content: ''; position: absolute; left: 7px; top: 10px; bottom: 10px; width: 2px; background: var(--border-subtle); }
  .timeline-item { position: relative; margin-bottom: 24px; padding-left: 20px; }
  .timeline-dot { position: absolute; left: -18px; top: 6px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg-surface); background: var(--text-muted); transition: var(--transition); }
  .timeline-bubble { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 12px 14px; box-shadow: var(--shadow-sm); transition: var(--transition); }
  .timeline-bubble:hover { border-color: var(--accent-navy); transform: translateX(4px); box-shadow: var(--shadow-md); }
  .timeline-active .timeline-dot { background: var(--accent-navy); box-shadow: 0 0 0 3px rgba(15,45,94,0.15); }
  .timeline-active .timeline-bubble { border-left: 3px solid var(--accent-navy); }
`;

/* ─── Shared components ───────────────────────────────────────────────────── */
export const Skel = ({ h = 96, cols = 1 }) => (
  <>
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i} className="db-skel" style={{ height: h }} />
    ))}
  </>
);

export const StatCard = ({ label, value, accent, sub, onClick, icon }) => {
  // Check if icon is a React component or string
  const isIconComponent = typeof icon === 'function' || (icon && icon.$$typeof);
  
  return (
    <div
      className={`db-stat${onClick ? ' db-stat-clickable' : ''}`}
      style={{ borderTop: `4px solid ${accent || 'var(--accent-navy)'}` }}
      onClick={onClick}
    >
      {icon && (
        <div className="db-stat-bg-icon">
          {isIconComponent ? React.createElement(icon, { size: 80, strokeWidth: 1.5 }) : icon}
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
        <div className="db-stat-val">{value ?? '—'}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>}
        {onClick && <div style={{ fontSize: 11, fontWeight: 600, color: accent || 'var(--accent-navy)', marginTop: 12, letterSpacing: .3 }}>View details →</div>}
      </div>
    </div>
  );
};

export const NavCard = ({ icon, label, sub, onClick, primary, warn }) => {
  // Check if icon is a React component or string
  const isIconComponent = typeof icon === 'function' || (icon && icon.$$typeof);
  
  return (
    <button
      className={`db-nav${primary ? ' db-nav-primary' : ''}${warn ? ' db-nav-warn' : ''}`}
      style={!primary ? { borderLeft: `3px solid var(--border-subtle)` } : { background: 'linear-gradient(135deg, var(--accent-navy) 0%, #1f2230 200%)' }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 20, background: primary ? 'rgba(255,255,255,0.1)' : 'var(--bg-root)', padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isIconComponent ? React.createElement(icon, { size: 20, strokeWidth: 2 }) : icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: primary ? '#fff' : 'var(--text-bright)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 10, color: primary ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', lineHeight: 1.4 }}>{sub}</div>
        </div>
      </div>
    </button>
  );
};

export const Badge = ({ label, color, bg }) => (
  <span style={{ 
    background: bg, 
    color, 
    padding: '4px 12px', 
    borderRadius: '12px', 
    fontSize: '12px', 
    fontWeight: '600',
    display: 'inline-block',
    whiteSpace: 'nowrap'
  }}>{label}</span>
);

const statusMap = {
  PENDING:  { label: 'Pending',  color: '#b45309', bg: '#fef3c7' },
  ACCEPTED: { label: 'Accepted', color: '#14a800', bg: '#e8f5e9' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee' },
  OPEN:     { label: 'Open',     color: '#14a800', bg: '#e8f5e9' },
  CLOSED:   { label: 'Closed',   color: '#6b7177', bg: '#f0f0f0' },
};
export const Pill = ({ s }) => {
  const m = statusMap[s] || { label: s, color: '#6b7177', bg: '#f0f0f0' };
  return <Badge label={m.label} color={m.color} bg={m.bg} />;
};

/* ─── Notification sidebar section ───────────────────────────────────────── */
export const NotifSidebar = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getRecentNotifications().then(r => {
      if (r.success) setNotifs(r.data?.slice(0, 5) || []);
      setLoading(false);
    });
  }, []);

  const typeColors = {
    INFO:    'var(--accent-navy)',
    SUCCESS: 'var(--status-success)',
    WARNING: 'var(--status-warning)',
    ERROR:   'var(--status-error)',
  };

  return (
    <div className="db-sb-section">
      <div className="db-sb-head">Recent Activity</div>
      <div style={{ padding: '24px 18px' }}>
        {loading
          ? <Skel h={60} cols={3} />
          : notifs.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>No activity recorded yet</div>
            : (
              <div className="timeline-container">
                {notifs.map((n, i) => (
                  <div key={n.id} className={`timeline-item ${!n.is_read ? 'timeline-active' : ''}`} onClick={() => navigate(n.link || '/notifications')} style={{ cursor: 'pointer' }}>
                    <div className="timeline-dot" style={{ background: typeColors[n.notification_type] || 'var(--text-muted)' }} />
                    <div className="timeline-bubble">
                      <div style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: 'var(--text-bright)', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{n.time_ago || 'just now'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
        }
      </div>
      <div style={{ padding: '0 18px 18px' }}>
        <button 
          onClick={() => navigate('/notifications')} 
          style={{ width: '100%', padding: '10px', background: 'var(--bg-root)', color: 'var(--accent-navy)', border: '1px solid var(--border-subtle)', borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'var(--transition)' }}
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
};

/* ─── Welcome banner ──────────────────────────────────────────────────────── */
export const WelcomeBanner = ({ name, role, tagline, avatar, headline }) => (
  <div className="db-welcome">
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
      {avatar && (
        <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', overflow: 'hidden', flexShrink: 0 }}>
          <img src={getMediaUrl(avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>{role} Dashboard</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Welcome back, {(name || 'User').split(' ')[0]}!</div>
        {headline && <div style={{ fontSize: 14, color: '#ADACB5', fontWeight: 600, marginBottom: 6 }}>{headline}</div>}
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', maxWidth: 500, lineHeight: 1.5 }}>{tagline}</div>
      </div>
    </div>
  </div>
);

/* ─── Journey Stepper ────────────────────────────────────────────────────── */
const InternshipJourney = ({ status = 'PROFILE_READY' }) => {
  const steps = [
    { key: 'PROFILE_READY', label: 'Profile', icon: 'user-circle' },
    { key: 'APPLYING',     label: 'Apply',   icon: 'search' },
    { key: 'INTERNING',    label: 'Active',  icon: 'briefcase' },
    { key: 'REPORTING',    label: 'Reports', icon: 'file-text' },
    { key: 'CERTIFIED',    label: 'Finish',  icon: 'trophy' },
  ];

  const getStatusIndex = (s) => {
    const map = {
      'PROFILE_READY': 0, 'APPLYING': 1, 'INTERNING': 2, 'REPORTING': 3, 'CERTIFIED': 4
    };
    return map[s] || 0;
  };

  const currentIndex = getStatusIndex(status);
  const progressPercent = (currentIndex / (steps.length - 1)) * 100;

  // Icon components mapping
  const iconComponents = {
    'user-circle': UserCircle,
    'search': Search,
    'briefcase': Briefcase,
    'file-text': FileText,
    'trophy': Trophy,
  };

  return (
    <div className="journey-container">
      <div className="journey-path-track">
        <div 
          className="journey-path-fill" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {steps.map((s, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const IconComponent = iconComponents[s.icon];
          return (
            <div key={s.key} className={`journey-step ${isDone ? 'step-done' : ''} ${isActive ? 'step-active' : ''}`}>
              <div className="step-node">
                {isDone ? <CheckCircle size={18} /> : <IconComponent size={18} />}
              </div>
              <div className="step-label">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   STUDENT DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
export const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apps, setApps]         = useState([]);
  const [counts, setCounts]     = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [reports, setReports]   = useState([]);
  const [journeyStatus, setJourneyStatus] = useState('PROFILE_READY');
  const [activeIntern, setActiveIntern]   = useState(null);
  const [hasCertificate, setHasCertificate] = useState(false);

  useEffect(() => {
    // Import certificate service dynamically
    import('../services/certificateService').then(({ default: certificateService }) => {
      Promise.all([
        applicationService.getMyApplications(),
        advisorService.getMyFeedback(),
        reportService.getStudentPersonalReports(),
        certificateService.getMyCertificate(),
      ]).then(([aRes, fRes, rRes, certRes]) => {
        let currentApps = [];
        if (aRes.success) {
          currentApps = aRes.data?.results || aRes.data || [];
          setCounts({
            total:    aRes.data?.count ?? currentApps.length,
            pending:  currentApps.filter(a => a.status === 'PENDING').length,
            accepted: currentApps.filter(a => a.status === 'ACCEPTED').length,
            rejected: currentApps.filter(a => a.status === 'REJECTED').length,
          });
          setApps(currentApps.slice(0, 6));
        }
        if (fRes.success) setFeedback((fRes.data?.results || fRes.data || []).slice(0, 4));
        if (rRes.success) setReports(rRes.data?.results || rRes.data || []);
        
        // Check if student has a certificate
        const hasCert = certRes.success && certRes.data;
        setHasCertificate(hasCert);
        
        // Determine Journey Status
        const hasAccepted = currentApps.some(a => a.status === 'ACCEPTED');
        const hasApps = currentApps.length > 0;
        
        if (hasCert) {
          // Student has completed and received certificate
          setJourneyStatus('CERTIFIED');
          setActiveIntern(currentApps.find(a => a.status === 'ACCEPTED'));
        }
        else if (hasAccepted) {
          setJourneyStatus('INTERNING');
          setActiveIntern(currentApps.find(a => a.status === 'ACCEPTED'));
        }
        else if (hasApps) setJourneyStatus('APPLYING');
        else setJourneyStatus('PROFILE_READY');
        
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Dashboard" subtitle="Manage your internships and progress" />
      <div className="db-body">

        {/* ── Main column ── */}
        <div>
          <WelcomeBanner
            name={user?.full_name}
            role="Student"
            avatar={user?.avatar}
            headline={user?.headline}
            tagline="Track your journey, manage applications, and excel in your professional internship."
          />

          <div style={{ padding: '0 8px' }}>
            <p className="db-section-title">Your Internship Journey</p>
            <div className="db-glass-card" style={{ marginBottom: 32 }}>
              <InternshipJourney status={journeyStatus} />
            </div>
          </div>

          {/* Certificate Achievement Card */}
          {hasCertificate && (
            <div style={{ padding: '0 8px', marginBottom: 32 }}>
              <div 
                className="db-card" 
                style={{ 
                  padding: 32, 
                  background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/student/certificates')}
              >
                <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120, opacity: 0.1 }}>🏆</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 48 }}>🎓</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                        Congratulations! 🎉
                      </div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                        You have successfully completed your internship and earned your certificate!
                      </div>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: '14px 28px',
                      background: '#fff',
                      color: '#15803D',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/student/certificates');
                    }}
                  >
                    View Certificate →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeIntern && (
            <div style={{ padding: '0 8px', marginBottom: 32 }}>
              <p className="db-section-title">Active Internship Progress</p>
              <div className="db-card" style={{ padding: 24, background: 'linear-gradient(135deg, #fff 0%, #f8faff 100%)' }}>
                {(() => {
                  const durationMonths = parseInt(activeIntern.internship_duration) || 1;
                  const reportsCount   = Array.isArray(reports) ? reports.length : 0;
                  const daysElapsed    = Math.max(0, (Date.now() - new Date(activeIntern.start_date)) / (1000 * 60 * 60 * 24));
                  
                  const isCompleted    = activeIntern.student_internship_status === 'COMPLETED' || reportsCount >= durationMonths;
                  
                  const timeProgress   = Math.round((daysElapsed / (durationMonths * 30)) * 100);
                  const reportProgress = Math.round((reportsCount / durationMonths) * 100);
                  const overallPct     = isCompleted ? 100 : Math.min(100, Math.max(timeProgress, reportProgress));

                  const monthsDone     = isCompleted ? durationMonths : Math.min(durationMonths, Math.max(reportsCount, Math.floor(daysElapsed / 30)));
                  const monthsLeft     = Math.max(0, durationMonths - monthsDone);

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 18, color: T.navy }}>{activeIntern.internship_title}</div>
                          <div style={{ fontSize: 13, color: T.muted }}>{activeIntern.company_name} · {durationMonths} Months</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: T.navy }}>{overallPct}%</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Overall Progress</div>
                        </div>
                      </div>
                      
                      <div style={{ height: 10, background: '#eee', borderRadius: 5, overflow: 'hidden', marginBottom: 16 }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${overallPct}%`, 
                          background: `linear-gradient(90deg, ${T.navy}, ${T.gold})`,
                          borderRadius: 5,
                          transition: 'width 1s ease'
                        }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div style={{ textAlign: 'center', padding: '12px', background: '#f0f4f8', borderRadius: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{monthsDone}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>Months Done</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: '#f0f4f8', borderRadius: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{monthsLeft}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>Months Left</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: '#f0f4f8', borderRadius: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{Math.floor(daysElapsed)}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>Total Days</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Reporting Months Section */}
          {activeIntern && (
            <div style={{ padding: '0 8px', marginBottom: 32 }}>
              <p className="db-section-title">Monthly Reporting Schedule</p>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeIntern.internship_duration}, 1fr)`, gap: 12 }}>
                {[...Array(parseInt(activeIntern.internship_duration) || 3)].map((_, i) => {
                  const monthNum = i + 1;
                  const isSubmitted = reports.some(r => r.report_month === monthNum);
                  return (
                    <div 
                      key={monthNum}
                      style={{ 
                        background: isSubmitted ? 'rgba(21, 128, 61, 0.05)' : '#fff',
                        border: `1px solid ${isSubmitted ? T.green : T.border}`,
                        borderRadius: 16,
                        padding: '16px 12px',
                        textAlign: 'center',
                        transition: 'var(--transition)',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate('/student/reports')}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>Month</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: isSubmitted ? T.green : T.navy, marginBottom: 8 }}>{monthNum}</div>
                      <div style={{ 
                        fontSize: 9, 
                        fontWeight: 700, 
                        background: isSubmitted ? T.green : T.bg, 
                        color: isSubmitted ? '#fff' : T.muted,
                        padding: '3px 8px',
                        borderRadius: 20,
                        display: 'inline-block'
                      }}>
                        {isSubmitted ? 'SUBMITTED' : 'MISSING'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Remove Application Overview section completely */}
          {/* <p className="db-section-title">Application Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {loading ? <Skel cols={4} h={110} /> : <>
              <StatCard label="Total" value={counts?.total}    accent={T.navy}  icon={ClipboardList} />
              <StatCard label="Pending"  value={counts?.pending}  accent={T.amber} icon={Clock} />
              <StatCard label="Accepted" value={counts?.accepted} accent={T.green} icon={CheckCircle} />
              <StatCard label="Rejected" value={counts?.rejected} accent={T.red}   icon={XCircle} />
            </>}
          </div> */}

          {/* Actions */}
          <p className="db-section-title">Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard primary icon={Search} label="Search Internships"  sub="Find opportunities that match your skills"    onClick={() => navigate('/student/search-internships')} />
            <NavCard icon={ClipboardList} label="My Applications"            sub="Track the status of every application you've submitted"     onClick={() => navigate('/student/applications')} />
            <NavCard icon={GraduationCap} label="Active Internship"          sub="View your current internship, reports, and advisor feedback" onClick={() => navigate('/student/active-internship')} />
            <NavCard icon={MessageSquare} label="Messages"                   sub="Chat with your assigned academic advisor"                    onClick={() => navigate('/student/messages')} />
          </div>

          {/* Recent applications */}
          {!loading && apps.length > 0 && (
            <>
              <p className="db-section-title">Recent Applications</p>
              <div className="db-card" style={{ marginBottom: 28, background: '#ffffff', border: '1px solid #e4e5e7', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e4e5e7', background: '#f7f8f9' }}>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</th>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</th>
                        <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apps.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #e4e5e7', transition: 'background 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2d3d', marginBottom: '2px' }}>{a.internship_title || 'Internship'}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '14px', color: '#6b7177' }}>{a.company_name || '—'}</div>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <Pill s={a.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 18px', borderTop: '1px solid #e4e5e7', background: '#f7f8f9' }}>
                  <button onClick={() => navigate('/student/applications')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#14a800', fontSize: '13px', fontWeight: '600', padding: '4px 0' }}>View all applications →</button>
                </div>
              </div>
            </>
          )}

          {/* Recent feedback */}
          {!loading && feedback.length > 0 && (
            <>
              <p className="db-section-title">Advisor Feedback</p>
              <div style={{ display: 'grid', gap: 12 }}>
                {feedback.map((fb, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--accent-navy)', borderRadius: 14, padding: '20px' }}>
                    <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>"{fb.feedback_text}"</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{fb.advisor_name || 'Advisor'} · {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && apps.length === 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: '64px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🛰️</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-bright)', marginBottom: 8, letterSpacing: -0.5 }}>No Recent Activity</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, maxWidth: 300, margin: '0 auto 28px' }}>Your internship journey hasn't started yet. Start your first search below.</div>
              <button onClick={() => navigate('/student/search-internships')} style={{ padding: '14px 32px', background: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>Search Internships</button>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />

          <div className="db-sb-section" style={{ border: 'none', background: 'transparent' }}>
            <div className="db-sb-head" style={{ border: 'none', paddingLeft: 0 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {[
                { icon: '👤', label: 'Profile',            path: '/student/profile' },
                { icon: '💬', label: 'Messages',            path: '/student/messages' },
                { icon: '🎓', label: 'Internship Details', path: '/student/active-internship' },
                { icon: '📋', label: 'Application History', path: '/student/applications' },
                { icon: '🎥', label: 'Start Google Meet',   path: 'https://meet.google.com/new' },
                { icon: '🔒', label: 'Change Password',    path: '/settings/change-password' },
                { icon: '🏅', label: 'Verify Certificates', path: '/verify' },
              ].map(({ icon, label, path }) => (
                <div 
                  key={label} 
                  className="db-row" 
                  style={{ 
                    cursor: 'pointer', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 12, 
                    background: 'var(--bg-surface)',
                    padding: '10px 14px'
                  }} 
                  onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════════════════
   COMPANY DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
export const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts]         = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      internshipService.getMyInternships(),
      applicationService.getCompanyApplications(),
    ]).then(([iRes, aRes]) => {
      const ints = iRes.success ? (iRes.data?.results || iRes.data || []) : [];
      const apps = aRes.success ? (aRes.data?.results || aRes.data || []) : [];
      setCounts({
        total:   ints.length,
        open:    ints.filter(i => i.status === 'OPEN').length,
        closed:  ints.filter(i => i.status === 'CLOSED').length,
        pending: apps.filter(a => a.status === 'PENDING').length,
        total_apps: apps.length,
      });
      setInternships(ints.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Company Dashboard" subtitle="Manage your recruitment and interns" />
      <div className="db-body">

        {/* ── Main column ── */}
        <div>
          <WelcomeBanner
            name={user?.full_name}
            role="Company Admin"
            tagline="Source top talent, manage active internships, and track the progress of your professional cohorts."
          />

          {/* Stats Bar */}
          <p className="db-section-title">Program Statistics</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {loading ? <Skel cols={4} h={110} /> : <>
              <StatCard label="Total Postings"     value={counts?.total}      accent="#14a800" icon={Briefcase} />
              <StatCard label="Open Positions"     value={counts?.open}       accent="#14a800" icon={CheckCircle} />
              <StatCard label="Pending Candidates" value={counts?.pending}    accent="#f59e0b" icon={Clock} />
              <StatCard label="Total Applicants"   value={counts?.total_apps} accent="#6b7177" icon={Users} />
            </>}
          </div>

          {/* Core Modules Grid */}
          <p className="db-section-title">Recruitment</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard primary icon={Plus} label="Post Internship" sub="Create a new internship opportunity for students" onClick={() => navigate('/company/post-internship')} />
            <NavCard icon={ClipboardList} label="Applicants"      sub="Review student applications"       onClick={() => navigate('/company/applications')} />
            <NavCard icon={Briefcase} label="My Internships"   sub="Manage your vacancies and current interns"   onClick={() => navigate('/company/my-internships')} />
          </div>

          <p className="db-section-title">Management</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard icon={FileText} label="Monthly Progress"    sub="Submit performance reports for your interns" onClick={() => navigate('/company/report-submission')} />
            <NavCard icon={Award} label="Final Evaluations"   sub="Complete final assessments for interns"        onClick={() => navigate('/company/submit-final-report')} />
            <NavCard icon={Settings} label="Account Settings"    sub="Update your profile and password"       onClick={() => navigate('/settings/change-password')} />
          </div>

          {/* Recent Postings List */}
          {!loading && internships.length > 0 && (
            <>
              <p className="db-section-title">Active Postings</p>
              <div className="db-card" style={{ marginBottom: 28, background: '#ffffff', border: '1px solid #e4e5e7', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e4e5e7', background: '#f7f8f9' }}>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position</th>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</th>
                        <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7177', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internships.map(int => (
                        <tr key={int.id} style={{ borderBottom: '1px solid #e4e5e7', transition: 'background 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2d3d', marginBottom: '2px' }}>{int.title}</div>
                            <div style={{ fontSize: '12px', color: '#6b7177' }}>{int.location || 'Remote/On-site'}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '14px', color: '#6b7177' }}>{int.duration_months} Months</div>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <Pill s={int.status} />
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <button onClick={() => navigate('/company/applications')} style={{ background: 'transparent', border: '1px solid #e4e5e7', borderRadius: '6px', padding: '6px 10px', color: '#6b7177', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f7f8f9'; e.currentTarget.style.borderColor = '#14a800'; e.currentTarget.style.color = '#14a800'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e4e5e7'; e.currentTarget.style.color = '#6b7177'; }}>
                              <Eye size={16} style={{ verticalAlign: 'middle' }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '12px 18px', borderTop: '1px solid #e4e5e7', background: '#f7f8f9' }}>
                  <button onClick={() => navigate('/company/my-internships')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#14a800', fontSize: '13px', fontWeight: '600', padding: '4px 0' }}>View all postings →</button>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && internships.length === 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #e4e5e7', borderRadius: 12, padding: '64px 32px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: '#f7f8f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={40} color="#6b7177" strokeWidth={1.5} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1f2d3d', marginBottom: 8 }}>No Internships Posted Yet</div>
              <div style={{ fontSize: 14, color: '#6b7177', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.6 }}>Start building your talent pipeline by posting your first internship opportunity.</div>
              <button onClick={() => navigate('/company/post-internship')} style={{ padding: '12px 28px', background: '#14a800', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#108a00'} onMouseLeave={(e) => e.currentTarget.style.background = '#14a800'}>Post Your First Internship</button>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />

          <div className="db-sb-section" style={{ border: 'none', background: 'transparent' }}>
            <div className="db-sb-head" style={{ border: 'none', paddingLeft: 0 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { icon: ClipboardList, label: 'Candidate Review',  path: '/company/applications' },
                { icon: FileText, label: 'Progress Reports',  path: '/company/report-submission' },
                { icon: Award, label: 'Evaluation Center', path: '/company/submit-final-report' },
                { icon: Video, label: 'Start Google Meet',   path: 'https://meet.google.com/new' },
                { icon: Lock, label: 'Change Password',   path: '/settings/change-password' },
              ].map(({ icon: IconComponent, label, path }) => (
                <div 
                  key={label} 
                  className="db-row" 
                  style={{ 
                    cursor: 'pointer', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 12, 
                    background: 'var(--bg-surface)',
                    padding: '12px 14px'
                  }} 
                  onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <IconComponent size={16} strokeWidth={2} color="#6b7177" />
                    <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════════════════
   ADVISOR DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
export const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      advisorService.getStatistics(),
      advisorService.getMyStudents({}),
    ]).then(([sRes, stuRes]) => {
      if (sRes.success)   setStats(sRes.data);
      if (stuRes.success) setStudents((stuRes.data?.results || stuRes.data || []).slice(0, 7));
      setLoading(false);
    });
  }, []);

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Advisor Dashboard" subtitle="Manage and mentor your assigned students" />
      <div className="db-body">

        <div>
          <WelcomeBanner
            name={user?.full_name}
            role="Academic Advisor"
            tagline="Mentor your assigned students, review periodic progress, and provide strategic evaluations for academic success."
          />

          {/* Stats Bar */}
          <p className="db-section-title">Students Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {loading ? <Skel cols={4} h={110} /> : <>
              <StatCard label="Total Cohort"   value={stats?.total_students}     accent={T.navy}  icon="👥" />
              <StatCard label="Active Status"  value={stats?.active_students}    accent={T.green} icon="📊" />
              <StatCard label="Graduated/Comp" value={stats?.completed_students} accent={T.gold}  icon="🏅" />
              <StatCard label="Feedback Given"  value={stats?.total_feedback_given} accent={T.blue}  icon="💬" sub="Academic feedback" />
            </>}
          </div>

          {/* Navigation Modules */}
          <p className="db-section-title">Core Responsibilities</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard primary icon="👥" label="Maintain Student Progress" sub="Monitor your assigned student roster, profiles, and attendance" onClick={() => navigate('/advisor/my-students')} />
            <NavCard icon="📋" label="Review Student Reports" sub="Audit and validate periodic internship logs submitted by students" onClick={() => navigate('/advisor/reports')} />
            <NavCard icon="🏁" label="Submit Student Evaluations" sub="Issue final grade assessments and academic performance reviews" onClick={() => navigate('/advisor/final-reports')} />
            <NavCard icon="💬" label="Active Mentorship" sub="Direct communication channel with your assigned student cohort" onClick={() => navigate('/advisor/messages')} />
          </div>

          <p className="db-section-title">Account & System</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard icon="🔔" label="All Alerts"        sub="View activity history" onClick={() => navigate('/notifications')} />
            <NavCard icon="🔒" label="Security"          sub="Manage access"       onClick={() => navigate('/settings/change-password')} />
            <NavCard icon="🎥" label="Live Session"      sub="Start Meet"          onClick={() => window.open('https://meet.google.com/new', '_blank')} />
          </div>

          {/* Recent Students List */}
          {!loading && students.length > 0 && (
            <>
              <p className="db-section-title">Assigned Cohort Highlights</p>
              <div className="db-card" style={{ marginBottom: 28 }}>
                {students.map((s, i) => (
                  <div key={s.id || i} className="db-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-root)', border: '1px solid var(--border-subtle)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {s.avatar ? (
                          <img src={getMediaUrl(s.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-navy)' }}>{(s.student_name || '?').charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-bright)' }}>{s.student_name || 'Anonymous Student'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.company_name || 'Unassigned Placement'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Pill s={s.is_active !== false ? 'ACCEPTED' : 'CLOSED'} />
                      <button onClick={() => navigate(`/advisor/students/${s.id}`)} style={{ background: 'none', border: 'none', color: 'var(--accent-navy)', fontSize: 16, cursor: 'pointer', padding: 4 }}>👁️</button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px 18px' }}>
                  <button onClick={() => navigate('/advisor/my-students')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-navy)', fontSize: 13, fontWeight: 700 }}>View full list ↗</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />

          <div className="db-sb-section" style={{ border: 'none', background: 'transparent' }}>
            <div className="db-sb-head" style={{ border: 'none', paddingLeft: 0 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { icon: '👥', label: 'Student Roster',   path: '/advisor/my-students' },
                { icon: '💬', label: 'Messages',         path: '/advisor/messages' },
                { icon: '📋', label: 'Audit Reports',    path: '/advisor/reports' },
                { icon: '🏁', label: 'Evaluation Hub',   path: '/advisor/final-reports' },
                { icon: '🎥', label: 'Start Google Meet',   path: 'https://meet.google.com/new' },
                { icon: '🔒', label: 'Change Password',  path: '/settings/change-password' },
              ].map(({ icon, label, path }) => (
                <div 
                  key={label} 
                  className="db-row" 
                  style={{ 
                    cursor: 'pointer', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 12, 
                    background: 'var(--bg-surface)',
                    padding: '12px 14px'
                  }} 
                  onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════════════════
   DEPARTMENT DASHBOARD (named export — DepartmentDashboard.jsx overrides for routing)
══════════════════════════════════════════════════════════════════════════ */
export const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    departmentService.getStatistics().then(r => {
      if (r.success) setStats(r.data);
      else setError(r.error || 'Failed to load statistics.');
      setLoading(false);
    });
  }, []);

  const hasPending = (stats?.pending_assignments || 0) > 0;

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Department Dashboard" subtitle="Manage students, advisors, and companies" />
      <div className="db-body">
        <div>
          <WelcomeBanner 
            name={user?.full_name} 
            role="Department Head"
            tagline="Oversee academic operations, manage advisor workloads, and authenticate student completion credentials." 
          />
          {error && <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 10, padding: '12px 16px', color: '#C53030', fontSize: 13, marginBottom: 20 }}>{error}</div>}
          <p className="db-section-title">Department Stats</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {loading ? <Skel cols={8} h={110} /> : <>
              <StatCard label="Students"           value={stats?.total_students}        accent={T.navy}  icon="👨‍🎓" onClick={() => navigate('/department/students')} />
              <StatCard label="Advisors"           value={stats?.total_advisors}        accent={T.green} icon="👨‍🏫" onClick={() => navigate('/department/advisors')} />
              <StatCard label="Companies"          value={stats?.total_companies}       accent={T.gold}  icon="🏢" onClick={() => navigate('/department/companies')} />
              <StatCard label="Active"             value={stats?.active_internships}    accent={T.navy}  icon="💼" />
              <StatCard label="Pending Docs"       value={stats?.pending_assignments}  accent={hasPending ? T.red : T.green} icon="🔗"
                sub={hasPending ? 'Assignment focus' : 'Fully operational'} onClick={() => navigate('/department/assign-advisor')} />
              <StatCard label="Completed"          value={stats?.completed_internships} accent={T.green} icon="✅" />
              <StatCard label="Placements"         value={stats?.monthly_placements}    accent={T.gold}  icon="📉" sub="Monthly growth" />
              <StatCard label="Success Rate"       value={stats?.completion_rate != null ? `${stats.completion_rate}%` : '—'} accent={T.navy} icon="📈" />
            </>}
          </div>

          <p className="db-section-title">Management</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard primary icon="👥" label="Student Desk"       sub="Monitor and manage department students"     onClick={() => navigate('/department/students')} />
            <NavCard icon="👔" label="Partner Network"     sub="View all registered company stakeholders"     onClick={() => navigate('/department/companies')} />
            <NavCard icon="👨‍🏫" label="Advisor Workspace"   sub="Track workloads and student assignments"      onClick={() => navigate('/department/advisors')} />
            <NavCard icon="🔗" label="Doc Assignment"      warn={hasPending} sub={hasPending ? `${stats?.pending_assignments} Pending actions` : 'No pending tasks'} onClick={() => navigate('/department/assign-advisor')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
            <NavCard icon="📑" label="Progress Reports"   sub="Audit student monthly progress submissions"   onClick={() => navigate('/department/reports')} />
            <NavCard icon="🏅" label="Final Assessment"   sub="Review and approve final internship logs"     onClick={() => navigate('/department/final-reports')} />
            <NavCard icon="📜" label="Credential Center"  sub="Finalize evaluation and issue certificates"   onClick={() => navigate('/department/students-completion')} />
            <NavCard icon="🛡️" label="Security"           sub="Update your profile access credentials"       onClick={() => navigate('/settings/change-password')} />
          </div>
        </div>
        <div className="db-sidebar">
          <NotifSidebar />

          {hasPending && (
            <div className="db-sb-section" style={{ border: 'none', background: 'var(--bg-root)', borderLeft: '4px solid var(--accent-red)' }}>
              <div className="db-sb-head" style={{ color: 'var(--accent-red)', paddingLeft: 18 }}>⚠ System Alert</div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 6 }}>{stats?.pending_assignments} Students Unassigned</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>Academic documentation requires immediate advisor assignment for these interns.</div>
                <button 
                  onClick={() => navigate('/department/assign-advisor')} 
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    background: 'var(--accent-navy)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 10, 
                    fontSize: 12, 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  Resolve Now →
                </button>
              </div>
            </div>
          )}

          <div className="db-sb-section" style={{ border: 'none', background: 'transparent' }}>
            <div className="db-sb-head" style={{ border: 'none', paddingLeft: 0 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { icon: '👥', label: 'Student Directory',   path: '/department/students' },
                { icon: '🔗', label: 'Assignment Desk',   path: '/department/assign-advisor' },
                { icon: '📜', label: 'Certification Hub', path: '/department/students-completion' },
                { icon: '🎥', label: 'Start Google Meet',   path: 'https://meet.google.com/new' },
                { icon: '🔔', label: 'Notifications',     path: '/notifications' },
              ].map(({ icon, label, path }) => (
                <div 
                  key={label} 
                  className="db-row" 
                  style={{ 
                    cursor: 'pointer', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 12, 
                    background: 'var(--bg-surface)',
                    padding: '12px 14px'
                  }} 
                  onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   Transforming into a "System Control Center" with high-end management modules.
══════════════════════════════════════════════════════════════════════════ */
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Admin Dashboard" subtitle="System management and oversight" />
      <div className="db-body">
        
        {/* ── Main column ── */}
        <div>
          <WelcomeBanner 
            name={user?.full_name} 
            role="System Administrator"
            tagline="Manage the system, verify new users, and maintain data integrity." 
          />

          <p className="db-section-title">Core Infrastructure</p>
          <div 
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-subtle)', 
              borderLeft: '4px solid var(--accent-gold)', 
              borderRadius: 16, 
              padding: '28px 32px', 
              marginBottom: 28,
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-bright)', fontSize: 18, marginBottom: 8 }}>Admin Backend</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6 }}>
                  Direct access to low-level database models, advanced user auditing, and system-wide configuration parameters.
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--accent-gold)15', color: 'var(--accent-gold)', borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>ROOT ACCESS</div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <a 
                href={`${BACKEND_URL}/admin/`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  display: 'inline-block', 
                  padding: '12px 28px', 
                  background: 'var(--accent-navy)', 
                  color: '#fff', 
                  borderRadius: 12, 
                  fontSize: 14, 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
              >
                Launch Admin Panel →
              </a>
            </div>
          </div>

          <p className="db-section-title">Management</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard primary icon="👤" label="User Directory"    sub="Comprehensive audit and management of all system users" onClick={() => navigate('/admin/users')} />
            <NavCard icon="📋" label="External Registry" sub="Review and authenticate pending organization requests" onClick={() => window.open(`${BACKEND_URL}/admin/registrations/`, '_blank')} />
            <NavCard icon="🔔" label="System Alerts"    sub="View global notifications and history"  onClick={() => navigate('/notifications')} />
          </div>

          <p className="db-section-title">Security</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
             <NavCard icon="🔒" label="Change Password" sub="Update your administrative password"      onClick={() => navigate('/settings/change-password')} />
             <NavCard icon="📊" label="System Stats"       sub="Monitor platform growth and engagement metrics"    onClick={() => window.open(`${BACKEND_URL}/admin/`, '_blank')} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />
          <div className="db-sb-section" style={{ border: 'none', background: 'transparent' }}>
            <div className="db-sb-head" style={{ border: 'none', paddingLeft: 0 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { icon: '⚙️', label: 'Django Console',  path: `${BACKEND_URL}/admin/` },
                { icon: '👥', label: 'User Hub',       path: '/admin/users' },
                { icon: '📜', label: 'Audit Logs',     path: `${BACKEND_URL}/admin/` },
              ].map(({ icon, label, path }) => (
                <div 
                  key={label} 
                  className="db-row" 
                  style={{ 
                    cursor: 'pointer', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 12, 
                    background: 'var(--bg-surface)',
                    padding: '12px 14px'
                  }} 
                  onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UIL Dashboard is in pages/uil/UILDashboard.jsx