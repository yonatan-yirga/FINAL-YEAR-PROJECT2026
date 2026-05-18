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
import authService         from '../services/authService';
import { API_URL } from '../services/api';
import { 
  ClipboardList, Clock, CheckCircle, XCircle, Search, FileText, 
  GraduationCap, MessageSquare, User, Trophy, Award, Link2, 
  Building2, FileCheck, Target, Shield, Users, UserCheck, UserCircle,
  BarChart3, TrendingUp, Calendar, Video, Lock, Eye,
  Briefcase, Send, Edit, Trash2, Plus, Settings, Home, AlertTriangle,
  Mail, Globe, Phone, MapPin, Save, RefreshCw, Compass, ShieldCheck, MessageCircle
} from 'lucide-react';

const BACKEND_URL = API_URL.replace('/api', '');

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const cleanBackend = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  return `${cleanBackend}${cleanUrl}`;
};

/* ─── Tokens - Clean White Premium ─────────────────────────────────────── */
export const T = {
  navy:   '#2563eb',  // Blue 600
  navyD:  '#1d4ed8',  // Blue 700
  gold:   '#f59e0b',  // Amber 500
  bg:     '#ffffff',  // Pure White
  white:  '#FFFFFF',
  card:   '#FFFFFF',
  border: '#e5e7eb',  // Gray 200
  muted:  '#6b7280',  // Gray 500
  text:   '#111827',  // Gray 900
  green:  '#10b981',  // Emerald 500
  greenL: '#d1fae5',  // Emerald 100
  amber:  '#f59e0b',  // Amber 500
  amberL: '#fef3c7',  // Amber 100
  red:    '#ef4444',  // Red 500
  redL:   '#fee2e2',  // Red 100
  blue:   '#3b82f6',  // Blue 500
  blueL:  '#dbeafe',  // Blue 100
  purple: '#8b5cf6',  // Purple 500
  purpleL:'#ede9fe',  // Purple 100
  glass:  'rgba(255, 255, 255, 0.85)',
};

