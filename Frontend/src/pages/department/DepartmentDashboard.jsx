/**
 * Department Dashboard - Modern UI/UX Design
 * Strategic command center for department heads
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import useAuth from '../../hooks/useAuth';
import departmentService from '../../services/departmentService';
import notificationService from '../../services/notificationService';
import { 
  Users, UserCheck, Building2, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Award, FileText, Bell, ArrowRight,
  BarChart3, Shield, Target, Zap, RefreshCw, Eye, Plus,
  Calendar, MapPin, Phone, Mail, Settings, Activity
} from 'lucide-react';
import './DepartmentDashboard.css';

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [intel, setIntel] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, intelRes, notifsRes] = await Promise.all([
        departmentService.getStatistics(),
        departmentService.getDecisionIntelligence(),
        notificationService.getRecentNotifications()
      ]);
      
      if (statsRes.success) setStats(statsRes.data);
      if (intelRes.success) setIntel(intelRes.data);
      if (notifsRes.success) setNotifications(notifsRes.data?.slice(0, 5) || []);
      
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const name = (user?.full_name || user?.email || 'Head').split(' ')[0];
  const hasPending = (stats?.pending_assignments || 0) > 0;
  const hasOverloaded = (intel?.overloaded_advisors_count || 0) > 0;
  const hasEscalations = (intel?.critical_escalations?.length || 0) > 0;

  // Calculate trend visualization
  const maxTrend = intel ? Math.max(...intel.placement_trends?.map(t => t.count) || [1], 1) : 1;

  const getNotificationIcon = (type) => {
    const icons = {
      REGISTRATION_APPROVED: CheckCircle,
      APPLICATION_ACCEPTED: CheckCircle,
      APPLICATION_REJECTED: AlertTriangle,
      FEEDBACK_RECEIVED: Bell,
      REPORT_SUBMITTED: FileText,
      INTERNSHIP_COMPLETED: Award,
      GENERAL: Bell,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      REGISTRATION_APPROVED: '#15803D',
      APPLICATION_ACCEPTED: '#15803D',
      APPLICATION_REJECTED: '#DC2626',
      FEEDBACK_RECEIVED: '#0284C7',
      REPORT_SUBMITTED: '#D97706',
      INTERNSHIP_COMPLETED: '#7C2D12',
      GENERAL: '#64748B',
    };
    return colors[type] || '#64748B';
  };

  return (
    <div className="dd-page">
      <Header 
        title="Department Command Center" 
        subtitle="Strategic oversight and academic operations management" 
      />

      <div className="dd-content">
        
        {/* Welcome Banner */}
        <div className="dd-welcome-banner">
          <div className="dd-welcome-content">
            <div className="dd-welcome-text">
              <div className="dd-welcome-badge">Strategic Controller</div>
              <h1 className="dd-welcome-title">Welcome back, {name}</h1>
              <p className="dd-welcome-subtitle">
                You have {intel?.overloaded_advisors_count || 0} policy violations and {intel?.critical_escalations?.length || 0} active escalations requiring attention.
              </p>
            </div>
            
            {intel && (
              <div className="dd-welcome-stats">
                <div className="dd-welcome-stat">
                  <div className="dd-stat-value">{intel.placement_rate || 0}%</div>
                  <div className="dd-stat-label">Placement Rate</div>
                </div>
                <div className="dd-welcome-stat">
                  <div className="dd-stat-value">{intel.avg_performance_score || 0}</div>
                  <div className="dd-stat-label">Avg Performance</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="dd-welcome-decoration" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="dd-alert dd-alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button 
              className="dd-retry-btn"
              onClick={fetchDashboardData}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Critical Alerts */}
        {(hasPending || hasOverloaded || hasEscalations) && (
          <div className="dd-critical-alerts">
            {hasPending && (
              <div className="dd-critical-alert">
                <div className="dd-alert-icon">
                  <Clock size={18} />
                </div>
                <div className="dd-alert-content">
                  <h3>Pending Assignments</h3>
                  <p>{stats?.pending_assignments} students awaiting advisor assignment</p>
                </div>
                <button 
                  className="dd-alert-action"
                  onClick={() => navigate('/department/assign-advisor')}
                >
                  Assign Now
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            
            {hasOverloaded && (
              <div className="dd-critical-alert">
                <div className="dd-alert-icon dd-alert-warning">
                  <AlertTriangle size={18} />
                </div>
                <div className="dd-alert-content">
                  <h3>Overloaded Advisors</h3>
                  <p>{intel?.overloaded_advisors_count} advisors exceeding capacity</p>
                </div>
                <button 
                  className="dd-alert-action"
                  onClick={() => navigate('/department/advisors')}
                >
                  Review
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            
            {hasEscalations && (
              <div className="dd-critical-alert">
                <div className="dd-alert-icon dd-alert-error">
                  <Shield size={18} />
                </div>
                <div className="dd-alert-content">
                  <h3>Active Escalations</h3>
                  <p>{intel?.critical_escalations?.length} cases requiring intervention</p>
                </div>
                <button 
                  className="dd-alert-action"
                  onClick={() => navigate('/department/escalations')}
                >
                  Handle
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Grid */}
        <div className="dd-main-grid">
          
          {/* Left Column */}
          <div className="dd-left-column">
            
            {/* Key Metrics */}
            <div className="dd-metrics-grid">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="dd-metric-card dd-skeleton" />
                ))
              ) : (
                <>
                  <div 
                    className="dd-metric-card dd-metric-clickable"
                    onClick={() => navigate('/department/students')}
                  >
                    <div className="dd-metric-icon dd-icon-blue">
                      <Users size={18} />
                    </div>
                    <div className="dd-metric-body">
                      <span className="dd-metric-label">Total Students</span>
                      <span className="dd-metric-value">{stats?.total_students || 0}</span>
                    </div>
                    <div className="dd-metric-trend">
                      <TrendingUp size={14} />
                    </div>
                  </div>
                  
                  <div 
                    className="dd-metric-card dd-metric-clickable"
                    onClick={() => navigate('/department/advisors')}
                  >
                    <div className="dd-metric-icon dd-icon-green">
                      <UserCheck size={18} />
                    </div>
                    <div className="dd-metric-body">
                      <span className="dd-metric-label">Active Advisors</span>
                      <span className="dd-metric-value">{stats?.total_advisors || 0}</span>
                    </div>
                    <div className="dd-metric-pulse" />
                  </div>
                  
                  <div 
                    className="dd-metric-card dd-metric-clickable"
                    onClick={() => navigate('/department/companies')}
                  >
                    <div className="dd-metric-icon dd-icon-purple">
                      <Building2 size={18} />
                    </div>
                    <div className="dd-metric-body">
                      <span className="dd-metric-label">Partner Companies</span>
                      <span className="dd-metric-value">{stats?.total_companies || 0}</span>
                    </div>
                  </div>
                  
                  <div className="dd-metric-card">
                    <div className="dd-metric-icon dd-icon-gold">
                      <Award size={18} />
                    </div>
                    <div className="dd-metric-body">
                      <span className="dd-metric-label">Completion Rate</span>
                      <span className="dd-metric-value">
                        {stats?.completion_rate != null ? `${stats.completion_rate}%` : '—'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Placement Trends */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <BarChart3 size={16} />
                  Placement Trends (6 Months)
                </h3>
              </div>
              
              <div className="dd-chart-container">
                {intel?.placement_trends?.length > 0 ? (
                  <div className="dd-trend-chart">
                    {intel.placement_trends.map((trend, i) => (
                      <div key={i} className="dd-trend-bar">
                        <div 
                          className="dd-trend-fill"
                          style={{ height: `${(trend.count / maxTrend) * 100}%` }}
                        >
                          <span className="dd-trend-value">{trend.count}</span>
                        </div>
                        <span className="dd-trend-label">{trend.month}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dd-chart-empty">
                    <BarChart3 size={36} />
                    <p>No trend data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Advisor Performance */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <UserCheck size={16} />
                  Advisor Performance Overview
                </h3>
                <button 
                  className="dd-card-action"
                  onClick={() => navigate('/department/advisors')}
                >
                  View All
                  <ArrowRight size={14} />
                </button>
              </div>
              
              <div className="dd-advisor-table">
                {intel?.overloaded_advisors?.length > 0 ? (
                  <div className="dd-table-container">
                    <table className="dd-table">
                      <thead>
                        <tr>
                          <th>Advisor</th>
                          <th>Workload</th>
                          <th>Success Rate</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intel.overloaded_advisors.slice(0, 5).map((advisor, i) => (
                          <tr key={i}>
                            <td>
                              <div className="dd-advisor-info">
                                <div className="dd-advisor-avatar">
                                  {advisor.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                  <div className="dd-advisor-name">{advisor.name}</div>
                                  <div className="dd-advisor-email">{advisor.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="dd-workload-bar">
                                <div 
                                  className="dd-workload-fill"
                                  style={{ 
                                    width: `${(advisor.count / (advisor.max || 15)) * 100}%`,
                                    backgroundColor: advisor.count > (advisor.max || 15) ? '#DC2626' : '#15803D'
                                  }}
                                />
                                <span className="dd-workload-text">
                                  {advisor.count}/{advisor.max || 15}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="dd-success-rate">
                                {advisor.success_rate || 94}%
                              </span>
                            </td>
                            <td>
                              <span 
                                className={`dd-status-badge ${
                                  advisor.count > (advisor.max || 15) ? 'dd-status-error' : 'dd-status-success'
                                }`}
                              >
                                {advisor.count > (advisor.max || 15) ? 'Overloaded' : 'Normal'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="dd-table-empty">
                    <CheckCircle size={36} />
                    <p>All advisors are within capacity limits</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <Zap size={16} />
                  Authority Actions
                </h3>
              </div>
              
              <div className="dd-actions-grid">
                <button 
                  className="dd-action-card dd-action-primary"
                  onClick={() => navigate('/department/validate-students')}
                >
                  <Shield size={18} />
                  <div className="dd-action-content">
                    <span className="dd-action-title">Validate Eligibility</span>
                    <span className="dd-action-subtitle">Confirm student status</span>
                  </div>
                </button>
                
                <button 
                  className={`dd-action-card ${hasEscalations ? 'dd-action-warning' : ''}`}
                  onClick={() => navigate('/department/escalations')}
                >
                  <AlertTriangle size={18} />
                  <div className="dd-action-content">
                    <span className="dd-action-title">Escalation Inbox</span>
                    <span className="dd-action-subtitle">
                      {intel?.critical_escalations?.length || 0} active cases
                    </span>
                  </div>
                </button>
                
                <button 
                  className="dd-action-card"
                  onClick={() => navigate('/department/cycles')}
                >
                  <Calendar size={18} />
                  <div className="dd-action-content">
                    <span className="dd-action-title">Cycle Management</span>
                    <span className="dd-action-subtitle">Manage deadlines</span>
                  </div>
                </button>
                
                <button 
                  className="dd-action-card"
                  onClick={() => navigate('/department/reports')}
                >
                  <FileText size={18} />
                  <div className="dd-action-content">
                    <span className="dd-action-title">Final Reports</span>
                    <span className="dd-action-subtitle">Review submissions</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="dd-right-column">
            
            {/* Risk Assessment */}
            <div className={`dd-card ${(hasOverloaded || hasPending) ? 'dd-card-warning' : 'dd-card-success'}`}>
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <Activity size={16} />
                  Risk Assessment
                </h3>
              </div>
              
              <div className="dd-risk-metrics">
                <div className="dd-risk-item">
                  <span className="dd-risk-label">Pending Assignments</span>
                  <span className={`dd-risk-value ${hasPending ? 'dd-risk-error' : 'dd-risk-success'}`}>
                    {stats?.pending_assignments || 0}
                  </span>
                </div>
                
                <div className="dd-risk-item">
                  <span className="dd-risk-label">Overloaded Advisors</span>
                  <span className={`dd-risk-value ${hasOverloaded ? 'dd-risk-error' : 'dd-risk-success'}`}>
                    {intel?.overloaded_advisors_count || 0}
                  </span>
                </div>
                
                <div className="dd-risk-item">
                  <span className="dd-risk-label">Missing Reports</span>
                  <span className="dd-risk-value dd-risk-warning">
                    {intel?.missing_reports_count || 0}
                  </span>
                </div>
              </div>
              
              {(hasOverloaded || hasPending) && (
                <button 
                  className="dd-risk-action"
                  onClick={() => navigate(hasPending ? '/department/assign-advisor' : '/department/advisors')}
                >
                  {hasPending ? 'Assign Advisors' : 'Resolve Overloads'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <Bell size={16} />
                  Recent Notifications
                </h3>
                <button 
                  className="dd-card-action"
                  onClick={() => navigate('/notifications')}
                >
                  View All
                  <ArrowRight size={14} />
                </button>
              </div>
              
              <div className="dd-notifications">
                {notifications.length === 0 ? (
                  <div className="dd-notifications-empty">
                    <Bell size={28} />
                    <p>All caught up!</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    const IconComponent = getNotificationIcon(notification.notification_type);
                    const color = getNotificationColor(notification.notification_type);
                    
                    return (
                      <div 
                        key={notification.id} 
                        className="dd-notification-item"
                        onClick={() => navigate(notification.link || '/notifications')}
                      >
                        <div 
                          className="dd-notification-icon"
                          style={{ color }}
                        >
                          <IconComponent size={14} />
                        </div>
                        
                        <div className="dd-notification-content">
                          <div className={`dd-notification-title ${!notification.is_read ? 'dd-unread' : ''}`}>
                            {notification.title}
                          </div>
                          <div className="dd-notification-time">
                            {notification.time_ago}
                          </div>
                        </div>
                        
                        {!notification.is_read && (
                          <div className="dd-notification-dot" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* At-Risk Students */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <Target size={16} />
                  At-Risk Students
                </h3>
              </div>
              
              <div className="dd-risk-students">
                {intel?.at_risk_students?.length === 0 ? (
                  <div className="dd-risk-empty">
                    <CheckCircle size={28} />
                    <p>System compliance is 100%</p>
                  </div>
                ) : (
                  intel?.at_risk_students?.map((student, i) => (
                    <div key={i} className="dd-risk-student">
                      <div className="dd-risk-student-icon">
                        <AlertTriangle size={14} />
                      </div>
                      <div className="dd-risk-student-info">
                        <div className="dd-risk-student-name">{student.name}</div>
                        <div className="dd-risk-student-reason">{student.reason}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="dd-card">
              <div className="dd-card-header">
                <h3 className="dd-card-title">
                  <Plus size={16} />
                  Quick Navigation
                </h3>
              </div>
              
              <div className="dd-quick-links">
                {[
                  { icon: Users, label: 'Students', path: '/department/students' },
                  { icon: UserCheck, label: 'Advisors', path: '/department/advisors' },
                  { icon: Building2, label: 'Companies', path: '/department/companies' },
                  { icon: Target, label: 'Assign Company', path: '/department/assign-company' },
                  { icon: UserCheck, label: 'Add Advisor', path: '/department/add-advisor' },
                  { icon: FileText, label: 'Reports', path: '/department/reports' },
                  { icon: Award, label: 'Certificates', path: '/department/students-completion' },
                  { icon: Settings, label: 'Settings', path: '/settings' },
                ].map(({ icon: IconComponent, label, path }) => (
                  <button 
                    key={label}
                    className="dd-quick-link"
                    onClick={() => navigate(path)}
                  >
                    <IconComponent size={14} />
                    <span>{label}</span>
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;