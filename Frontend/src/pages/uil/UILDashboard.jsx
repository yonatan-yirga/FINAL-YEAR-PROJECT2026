/**
 * UIL Dashboard
 * Oversight for system registration and user verification.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import uilService from '../../services/uilService';
import Header from '../../components/common/Header';
import { 
  WelcomeBanner, 
  StatCard, 
  NavCard, 
  NotifSidebar, 
  Skel, 
  Pill,
  G, T, getMediaUrl 
} from '../Dashboards';
import { 
  ClipboardList, Calendar, CheckCircle, XCircle, 
  GraduationCap, Building2, UserCheck, Building,
  Users, BarChart3, Eye, Lock, AlertTriangle
} from 'lucide-react';

const UILDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    uilService.getDashboardStats().then(r => {
      if (r.success) setStats(r.data);
      else setError(r.error || 'Failed to load platform statistics.');
      setLoading(false);
    });
  }, []);

  const pending = stats?.total_pending || 0;
  const name = user?.full_name || 'UIL Administrator';

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="UIL Dashboard" subtitle="University Industry Linkage Management" />
      <div className="db-body">

        {/* ── Main column ── */}
        <div>
          <WelcomeBanner 
            name={name} 
            role="UIL Officer"
            tagline="Review registration requests, verify users, and monitor student-industry engagement." 
          />

          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 12, padding: '14px 18px', color: '#B91C1C', fontSize: 13, marginBottom: 24 }}>
              {error}
            </div>
          )}

          {/* Stats Bar */}
          <p className="db-section-title">Statistics</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            {loading ? <Skel cols={4} h={110} /> : <>
              <StatCard label="Pending Review"  value={pending} accent={pending > 0 ? '#B91C1C' : T.green} icon={ClipboardList} sub={pending > 0 ? 'Action required' : 'Queue cleared'} />
              <StatCard label="Today"           value={stats?.pending_today}       accent={T.gold}  icon={Calendar} />
              <StatCard label="Weekly Approved" value={stats?.approved_this_week} accent={T.green} icon={CheckCircle} />
              <StatCard label="Weekly Rejected" value={stats?.rejected_this_week} accent={T.red}   icon={XCircle} />
            </>}
          </div>

          {/* Type Distribution */}
          {!loading && stats?.by_type && (
            <>
              <p className="db-section-title">User Registration Status (Pending)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                  { label: 'Students',    value: stats.by_type.students,    accent: T.navy,  icon: GraduationCap },
                  { label: 'Companies',   value: stats.by_type.companies,   accent: T.gold,  icon: Building2 },
                  { label: 'Advisors',    value: stats.by_type.advisors,    accent: T.green, icon: UserCheck },
                  { label: 'Departments', value: stats.by_type.departments, accent: T.blue,  icon: Building },
                ].map(({ label, value, accent, icon }) => (
                  <StatCard key={label} label={label} value={value ?? 0} accent={accent} icon={icon} />
                ))}
              </div>
            </>
          )}

          {/* Navigation Modules */}
          <p className="db-section-title">Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <NavCard primary icon={ClipboardList} label="Pending Registrations" badge={pending} sub="Verify and approve registrations" onClick={() => navigate('/uil/pending-registrations')} />
            <NavCard icon={Users} label="User Management" sub="Manage all approved platform users"    onClick={() => navigate('/uil/manage-users')} />
            <NavCard icon={BarChart3} label="System Overview"  sub="Real-time system-wide statistics"     onClick={() => navigate('/uil/system-overview')} />
          </div>

          {/* Recent Registrations Table */}
          {!loading && stats?.recent_activity?.length > 0 && (
            <>
              <p className="db-section-title">Recent Activity</p>
              <div className="db-card" style={{ marginBottom: 28 }}>
                {stats.recent_activity.slice(0, 8).map((item, i) => (
                  <div key={item.id || i} className="db-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, background: 'var(--bg-root)', color: 'var(--accent-navy)', border: '1px solid var(--border-subtle)' }}>
                        {item.request_type}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-bright)' }}>{item.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '—'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                       <Pill s={item.status} />
                       <button onClick={() => navigate('/uil/pending-registrations')} style={{ background: 'none', border: 'none', color: 'var(--accent-navy)', fontSize: 16, cursor: 'pointer', padding: 4 }}>
                         <Eye size={18} />
                       </button>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px 18px' }}>
                  <button onClick={() => navigate('/uil/pending-registrations')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-navy)', fontSize: 13, fontWeight: 700 }}>View all activity ↗</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="db-sidebar">
          <NotifSidebar />

          {pending > 0 && (
            <div className="db-sb-section" style={{ border: 'none', background: 'var(--bg-root)', borderLeft: '4px solid var(--accent-red)' }}>
               <div className="db-sb-head" style={{ color: 'var(--accent-red)', paddingLeft: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                 <AlertTriangle size={16} />
                 Alert
               </div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 6 }}>{pending} Registration Waiting</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>Users require verification to access the platform.</div>
                <button 
                  onClick={() => navigate('/uil/pending-registrations')} 
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
                  View Registrations →
                </button>
              </div>
            </div>
          )}

          <div className="db-sb-section" style={{ border: 'none', background: 'transparent' }}>
            <div className="db-sb-head" style={{ border: 'none', paddingLeft: 0 }}>System Management</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { icon: ClipboardList, label: 'Pending Registrations', path: '/uil/pending-registrations' },
                { icon: Users, label: 'User Management',       path: '/uil/manage-users' },
                { icon: BarChart3, label: 'System Overview',      path: '/uil/system-overview' },
                { icon: Lock, label: 'Change Password',      path: '/settings/change-password' },
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
                  onClick={() => navigate(path)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <IconComponent size={16} />
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

export default UILDashboard;