/* ─── Global style injection ─────────────────────────────────────────────── */
export const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500;600&display=swap');
  
  @keyframes pathGlow { 0% { opacity: 0.4; box-shadow: 0 0 10px rgba(14,165,233,0.3); } 50% { opacity: 1; box-shadow: 0 0 25px rgba(14,165,233,0.8); filter: brightness(1.2); } 100% { opacity: 0.4; box-shadow: 0 0 10px rgba(14,165,233,0.3); } }
  @keyframes nodePulse { 0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.5); } 70% { box-shadow: 0 0 0 15px rgba(14, 165, 233, 0); } 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); } }
  @keyframes cardEnter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes glint { from { left: -100%; } to { left: 200%; } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes pulseGlow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }

  .db-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .db-root { 
    background: radial-gradient(circle at 0% 0%, #f1f5f9 0%, #ffffff 50%, #f0f7ff 100%);
    min-height: 100vh; 
    color: #0f172a; 
    animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow-x: hidden;
  }
  
  .db-body { 
    display: grid; 
    grid-template-columns: 1fr 320px; 
    gap: 28px; 
    max-width: 1340px; 
    margin: 0 auto; 
    padding: 24px 32px 64px;
  }
  @media(max-width:1080px){ 
    .db-body{ grid-template-columns:1fr; padding: 20px 20px 40px; } 
    .db-sidebar{ order:-1; display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px; } 
  }
  
  .db-section-title { 
    font-size: 12px; 
    font-weight: 800; 
    letter-spacing: 1.5px; 
    text-transform: uppercase; 
    color: #64748b; 
    margin: 36px 0 16px; 
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .db-section-title::before {
    content: '';
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #0ea5e9 0%, #6366f1 100%);
    border-radius: 4px;
  }
  
  /* Compact Premium Cards */
  .db-card { 
    background: rgba(255, 255, 255, 0.85); 
    backdrop-filter: blur(20px);
    border: 1px solid rgba(226, 232, 240, 0.8); 
    border-radius: 20px; 
    overflow: hidden; 
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02); 
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
    position: relative;
  }
  .db-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0ea5e9, #6366f1, #ec4899);
    opacity: 0;
    transition: opacity 0.4s;
  }
  .db-card:hover {
    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05);
    transform: translateY(-4px);
    border-color: #cbd5e1;
  }
  .db-card:hover::before {
    opacity: 1;
  }
  
  /* Compact Stat Cards */
  .db-stat { 
    background: rgba(255, 255, 255, 0.9); 
    backdrop-filter: blur(20px);
    border: 1px solid rgba(226, 232, 240, 0.9); 
    border-radius: 18px; 
    padding: 22px; 
    cursor: default; 
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
    box-shadow: 0 4px 16px -4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1); 
    position: relative; 
    overflow: hidden; 
  }
  .db-stat:hover { 
    box-shadow: 0 20px 36px -10px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03); 
    transform: translateY(-4px); 
    border-color: #cbd5e1;
  }
  .db-stat-bg-icon { 
    position: absolute; 
    right: -10px; 
    bottom: -10px; 
    font-size: 64px; 
    opacity: 0.04; 
    transform: rotate(-15deg) scale(1); 
    pointer-events: none; 
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
  }
  .db-stat:hover .db-stat-bg-icon { 
    transform: rotate(0deg) scale(1.15); 
    opacity: 0.08; 
  }
  .db-stat-val { 
    font-family: 'DM Sans', sans-serif; 
    font-size: 28px; 
    font-weight: 900; 
    color: #0f172a; 
    line-height: 1.1; 
    letter-spacing: -0.5px; 
  }

  /* Compact Command Modules */
  .db-nav { 
    background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%); 
    backdrop-filter: blur(20px);
    border: 1px solid rgba(226, 232, 240, 0.9); 
    border-radius: 20px; 
    padding: 20px; 
    cursor: pointer; 
    text-align: left; 
    width: 100%; 
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
    position: relative; 
    overflow: hidden; 
    box-shadow: 0 4px 16px -4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1); 
  }
  .db-nav::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #0ea5e9, #6366f1);
    opacity: 0;
    transition: opacity 0.4s;
  }
  .db-nav:hover { 
    box-shadow: 0 20px 36px -10px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03); 
    transform: translateY(-4px) scale(1.01); 
    border-color: #cbd5e1; 
  }
  .db-nav:hover::before {
    opacity: 1;
  }
  .db-nav::after { 
    content: ''; 
    position: absolute; 
    top: 0; 
    left: -100%; 
    width: 50%; 
    height: 100%; 
    background: linear-gradient(90deg, transparent, rgba(14,165,233,0.08), transparent); 
    transform: skewX(-20deg); 
    pointer-events: none; 
  }
  .db-nav:hover::after { 
    animation: glint 0.8s ease-out; 
  }
  .db-nav-primary {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 12px 32px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .db-nav-primary:hover {
    box-shadow: 0 24px 48px rgba(15,23,42,0.35), 0 10px 24px rgba(15,23,42,0.2);
    transform: translateY(-6px) scale(1.02);
    border-color: rgba(255,255,255,0.3);
  }
  
  .db-row { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid rgba(226,232,240,0.8); transition: all 0.3s; }
  .db-row:hover { background: rgba(248,250,252,0.8); }
  
  /* Welcome Center - Premium Gradient */
  .db-welcome { 
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311058 100%); 
    border-radius: 28px; 
    padding: 44px; 
    margin-bottom: 36px; 
    position: relative; 
    overflow: hidden; 
    color: #fff; 
    box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.4), 0 4px 16px rgba(15, 23, 42, 0.2); 
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .db-welcome::before { 
    content: ''; 
    position: absolute; 
    right: -30px; 
    top: -30px; 
    width: 280px; 
    height: 280px; 
    border-radius: 50%; 
    background: radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%); 
    filter: blur(40px); 
    pointer-events: none;
  }
  .db-welcome::after { 
    content: ''; 
    position: absolute; 
    left: -40px; 
    bottom: -40px; 
    width: 250px; 
    height: 250px; 
    border-radius: 50%; 
    background: radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%); 
    filter: blur(40px); 
    pointer-events: none;
  }

  /* Journey Path - Premium */
  .journey-container { 
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); 
    border: 1px solid #e2e8f0; 
    border-radius: 18px; 
    padding: 32px 28px; 
    position: relative; 
    overflow: hidden; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .journey-path-track { 
    position: absolute; 
    top: 64px; 
    left: 70px; 
    right: 70px; 
    height: 4px; 
    background: #e2e8f0; 
    z-index: 0; 
    border-radius: 4px; 
  }
  .journey-path-fill { 
    position: absolute; 
    top: 0; 
    left: 0; 
    height: 100%; 
    background: linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa); 
    border-radius: 4px; 
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); 
    box-shadow: 0 0 16px rgba(59, 130, 246, 0.4); 
    animation: pathGlow 2s infinite; 
  }
  
  .journey-step { 
    position: relative; 
    z-index: 1; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    width: 20%; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  }
  .step-node { 
    width: 44px; 
    height: 44px; 
    border-radius: 50%; 
    background: #ffffff; 
    border: 3px solid #e2e8f0; 
    color: #64748b; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 18px; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
    z-index: 2; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .step-active .step-node { 
    transform: scale(1.15); 
    border-color: #3b82f6; 
    background: #3b82f6; 
    color: #fff; 
    animation: nodePulse 1.8s infinite; 
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }
  .step-done .step-node { 
    background: #10b981; 
    border-color: #10b981; 
    color: #fff; 
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  }
  .step-label { 
    font-size: 12px; 
    font-weight: 800; 
    color: #64748b; 
    margin-top: 14px; 
    text-transform: uppercase; 
    letter-spacing: 1px; 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  }
  .step-active .step-label { 
    color: #3b82f6; 
    font-weight: 900; 
  }
  
  /* Sidebar Timeline */
  .timeline-container { position: relative; padding-left: 24px; }
  .timeline-container::before { content: ''; position: absolute; left: 9px; top: 12px; bottom: 12px; width: 2px; background: rgba(226,232,240,0.8); }
  .timeline-item { position: relative; margin-bottom: 28px; padding-left: 22px; transition: all 0.3s; }
  .timeline-dot { position: absolute; left: -19px; top: 6px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff; background: #94a3b8; transition: all 0.3s; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
  .timeline-bubble { background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); border: 1px solid rgba(226,232,240,0.8); border-radius: 16px; padding: 16px 18px; box-shadow: 0 4px 12px -4px rgba(0,0,0,0.03); transition: all 0.3s; }
  .timeline-bubble:hover { border-color: #0ea5e9; transform: translateX(6px); box-shadow: 0 10px 24px -6px rgba(14,165,233,0.15); }
  .timeline-active .timeline-dot { background: #0ea5e9; box-shadow: 0 0 0 4px rgba(14,165,233,0.2); }
  .timeline-active .timeline-bubble { border-left: 4px solid #0ea5e9; }
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
      style={{ borderTop: `5px solid ${accent || '#3b82f6'}` }}
      onClick={onClick}
    >
      {icon && (
        <div className="db-stat-bg-icon">
          {isIconComponent ? React.createElement(icon, { size: 100, strokeWidth: 1.2 }) : icon}
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 800, 
          color: '#64748b', 
          textTransform: 'uppercase', 
          letterSpacing: 1.2, 
          marginBottom: 12 
        }}>{label}</div>
        <div className="db-stat-val">{value ?? '—'}</div>
        {sub && <div style={{ fontSize: 13, color: '#64748b', marginTop: 10, fontWeight: 500 }}>{sub}</div>}
        {onClick && <div style={{ fontSize: 12, fontWeight: 700, color: accent || '#3b82f6', marginTop: 16, letterSpacing: .3 }}>View details →</div>}
      </div>
    </div>
  );
};

export const NavCard = ({ icon, label, sub, onClick, primary, warn }) => {
  const isIconComponent = typeof icon === 'function' || (icon && icon.$$typeof);
  
  return (
    <button
      className={`db-nav${primary ? ' db-nav-primary' : ''}${warn ? ' db-nav-warn' : ''}`}
      style={
        primary 
          ? { 
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', 
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 12px 32px rgba(15,23,42,0.3)'
            } 
          : { 
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }
      }
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          width: 44,
          height: 44,
          background: primary ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' : '#f1f5f9', 
          borderRadius: 14, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: primary ? '0 6px 16px rgba(14,165,233,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
          color: primary ? '#ffffff' : '#0ea5e9',
          flexShrink: 0
        }}>
          {isIconComponent ? React.createElement(icon, { size: 22, strokeWidth: 2.5 }) : icon}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: primary ? '#fff' : '#0f172a', marginBottom: 4, letterSpacing: '-0.3px' }}>{label}</div>
          <div style={{ fontSize: 12, color: primary ? '#cbd5e1' : '#64748b', lineHeight: 1.4, fontWeight: 500 }}>{sub}</div>
        </div>
        <div style={{ 
          fontSize: 18, 
          color: primary ? '#38bdf8' : '#0ea5e9',
          transition: 'all 0.3s',
          fontWeight: 800
        }}>→</div>
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
    fontWeight: '700',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    border: `1px solid ${color}30`
  }}>{label}</span>
);

