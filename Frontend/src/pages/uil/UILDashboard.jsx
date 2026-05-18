/**
 * UIL Dashboard - Premium Modern Design
 * Oversight for system registration and user verification.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import uilService from '../../services/uilService';
import Header from '../../components/common/Header';
import {
  ClipboardList, CheckCircle, XCircle,
  GraduationCap, Building2, UserCheck, Building,
  Users, Eye, AlertTriangle,
  Shield, Sparkles, ArrowRight, Clock, Zap, TrendingUp
} from 'lucide-react';
import './UILDashboard.css';

const UILDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="uil-dashboard-premium">
      <Header title="UIL Dashboard" subtitle="System Oversight & Verification" />

      <div className="uil-content">
        {/* Welcome Banner */}
        <div className="uil-welcome-banner">
          <div className="uil-welcome-icon">
            <Shield size={28} strokeWidth={2.5} />
          </div>
          <div className="uil-welcome-text">
            <div className="uil-welcome-subtitle">UIL OFFICER</div>
            <h1 className="uil-welcome-title">Welcome back, {name}</h1>
            <p className="uil-welcome-desc">Review registration requests, verify users, and monitor student-industry engagement.</p>
          </div>
          <Sparkles className="uil-sparkle" size={20} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="uil-alert uil-alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="uil-section-header">
          <h2>Overview Statistics</h2>
          <p>Real-time platform metrics and activity</p>
        </div>

        <div className="uil-stats-grid">
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="uil-stat-skeleton"></div>
              ))}
            </>
          ) : (
            <>
              <div className={`uil-stat-card ${pending > 0 ? 'urgent' : 'success'}`}>
                <div className="uil-stat-icon" style={{ background: pending > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <ClipboardList size={22} strokeWidth={2.5} />
                </div>
                <div className="uil-stat-body">
                  <div className="uil-stat-label">Pending Review</div>
                  <div className="uil-stat-value">{pending}</div>
                  <div className="uil-stat-sub">{pending > 0 ? 'Action required' : 'Queue cleared'}</div>
                </div>
              </div>

              <div className="uil-stat-card">
                <div className="uil-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <Zap size={22} strokeWidth={2.5} />
                </div>
                <div className="uil-stat-body">
                  <div className="uil-stat-label">Today</div>
                  <div className="uil-stat-value">{stats?.pending_today || 0}</div>
                  <div className="uil-stat-sub">New registrations</div>
                </div>
              </div>

              <div className="uil-stat-card">
                <div className="uil-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <CheckCircle size={22} strokeWidth={2.5} />
                </div>
                <div className="uil-stat-body">
                  <div className="uil-stat-label">Weekly Approved</div>
                  <div className="uil-stat-value">{stats?.approved_this_week || 0}</div>
                  <div className="uil-stat-sub">This week</div>
                </div>
              </div>

              <div className="uil-stat-card">
                <div className="uil-stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                  <XCircle size={22} strokeWidth={2.5} />
                </div>
                <div className="uil-stat-body">
                  <div className="uil-stat-label">Weekly Rejected</div>
                  <div className="uil-stat-value">{stats?.rejected_this_week || 0}</div>
                  <div className="uil-stat-sub">This week</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Type Distribution */}
        {!loading && stats && (
          <>
            <div className="uil-section-header">
              <h2>Platform Users by Role</h2>
              <p>Total registered users across all roles</p>
            </div>

            <div className="uil-type-grid-compact">
              <div className="uil-type-card-compact">
                <div className="uil-type-icon-compact" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <GraduationCap size={20} strokeWidth={2.5} />
                </div>
                <div className="uil-type-info">
                  <div className="uil-type-value-compact">{stats.total_students || 0}</div>
                  <div className="uil-type-label-compact">Students</div>
                </div>
              </div>

              <div className="uil-type-card-compact">
                <div className="uil-type-icon-compact" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <Building2 size={20} strokeWidth={2.5} />
                </div>
                <div className="uil-type-info">
                  <div className="uil-type-value-compact">{stats.total_companies || 0}</div>
                  <div className="uil-type-label-compact">Companies</div>
                </div>
              </div>

              <div className="uil-type-card-compact">
                <div className="uil-type-icon-compact" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <UserCheck size={20} strokeWidth={2.5} />
                </div>
                <div className="uil-type-info">
                  <div className="uil-type-value-compact">{stats.total_advisors || 0}</div>
                  <div className="uil-type-label-compact">Advisors</div>
                </div>
              </div>

              <div className="uil-type-card-compact">
                <div className="uil-type-icon-compact" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                  <Building size={20} strokeWidth={2.5} />
                </div>
                <div className="uil-type-info">
                  <div className="uil-type-value-compact">{stats.total_departments || 0}</div>
                  <div className="uil-type-label-compact">Departments</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="uil-section-header">
          <h2>Quick Actions</h2>
          <p>Navigate to key management areas</p>
        </div>

        <div className="uil-actions-grid">
          <div className="uil-action-card primary" onClick={() => navigate('/uil/pending-registrations')}>
            <div className="uil-action-icon">
              <ClipboardList size={24} strokeWidth={2.5} />
            </div>
            <div className="uil-action-body">
              <h3>Pending Registrations</h3>
              <p>Verify and approve user registrations</p>
            </div>
            {pending > 0 && <div className="uil-action-badge">{pending}</div>}
            <ArrowRight className="uil-action-arrow" size={20} />
          </div>

          <div className="uil-action-card" onClick={() => navigate('/uil/manage-users')}>
            <div className="uil-action-icon">
              <Users size={24} strokeWidth={2.5} />
            </div>
            <div className="uil-action-body">
              <h3>User Management</h3>
              <p>Manage all approved platform users</p>
            </div>
            <ArrowRight className="uil-action-arrow" size={20} />
          </div>

          <div className="uil-action-card" onClick={() => navigate('/uil/system-overview')}>
            <div className="uil-action-icon">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <div className="uil-action-body">
              <h3>System Overview</h3>
              <p>Real-time system-wide statistics</p>
            </div>
            <ArrowRight className="uil-action-arrow" size={20} />
          </div>
        </div>

        {/* Recent Activity */}
        {!loading && stats?.recent_activity?.length > 0 && (
          <>
            <div className="uil-section-header">
              <h2>Recent Activity</h2>
              <p>Latest registration requests</p>
            </div>

            <div className="uil-activity-card">
              {stats.recent_activity.slice(0, 8).map((item, i) => (
                <div key={item.id || i} className="uil-activity-item">
                  <div className="uil-activity-left">
                    <div className={`uil-activity-type ${item.request_type.toLowerCase()}`}>
                      {item.request_type}
                    </div>
                    <div className="uil-activity-info">
                      <div className="uil-activity-email">{item.email}</div>
                      <div className="uil-activity-date">
                        <Clock size={12} />
                        {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="uil-activity-right">
                    <div className={`uil-status-badge ${item.status.toLowerCase()}`}>
                      {item.status}
                    </div>
                    <button
                      className="uil-view-btn"
                      onClick={() => navigate('/uil/pending-registrations')}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="uil-activity-footer">
                <button
                  className="uil-view-all-btn"
                  onClick={() => navigate('/uil/pending-registrations')}
                >
                  View all activity
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Alert Banner */}
        {pending > 0 && (
          <div className="uil-alert-banner">
            <div className="uil-alert-icon">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
            <div className="uil-alert-content">
              <h3>{pending} Registration{pending > 1 ? 's' : ''} Waiting</h3>
              <p>Users require verification to access the platform.</p>
            </div>
            <button
              className="uil-alert-btn"
              onClick={() => navigate('/uil/pending-registrations')}
            >
              Review Now
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UILDashboard;