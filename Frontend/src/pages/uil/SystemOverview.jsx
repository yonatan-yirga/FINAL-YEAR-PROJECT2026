/**
 * SystemOverview - Premium Design with Charts
 * UIL: system-wide statistics dashboard with beautiful visualizations
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import uilService from '../../services/uilService';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Briefcase, FileText, Award, TrendingUp, Activity,
  UserCheck, Building2, GraduationCap, Building, CheckCircle,
  XCircle, Clock, Zap, Target, ArrowRight
} from 'lucide-react';
import './SystemOverview.css';

const SystemOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    uilService.getSystemStats()
      .then(res => {
        if (res.success) setStats(res.data);
        else setError(res.error || 'Failed to load system statistics.');
      })
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="system-overview-premium">
        <Header title="System Overview" subtitle="Comprehensive platform analytics" />
        <div className="system-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userRoleData = stats ? [
    { name: 'Students', value: stats.users?.students || 0, color: '#3b82f6' },
    { name: 'Companies', value: stats.users?.companies || 0, color: '#f59e0b' },
    { name: 'Advisors', value: stats.users?.advisors || 0, color: '#10b981' },
    { name: 'Departments', value: stats.users?.department_heads || 0, color: '#8b5cf6' },
  ] : [];

  const internshipStatusData = stats ? [
    { name: 'Open', value: stats.internships?.open || 0, color: '#10b981' },
    { name: 'Filled', value: stats.internships?.filled || 0, color: '#3b82f6' },
    { name: 'Closed', value: stats.internships?.closed || 0, color: '#6b7280' },
  ] : [];

  const applicationStatusData = stats ? [
    { name: 'Pending', Applications: stats.applications?.pending || 0 },
    { name: 'Accepted', Applications: stats.applications?.accepted || 0 },
    { name: 'Rejected', Applications: stats.applications?.rejected || 0 },
  ] : [];

  return (
    <div className="system-overview-premium">
      <Header title="System Overview" subtitle="Comprehensive platform analytics" />

      <div className="system-content">
        {/* Error Alert */}
        {error && (
          <div className="system-alert system-alert-error">
            <Zap size={18} />
            <span>{error}</span>
          </div>
        )}

        {stats && (
          <>
            {/* Top KPI Cards */}
            <div className="system-kpi-grid">
              <div className="system-kpi-card primary">
                <div className="system-kpi-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <Users size={22} strokeWidth={2.5} />
                </div>
                <div className="system-kpi-content">
                  <div className="system-kpi-label">Total Users</div>
                  <div className="system-kpi-value">{stats.users?.total || 0}</div>
                  <div className="system-kpi-sub">
                    <TrendingUp size={11} />
                    +{stats.new_users_this_month || 0} this month
                  </div>
                </div>
              </div>

              <div className="system-kpi-card success">
                <div className="system-kpi-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <Briefcase size={22} strokeWidth={2.5} />
                </div>
                <div className="system-kpi-content">
                  <div className="system-kpi-label">Active Internships</div>
                  <div className="system-kpi-value">{stats.active_internships || 0}</div>
                  <div className="system-kpi-sub">Students currently placed</div>
                </div>
              </div>

              <div className="system-kpi-card warning">
                <div className="system-kpi-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <Target size={22} strokeWidth={2.5} />
                </div>
                <div className="system-kpi-content">
                  <div className="system-kpi-label">Open Positions</div>
                  <div className="system-kpi-value">{stats.internships?.open || 0}</div>
                  <div className="system-kpi-sub">Accepting applications</div>
                </div>
              </div>

              <div className="system-kpi-card danger">
                <div className="system-kpi-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                  <Clock size={22} strokeWidth={2.5} />
                </div>
                <div className="system-kpi-content">
                  <div className="system-kpi-label">Pending Registrations</div>
                  <div className="system-kpi-value">{stats.pending_registrations || 0}</div>
                  <div className="system-kpi-sub">Awaiting approval</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="system-charts-grid">
              {/* User Distribution Pie Chart */}
              <div className="system-chart-card">
                <div className="system-chart-header">
                  <div className="system-chart-title">
                    <Users size={18} strokeWidth={2.5} />
                    <h3>User Distribution by Role</h3>
                  </div>
                  <p>Platform user breakdown</p>
                </div>
                <div className="system-chart-body">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={85}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="system-chart-legend">
                    {userRoleData.map((item, idx) => (
                      <div key={idx} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Internship Status Pie Chart */}
              <div className="system-chart-card">
                <div className="system-chart-header">
                  <div className="system-chart-title">
                    <Briefcase size={18} strokeWidth={2.5} />
                    <h3>Internship Status</h3>
                  </div>
                  <p>Current internship distribution</p>
                </div>
                <div className="system-chart-body">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={internshipStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={85}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {internshipStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="system-chart-legend">
                    {internshipStatusData.map((item, idx) => (
                      <div key={idx} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Status Bar Chart */}
            <div className="system-chart-card-full">
              <div className="system-chart-header">
                <div className="system-chart-title">
                  <FileText size={18} strokeWidth={2.5} />
                  <h3>Application Status Overview</h3>
                </div>
                <p>Total applications: {stats.applications?.total || 0}</p>
              </div>
              <div className="system-chart-body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={applicationStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }}
                    />
                    <Bar dataKey="Applications" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="system-stats-grid">
              {/* Internships Stats */}
              <div className="system-stats-card">
                <div className="system-stats-header">
                  <Briefcase size={16} strokeWidth={2.5} />
                  <h4>Internships</h4>
                </div>
                <div className="system-stats-items">
                  <div className="system-stat-item">
                    <span className="stat-label">Total Posted</span>
                    <span className="stat-value">{stats.internships?.total || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Filled</span>
                    <span className="stat-value success">{stats.internships?.filled || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Open</span>
                    <span className="stat-value warning">{stats.internships?.open || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Closed</span>
                    <span className="stat-value muted">{stats.internships?.closed || 0}</span>
                  </div>
                </div>
              </div>

              {/* Applications Stats */}
              <div className="system-stats-card">
                <div className="system-stats-header">
                  <FileText size={16} strokeWidth={2.5} />
                  <h4>Applications</h4>
                </div>
                <div className="system-stats-items">
                  <div className="system-stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{stats.applications?.total || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value warning">{stats.applications?.pending || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Accepted</span>
                    <span className="stat-value success">{stats.applications?.accepted || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Rejected</span>
                    <span className="stat-value danger">{stats.applications?.rejected || 0}</span>
                  </div>
                </div>
              </div>

              {/* Reports Stats */}
              <div className="system-stats-card">
                <div className="system-stats-header">
                  <Activity size={16} strokeWidth={2.5} />
                  <h4>Reports & Certificates</h4>
                </div>
                <div className="system-stats-items">
                  <div className="system-stat-item">
                    <span className="stat-label">Monthly Reports</span>
                    <span className="stat-value">{stats.reports?.monthly_total || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Final Completed</span>
                    <span className="stat-value success">{stats.reports?.final_completed || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Final Pending</span>
                    <span className="stat-value warning">{stats.reports?.final_pending || 0}</span>
                  </div>
                  <div className="system-stat-item">
                    <span className="stat-label">Certificates Issued</span>
                    <span className="stat-value">{stats.certificates?.issued || 0}</span>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default SystemOverview;