const statusMap = {
  PENDING:  { label: 'Pending',  color: '#b45309', bg: '#fef3c7' },
  ACCEPTED: { label: 'Accepted', color: '#10b981', bg: '#d1fae5' },
  REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
  OPEN:     { label: 'Open',     color: '#10b981', bg: '#d1fae5' },
  CLOSED:   { label: 'Closed',   color: '#64748b', bg: '#f1f5f9' },
};
export const Pill = ({ s }) => {
  const m = statusMap[s] || { label: s, color: '#64748b', bg: '#f1f5f9' };
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
export const WelcomeBanner = ({ name, role, tagline, avatar, headline, department }) => (
  <div className="db-welcome">
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 32 }}>
      {avatar && (
        <div style={{ 
          width: 96, 
          height: 96, 
          borderRadius: 28, 
          border: '4px solid rgba(255,255,255,0.25)', 
          overflow: 'hidden', 
          flexShrink: 0,
          boxShadow: '0 16px 36px rgba(0,0,0,0.35), 0 0 0 8px rgba(255,255,255,0.05)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <img src={getMediaUrl(avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: 11, 
          color: '#38bdf8', 
          fontWeight: 900, 
          letterSpacing: 1.8, 
          textTransform: 'uppercase', 
          marginBottom: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 12px #38bdf8', animation: 'pulseGlow 2s infinite' }} />
          {role} Dashboard
        </div>
        <div style={{ 
          fontSize: 36, 
          fontWeight: 900, 
          color: '#ffffff', 
          marginBottom: 10,
          letterSpacing: '-0.8px',
          textShadow: '0 4px 16px rgba(0,0,0,0.3)',
          lineHeight: 1.15
        }}>
          Welcome back, {(name || 'User').split(' ')[0]}! 👋
          {department && <span style={{ fontSize: 18, fontWeight: 800, color: '#94a3b8', marginLeft: 16, textShadow: 'none' }}>· {department}</span>}
        </div>
        {headline && <div style={{ fontSize: 18, color: '#38bdf8', fontWeight: 800, marginBottom: 10, letterSpacing: '-0.3px' }}>{headline}</div>}
        <div style={{ fontSize: 16, color: '#cbd5e1', maxWidth: 700, lineHeight: 1.65, fontWeight: 500 }}>{tagline}</div>
      </div>
    </div>
  </div>
);

/* ─── Journey Stepper - Ultra Premium Redesign ────────────────────────────────────────── */
const InternshipJourney = ({ status = 'PROFILE_READY' }) => {
  const steps = [
    { key: 'PROFILE_READY', label: 'Profile Setup', icon: UserCircle, color: '#0ea5e9', bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', desc: 'Complete your profile' },
    { key: 'APPLYING',     label: 'Searching',   icon: Search, color: '#8b5cf6', bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', desc: 'Find opportunities' },
    { key: 'INTERNING',    label: 'Interning',  icon: Briefcase, color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', desc: 'Active placement' },
    { key: 'REPORTING',    label: 'Reporting', icon: FileText, color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', desc: 'Submit reports' },
    { key: 'CERTIFIED',    label: 'Completed',  icon: Trophy, color: '#ec4899', bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', desc: 'Get certificate' },
  ];

  const getStatusIndex = (s) => {
    const map = { 'PROFILE_READY': 0, 'APPLYING': 1, 'INTERNING': 2, 'REPORTING': 3, 'CERTIFIED': 4 };
    return map[s] || 0;
  };

  const currentIndex = getStatusIndex(status);
  const progressPercent = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="db-card" style={{
      padding: '36px 40px',
      marginBottom: 36,
      overflow: 'visible'
    }}>
      {/* Premium Glass Background Elements */}
      <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.6px' }}>
            Your Internship Journey
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: '#64748b', fontWeight: 500 }}>
            Track your progress from profile setup to certification
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', border: '1px solid #cbd5e1', borderRadius: '24px', boxShadow: '0 8px 24px -6px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)', animation: 'pulseGlow 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>In Progress</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 36, fontWeight: 900, color: '#0ea5e9', letterSpacing: '-1px', lineHeight: 1 }}>
            {Math.round(progressPercent)}%
            <span style={{ fontSize: 14, fontWeight: 800, color: '#64748b', letterSpacing: '0', marginLeft: 8 }}>Complete</span>
          </div>
        </div>
      </div>

      {/* Progress Track & Nodes */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}>
        {/* Animated Track Background */}
        <div style={{ position: 'absolute', top: 32, left: 45, right: 45, height: 8, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6, #ec4899)', 
            borderRadius: 8, 
            transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.6)'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {steps.map((s, i) => {
            const isDone = i < currentIndex;
            const isActive = i === currentIndex;
            const IconComponent = s.icon;
            
            return (
              <div key={s.key} style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%',
                opacity: isDone || isActive ? 1 : 0.5,
                transform: isActive ? 'translateY(-6px)' : 'none',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <div style={{
                  width: 68, height: 68, borderRadius: '22px', 
                  background: isDone || isActive ? s.bg : '#f8fafc',
                  border: `2px solid ${isDone || isActive ? 'transparent' : '#cbd5e1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? `0 20px 36px -10px ${s.color}80` : isDone ? '0 8px 20px -6px rgba(0,0,0,0.1)' : 'none',
                  color: isDone || isActive ? s.color : '#94a3b8',
                  position: 'relative',
                  zIndex: 2,
                  transform: 'rotate(45deg)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <div style={{ transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isDone ? <CheckCircle size={30} strokeWidth={2.5} /> : <IconComponent size={30} strokeWidth={2.5} />}
                  </div>
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
                      borderRadius: '25px', border: `2px solid ${s.color}`,
                      opacity: 0, animation: 'nodePulse 2s infinite'
                    }} />
                  )}
                </div>
                
                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: 15, fontWeight: isActive ? 900 : 800, 
                    color: isActive ? '#0f172a' : isDone ? '#334155' : '#94a3b8',
                    marginBottom: 6, letterSpacing: '-0.3px'
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
        
        const hasCert = certRes.success && certRes.data;
        setHasCertificate(hasCert);
        
        const hasAccepted = currentApps.some(a => a.status === 'ACCEPTED');
        const hasApps = currentApps.length > 0;
        const reportsSubmitted = (rRes.data?.results || rRes.data || []).length;
        const acceptedApp = currentApps.find(a => a.status === 'ACCEPTED');
        const hasSubmittedReports = reportsSubmitted > 0;
        
        if (hasCert) {
          setJourneyStatus('CERTIFIED');
          setActiveIntern(acceptedApp);
        }
        else if (hasAccepted && hasSubmittedReports) {
          setJourneyStatus('REPORTING');
          setActiveIntern(acceptedApp);
        }
        else if (hasAccepted) {
          setJourneyStatus('INTERNING');
          setActiveIntern(acceptedApp);
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
      <Header title="Student Dashboard" subtitle="Track your internship journey" />
      <div className="db-body">

        {/* ── Main column ── */}
        <div>
          <WelcomeBanner
            name={user?.full_name}
            role="Student"
            avatar={user?.avatar}
            headline={user?.headline}
            department={user?.department_name}
            tagline="Track your journey, manage applications, and excel in your professional internship."
          />

          <InternshipJourney status={journeyStatus} />

          {/* Certificate Achievement Card - Premium */}
          {hasCertificate && (
            <div className="db-card" style={{ 
              padding: 44, 
              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)',
              border: 'none',
              marginBottom: 36,
              cursor: 'pointer',
              boxShadow: '0 24px 48px -12px rgba(16,185,129,0.4), 0 4px 16px rgba(16,185,129,0.2)'
            }}
            onClick={() => navigate('/student/certificates')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 32px 64px -12px rgba(16,185,129,0.5), 0 8px 24px rgba(16,185,129,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 24px 48px -12px rgba(16,185,129,0.4), 0 4px 16px rgba(16,185,129,0.2)';
            }}>
              <div style={{ position: 'absolute', top: -30, right: -30, fontSize: 160, opacity: 0.12, transform: 'rotate(15deg)', pointerEvents: 'none' }}>🏆</div>
              <div style={{ position: 'absolute', bottom: -20, left: -20, fontSize: 120, opacity: 0.1, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>⭐</div>
              
              <div style={{
                position: 'absolute', top: 24, left: 24, width: 100, height: 100,
                background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
                borderRadius: '50%', animation: 'pulseGlow 2s infinite', pointerEvents: 'none'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: '1 1 300px' }}>
                  <div style={{ 
                    fontSize: 72, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)',
                    borderRadius: 24, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}>🎓</div>
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', marginBottom: 10, letterSpacing: '-0.8px', textShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                      Congratulations! 🎉
                    </div>
                    <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.95)', lineHeight: 1.65, fontWeight: 500 }}>
                      You have successfully completed your internship and earned your certificate!
                    </div>
                  </div>
                </div>
                <button style={{
                  padding: '18px 36px', background: '#ffffff', color: '#10b981', border: 'none',
                  borderRadius: 20, fontSize: 16, fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.25)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  letterSpacing: '0.5px', textTransform: 'uppercase'
                }}
                onClick={(e) => { e.stopPropagation(); navigate('/student/certificates'); }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.25)'; }}>
                  View Certificate →
                </button>
              </div>
            </div>
          )}

          {/* Reporting Months Section - Premium Cards */}
          {activeIntern && (
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="db-section-title" style={{ margin: '0 0 16px' }}>Monthly Reporting Schedule</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`, gap: 20 }}>
                {[...Array(parseInt(activeIntern.internship_duration) || 3)].map((_, i) => {
                  const monthNum = i + 1;
                  const isSubmitted = reports.some(r => r.report_month === monthNum);
                  return (
                    <div key={monthNum} style={{ 
                      background: isSubmitted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${isSubmitted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(226, 232, 240, 0.8)'}`,
                      borderRadius: '20px', padding: '20px 16px', textAlign: 'center',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer',
                      position: 'relative', overflow: 'hidden',
                      boxShadow: isSubmitted ? '0 12px 28px -6px rgba(16,185,129,0.4)' : '0 10px 30px -10px rgba(0,0,0,0.05)'
                    }}
                    onClick={() => navigate('/student/reports')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = isSubmitted ? '0 20px 40px -10px rgba(16,185,129,0.5)' : '0 20px 40px -15px rgba(0,0,0,0.1)';
                      if (!isSubmitted) e.currentTarget.style.borderColor = '#0ea5e9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isSubmitted ? '0 12px 28px -6px rgba(16,185,129,0.4)' : '0 10px 30px -10px rgba(0,0,0,0.05)';
                      if (!isSubmitted) e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                    }}>
                      <div style={{
                        position: 'absolute', top: -30, right: -30, width: 90, height: 90,
                        background: isSubmitted ? 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
                        borderRadius: '50%', pointerEvents: 'none'
                      }} />
                      
                      <div style={{ fontSize: 11, fontWeight: 800, color: isSubmitted ? 'rgba(255,255,255,0.85)' : '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6, position: 'relative', zIndex: 1 }}>Month</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: isSubmitted ? '#ffffff' : '#0f172a', marginBottom: 12, lineHeight: 1, position: 'relative', zIndex: 1 }}>{monthNum}</div>
                      
                      <div style={{ 
                        fontSize: 10, fontWeight: 800, background: isSubmitted ? 'rgba(255,255,255,0.25)' : '#f1f5f9', 
                        color: isSubmitted ? '#ffffff' : '#64748b', padding: '6px 12px', borderRadius: '24px',
                        display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '0.8px',
                        position: 'relative', zIndex: 1, backdropFilter: 'blur(12px)',
                        boxShadow: isSubmitted ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                      }}>
                        {isSubmitted ? <CheckCircle size={12} strokeWidth={3} /> : <Clock size={12} strokeWidth={3} />}
                        {isSubmitted ? 'SUBMITTED' : 'PENDING'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeIntern && (
            <div style={{ marginBottom: 40 }}>
              <p className="db-section-title">Active Internship Progress</p>
              <div className="db-card" style={{ padding: 40, overflow: 'visible' }}>
                <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
                
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, position: 'relative', zIndex: 1 }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
                          <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: '-0.6px', marginBottom: 14, color: '#0f172a', wordBreak: 'break-word' }}>
                            {activeIntern.internship_title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontSize: 15, color: '#64748b', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '6px 18px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 12px #0ea5e9' }} />
                              <span style={{ color: '#1e293b', fontWeight: 800 }}>{activeIntern.company_name}</span>
                            </div>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ color: '#64748b', fontWeight: 700 }}>{durationMonths} Months Duration</span>
                          </div>
                        </div>
                        
                        <div style={{ 
                          position: 'relative', width: 96, height: 96, borderRadius: '50%',
                          background: `conic-gradient(#0ea5e9 ${overallPct}%, #e2e8f0 ${overallPct}%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 12px 32px rgba(14, 165, 233, 0.3)', flexShrink: 0
                        }}>
                          <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: '#ffffff',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)'
                          }}>
                            <span style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{overallPct}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Animated Linear Progress */}
                      <div style={{ height: 10, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 36, position: 'relative', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                        <div style={{ 
                          height: '100%', width: `${overallPct}%`, 
                          background: 'linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)',
                          borderRadius: 10, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)', position: 'relative'
                        }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'glint 2s infinite' }} />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, position: 'relative', zIndex: 1 }}>
                        {[
                          { value: monthsDone, label: 'Months Done', color: '#0ea5e9', bg: 'rgba(240, 249, 255, 0.9)', border: '#bae6fd' },
                          { value: monthsLeft, label: 'Months Left', color: '#ec4899', bg: 'rgba(253, 242, 248, 0.9)', border: '#fbcfe8' },
                          { value: Math.floor(daysElapsed), label: 'Total Days', color: '#8b5cf6', bg: 'rgba(245, 243, 255, 0.9)', border: '#ddd6fe' }
                        ].map((stat, i) => (
                          <div key={i} style={{ 
                            textAlign: 'center', padding: '24px 20px', background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(16px)', borderRadius: '22px', border: '1px solid #cbd5e1',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.03)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.background = stat.bg;
                            e.currentTarget.style.borderColor = stat.border;
                            e.currentTarget.style.boxShadow = `0 16px 32px ${stat.color}30`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                          }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 12 }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Actions - Premium Style */}
          <p className="db-section-title">Core Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>
            <NavCard primary icon={Compass} label="Search Internships"  sub="Find opportunities that match your skills"    onClick={() => navigate('/student/search-internships')} />
            <NavCard icon={Briefcase} label="My Applications"            sub="Track the status of every application you've submitted"     onClick={() => navigate('/student/applications')} />
            <NavCard icon={TrendingUp} label="Active Internship"          sub="View your current internship, reports, and advisor feedback" onClick={() => navigate('/student/active-internship')} />
          </div>

          {/* Quick Links - Premium Cards */}
          <p className="db-section-title">Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 36 }}>
            {[
              { icon: UserCircle, label: 'My Profile', sub: 'View & edit profile', path: '/student/profile', color: '#0ea5e9', bg: '#e0f2fe' },
              { icon: MessageCircle, label: 'Messages', sub: 'Chat with advisors', path: '/student/messages', color: '#8b5cf6', bg: '#ede9fe' },
              { icon: ShieldCheck, label: 'Security', sub: 'Change password', path: '/settings/change-password', color: '#ec4899', bg: '#fce7f3' },
              { icon: FileCheck, label: 'Verify Certificates', sub: 'Check authenticity', path: '/verify', color: '#f59e0b', bg: '#fef3c7' },
            ].map(({ icon: Icon, label, sub, path, color, bg }) => (
              <div key={label} style={{ 
                cursor: 'pointer', border: '1px solid rgba(226, 232, 240, 0.9)', borderRadius: '20px', 
                background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 16px -4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)', position: 'relative', overflow: 'hidden'
              }} 
              onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = `0 20px 36px -10px ${color}30`;
                e.currentTarget.style.borderColor = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.9)';
              }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s' }}>
                  <Icon size={22} color={color} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 800, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{sub}</div>
                </div>
                <div style={{ position: 'absolute', bottom: 16, right: 16, fontSize: 16, color: color, fontWeight: 800, opacity: 0.8 }}>→</div>
              </div>
            ))}
          </div>

          {/* Recent applications */}
          {!loading && apps.length > 0 && (
            <>
              <p className="db-section-title">Recent Applications</p>
              <div className="db-card" style={{ marginBottom: 36 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(226,232,240,0.8)', background: 'rgba(248,250,252,0.6)' }}>
                        <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Position</th>
                        <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Company</th>
                        <th style={{ padding: '20px 28px', textAlign: 'center', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apps.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid rgba(226,232,240,0.6)', transition: 'all 0.3s ease', cursor: 'pointer' }} 
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,250,252,0.8)'; e.currentTarget.style.transform = 'scale(1.005)'; }} 
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}>
                          <td style={{ padding: '20px 28px' }}>
                            <div style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a', marginBottom: '4px' }}>{a.internship_title || 'Internship'}</div>
                          </td>
                          <td style={{ padding: '20px 28px' }}>
                            <div style={{ fontSize: '15px', color: '#64748b', fontWeight: '500' }}>{a.company_name || '—'}</div>
                          </td>
                          <td style={{ padding: '20px 28px', textAlign: 'center' }}>
                            <Pill s={a.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '20px 28px', borderTop: '1px solid rgba(226,232,240,0.8)', background: 'rgba(255,255,255,0.5)' }}>
                  <button onClick={() => navigate('/student/applications')} style={{ 
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', border: 'none', cursor: 'pointer', 
                    color: '#ffffff', fontSize: '14px', fontWeight: '800', padding: '12px 24px', borderRadius: '14px',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 8px 20px -6px rgba(14,165,233,0.4)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(14,165,233,0.6)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(14,165,233,0.4)'; }}>
                    View all applications →
                  </button>
                </div>
              </div>
            </>
          )}

          {!loading && apps.length === 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,250,252,0.95) 100%)', backdropFilter: 'blur(20px)',
              border: '2px dashed #cbd5e1', borderRadius: '28px', padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)'
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 72, marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>🚀</div>
                <div style={{ fontWeight: 900, fontSize: 28, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.6px' }}>Ready to Launch Your Career?</div>
                <div style={{ fontSize: 16, color: '#64748b', marginBottom: 36, maxWidth: 450, margin: '0 auto 36px', lineHeight: 1.65 }}>Your internship journey starts here. Discover amazing opportunities and take the first step toward your professional future.</div>
                <button onClick={() => navigate('/student/search-internships')} style={{ 
                  padding: '18px 44px', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', color: '#fff', border: 'none', 
                  borderRadius: '20px', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 12px 28px -6px rgba(14,165,233,0.5)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 36px -6px rgba(14,165,233,0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(14,165,233,0.5)'; }}>
                  🔍 Search Internships
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />
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
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [saving, setSaving]         = useState(false);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    email: '',
    website: '',
    phone_number: '',
    address: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    Promise.all([
      internshipService.getMyInternships(),
      applicationService.getCompanyApplications(),
      authService.getProfile(),
    ]).then(([iRes, aRes, pRes]) => {
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
      if (pRes.success && pRes.data) {
        const p = pRes.data.profile || {};
        const u = pRes.data.user || {};
        setProfile(p);
        setContactForm({
          email: u.email || user?.email || '',
          website: p.website || '',
          phone_number: p.phone_number || '',
          address: p.address || ''
        });
      }
      setLoading(false);
    });
  }, []);

  const isProfileIncomplete = !profile?.address || !profile?.phone_number || !profile?.website;

  const handleContactSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await authService.updateProfile(contactForm);
      if (res.success) {
        setSuccess('Contact information updated successfully!');
        setProfile({ ...profile, ...contactForm });
        // Auto-clear success after 3s
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Failed to update contact info');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Company Dashboard" subtitle="Manage your interns and postings" />
      <div className="db-body">

        {/* ── Main column ── */}
        <div>
          <WelcomeBanner
            name={user?.full_name}
            role="Company Admin"
            department={user?.department_name}
            tagline="Source top talent, manage active internships, and track the progress of your professional cohorts."
          />

          {isProfileIncomplete && !loading && (
            <div style={{ 
              background: '#fffbeb', 
              border: '1px solid #fef3c7', 
              borderRadius: '16px', 
              padding: '20px', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ 
                background: '#fef3c7', 
                color: '#b45309', 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: '14px', marginBottom: '2px' }}>Complete Your Company Profile</div>
                <div style={{ fontSize: '12px', color: '#b45309' }}>Your contact information is missing. Fill it out to make your profile visible to students.</div>
              </div>
              <button 
                onClick={() => navigate('/settings')}
                style={{ 
                  background: '#f59e0b', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 18px', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)'
                }}
              >
                Complete Now →
              </button>
            </div>
          )}

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

          <p className="db-section-title">Network</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard icon={MessageSquare} label="Messages" sub="Chat with students and their advisors" onClick={() => navigate('/company/messages')} />
          </div>

          <p className="db-section-title">Management</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard icon={FileText} label="Monthly Progress" sub="Submit performance reports for your interns" onClick={() => navigate('/company/report-submission')} />
            <NavCard icon={Settings} label="Account Settings" sub="Update your profile and contact info" onClick={() => navigate('/settings')} />
          </div>


        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />
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
      <Header title="Advisor Dashboard" subtitle="Mentor and evaluate students" />
      <div className="db-body">

        <div>
          <WelcomeBanner
            name={user?.full_name}
            role="Academic Advisor"
            department={user?.department_name}
            tagline="Mentor your assigned students, review periodic progress, and provide strategic evaluations for academic success."
          />

          {/* Stats Bar - Upwork Style */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: 'var(--text-bright)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #14a800 0%, #108a00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(20, 168, 0, 0.2)'
                }}>
                  <Users size={22} color="#ffffff" strokeWidth={2.5} />
                </div>
                Students Overview
              </h2>
              <span style={{ 
                fontSize: 12, 
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Academic Year 2023/2024
              </span>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: 16
            }}>
              {loading ? <Skel cols={4} h={110} /> : <>
                {/* Total Cohort Card */}
                <div style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 10,
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--accent-navy)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}>
                  <div style={{ position: 'absolute', top: 5, right: 5, opacity: 0.15 }}>
                    <Users size={48} color="var(--accent-navy)" strokeWidth={1.5} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Total Cohort</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-bright)', lineHeight: 1, marginBottom: 2 }}>{stats?.total_students || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Assigned students</div>
                  </div>
                </div>

                {/* Active Status Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #14a800 0%, #0d7a00 100%)',
                  borderRadius: 10,
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(20, 168, 0, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(20, 168, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 168, 0, 0.12)';
                }}>
                  <div style={{ position: 'absolute', top: 5, right: 5, opacity: 0.15 }}>
                    <TrendingUp size={48} color="#ffffff" strokeWidth={1.5} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Active Status</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1, marginBottom: 2 }}>{stats?.active_students || 0}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--bg-surface)', animation: 'pulse 2s infinite' }}></span>
                      Currently active
                    </div>
                  </div>
                </div>

                {/* Graduated/Completed Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: 10,
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.12)';
                }}>
                  <div style={{ position: 'absolute', top: 5, right: 5, opacity: 0.15 }}>
                    <Award size={48} color="#ffffff" strokeWidth={1.5} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Completed</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1, marginBottom: 2 }}>{stats?.completed_students || 0}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>Graduated students</div>
                  </div>
                </div>

                {/* Feedback Given Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: 10,
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.12)';
                }}>
                  <div style={{ position: 'absolute', top: 5, right: 5, opacity: 0.15 }}>
                    <MessageSquare size={48} color="#ffffff" strokeWidth={1.5} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Feedback Given</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: 1, marginBottom: 2 }}>{stats?.total_feedback_given || 0}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>Academic feedback</div>
                  </div>
                </div>
              </>}
            </div>
          </div>

          {/* Quick Links - Horizontal */}
          <p className="db-section-title">Quick Links</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '👤', label: 'Profile',          path: '/advisor/profile' },
              { icon: '👥', label: 'Student Roster',   path: '/advisor/my-students' },
              { icon: '💬', label: 'Messages',         path: '/advisor/messages' },
              { icon: '📋', label: 'Audit Reports',    path: '/advisor/reports' },
              { icon: '🏁', label: 'Evaluation Hub',   path: '/advisor/final-reports' },
              { icon: '🔒', label: 'Change Password',  path: '/settings/change-password' },
            ].map(({ icon, label, path }) => (
              <div 
                key={label} 
                style={{ 
                  cursor: 'pointer', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 12, 
                  background: 'var(--bg-surface)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.3s',
                  boxShadow: 'var(--shadow-sm)'
                }} 
                onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--accent-navy)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
              </div>
            ))}
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
      <Header title="Department Dashboard" subtitle="Oversee academic operations" />
      <div className="db-body">
        <div>
          <WelcomeBanner 
            name={user?.full_name} 
            role="Department Head"
            department={user?.department_name}
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

          {/* Quick Links - Horizontal */}
          <p className="db-section-title">Quick Links</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '👥', label: 'Student Directory',   path: '/department/students' },
              { icon: '🔗', label: 'Assignment Desk',   path: '/department/assign-advisor' },
              { icon: '📜', label: 'Certification Hub', path: '/department/students-completion' },
              { icon: '🔔', label: 'Notifications',     path: '/notifications' },
            ].map(({ icon, label, path }) => (
              <div 
                key={label} 
                style={{ 
                  cursor: 'pointer', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 12, 
                  background: 'var(--bg-surface)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.3s',
                  boxShadow: 'var(--shadow-sm)'
                }} 
                onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--accent-navy)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
              </div>
            ))}
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
      <Header title="Admin Dashboard" subtitle="System Control Center" />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
             <NavCard icon="🔒" label="Change Password" sub="Update your administrative password"      onClick={() => navigate('/settings/change-password')} />
             <NavCard icon="📊" label="System Stats"       sub="Monitor platform growth and engagement metrics"    onClick={() => window.open(`${BACKEND_URL}/admin/`, '_blank')} />
          </div>

          {/* Quick Links - Horizontal */}
          <p className="db-section-title">Quick Links</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '⚙️', label: 'Django Console',  path: `${BACKEND_URL}/admin/` },
              { icon: '👥', label: 'User Hub',       path: '/admin/users' },
              { icon: '📜', label: 'Audit Logs',     path: `${BACKEND_URL}/admin/` },
            ].map(({ icon, label, path }) => (
              <div 
                key={label} 
                style={{ 
                  cursor: 'pointer', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 12, 
                  background: 'var(--bg-surface)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.3s',
                  boxShadow: 'var(--shadow-sm)'
                }} 
                onClick={() => path.startsWith('http') ? window.open(path, '_blank') : navigate(path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--accent-navy)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ fontSize: 10, opacity: 0.3 }}>→</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />
        </div>
      </div>
    </div>
  );
};

// UIL Dashboard is in pages/uil/UILDashboard.jsx