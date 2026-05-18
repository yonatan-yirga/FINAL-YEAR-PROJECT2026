/**
 * Company Dashboard - Premium Modern Design
 * Purple-pink gradient theme with glassmorphism
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, Clock, CheckCircle, Plus, ClipboardList, 
  MessageSquare, FileText, Settings, AlertTriangle, TrendingUp,
  Target, Award, BarChart3, Rocket, UserCheck, Building2,
  Eye, Edit, Trash2, Lock, Unlock
} from 'lucide-react';
import Header from '../../components/common/Header';
import useAuth from '../../hooks/useAuth';
import applicationService from '../../services/applicationService';
import internshipService from '../../services/internshipService';
import authService from '../../services/authService';
import './CompanyDashboardPremium.css';

const CompanyDashboardPremium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);
  const [internships, setInternships] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      internshipService.getMyInternships(),
      applicationService.getCompanyApplications(),
      authService.getProfile(),
    ]).then(([iRes, aRes, pRes]) => {
      const ints = iRes.success ? (iRes.data?.results || iRes.data || []) : [];
      const apps = aRes.success ? (aRes.data?.results || aRes.data || []) : [];
      
      setCounts({
        total: ints.length,
        open: ints.filter(i => i.status === 'OPEN').length,
        closed: ints.filter(i => i.status === 'CLOSED').length,
        filled: ints.filter(i => i.status === 'FILLED').length,
        pending: apps.filter(a => a.status === 'PENDING').length,
        accepted: apps.filter(a => a.status === 'ACCEPTED').length,
        rejected: apps.filter(a => a.status === 'REJECTED').length,
        total_apps: apps.length,
      });
      
      setInternships(ints.slice(0, 4));
      setRecentApps(apps.slice(0, 5));
      
      if (pRes.success && pRes.data) {
        const p = pRes.data.profile || {};
        setProfile(p);
      }
      
      setLoading(false);
    });
  }, []);

  const isProfileIncomplete = !profile?.address || !profile?.phone_number || !profile?.website;

  return (
    <div className="cdp-page">
      <Header title="Company Dashboard" subtitle="Manage your internship programs and recruit top talent" />

      <div className="cdp-content">
        {/* Welcome Banner */}
        <div className="cdp-welcome">
          <div className="cdp-welcome-content">
            <div className="cdp-welcome-icon">
              <Building2 size={32} strokeWidth={2.5} />
            </div>
            <div className="cdp-welcome-text">
              <div className="cdp-welcome-greeting">Welcome back, {(user?.full_name || 'User').split(' ')[0]}!</div>
              <div className="cdp-welcome-subtitle">
                {user?.department_name || 'Company Admin'} · Manage your internship programs
              </div>
              <div className="cdp-welcome-tagline">
                Source top talent, manage active internships, and track the progress of your professional cohorts.
              </div>
            </div>
          </div>
        </div>

        {/* Profile Incomplete Alert */}
        {isProfileIncomplete && !loading && (
          <div className="cdp-alert cdp-alert-warning">
            <div className="cdp-alert-icon">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <div className="cdp-alert-content">
              <div className="cdp-alert-title">Complete Your Company Profile</div>
              <div className="cdp-alert-text">
                Your contact information is missing. Fill it out to make your profile visible to students.
              </div>
            </div>
            <button className="cdp-alert-btn" onClick={() => navigate('/settings')}>
              Complete Now →
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="cdp-stats-grid">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="cdp-stat-skeleton" />
              ))}
            </>
          ) : (
            <>
              <div className="cdp-stat-card">
                <div className="cdp-stat-icon cdp-icon-purple">
                  <Briefcase size={24} strokeWidth={2.5} />
                </div>
                <div className="cdp-stat-body">
                  <div className="cdp-stat-label">Total Postings</div>
                  <div className="cdp-stat-value">{counts?.total || 0}</div>
                </div>
              </div>

              <div className="cdp-stat-card">
                <div className="cdp-stat-icon cdp-icon-green">
                  <CheckCircle size={24} strokeWidth={2.5} />
                </div>
                <div className="cdp-stat-body">
                  <div className="cdp-stat-label">Open Positions</div>
                  <div className="cdp-stat-value cdp-val-green">{counts?.open || 0}</div>
                </div>
              </div>

              <div className="cdp-stat-card">
                <div className="cdp-stat-icon cdp-icon-yellow">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
                <div className="cdp-stat-body">
                  <div className="cdp-stat-label">Pending Review</div>
                  <div className="cdp-stat-value cdp-val-yellow">{counts?.pending || 0}</div>
                </div>
              </div>

              <div className="cdp-stat-card">
                <div className="cdp-stat-icon cdp-icon-blue">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <div className="cdp-stat-body">
                  <div className="cdp-stat-label">Total Applicants</div>
                  <div className="cdp-stat-value cdp-val-blue">{counts?.total_apps || 0}</div>
                </div>
              </div>

              <div className="cdp-stat-card">
                <div className="cdp-stat-icon cdp-icon-green">
                  <UserCheck size={24} strokeWidth={2.5} />
                </div>
                <div className="cdp-stat-body">
                  <div className="cdp-stat-label">Accepted</div>
                  <div className="cdp-stat-value cdp-val-green">{counts?.accepted || 0}</div>
                </div>
              </div>

              <div className="cdp-stat-card">
                <div className="cdp-stat-icon cdp-icon-gray">
                  <Target size={24} strokeWidth={2.5} />
                </div>
                <div className="cdp-stat-body">
                  <div className="cdp-stat-label">Filled Positions</div>
                  <div className="cdp-stat-value cdp-val-gray">{counts?.filled || 0}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="cdp-section-title">Quick Actions</div>
        <div className="cdp-actions-grid">
          <div className="cdp-action-card cdp-action-primary" onClick={() => navigate('/company/post-internship')}>
            <div className="cdp-action-icon">
              <Plus size={28} strokeWidth={2.5} />
            </div>
            <div className="cdp-action-content">
              <div className="cdp-action-label">Post New Internship</div>
              <div className="cdp-action-desc">Create a new opportunity for students</div>
            </div>
            <div className="cdp-action-arrow">→</div>
          </div>

          <div className="cdp-action-card" onClick={() => navigate('/company/applications')}>
            <div className="cdp-action-icon">
              <ClipboardList size={28} strokeWidth={2.5} />
            </div>
            <div className="cdp-action-content">
              <div className="cdp-action-label">Review Applications</div>
              <div className="cdp-action-desc">Manage student applications</div>
            </div>
            <div className="cdp-action-arrow">→</div>
          </div>

          <div className="cdp-action-card" onClick={() => navigate('/company/my-internships')}>
            <div className="cdp-action-icon">
              <Briefcase size={28} strokeWidth={2.5} />
            </div>
            <div className="cdp-action-content">
              <div className="cdp-action-label">My Internships</div>
              <div className="cdp-action-desc">Manage your postings</div>
            </div>
            <div className="cdp-action-arrow">→</div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="cdp-section-title">Management & Communication</div>
        <div className="cdp-secondary-grid">
          <div className="cdp-secondary-card" onClick={() => navigate('/company/messages')}>
            <div className="cdp-secondary-icon">
              <MessageSquare size={20} strokeWidth={2.5} />
            </div>
            <div className="cdp-secondary-label">Messages</div>
            <div className="cdp-secondary-desc">Chat with students</div>
          </div>

          <div className="cdp-secondary-card" onClick={() => navigate('/company/report-submission')}>
            <div className="cdp-secondary-icon">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <div className="cdp-secondary-label">Monthly Reports</div>
            <div className="cdp-secondary-desc">Submit progress reports</div>
          </div>

          <div className="cdp-secondary-card" onClick={() => navigate('/settings')}>
            <div className="cdp-secondary-icon">
              <Settings size={20} strokeWidth={2.5} />
            </div>
            <div className="cdp-secondary-label">Settings</div>
            <div className="cdp-secondary-desc">Update your profile</div>
          </div>
        </div>

        {/* Recent Activity */}
        {!loading && recentApps.length > 0 && (
          <>
            <div className="cdp-section-title">Recent Applications</div>
            <div className="cdp-activity-card">
              {recentApps.map((app, idx) => (
                <div key={app.id} className="cdp-activity-item" onClick={() => navigate('/company/applications')}>
                  <div className="cdp-activity-avatar">
                    <Users size={18} strokeWidth={2.5} />
                  </div>
                  <div className="cdp-activity-content">
                    <div className="cdp-activity-name">{app.student_name || 'Student'}</div>
                    <div className="cdp-activity-desc">Applied for {app.internship_title || 'position'}</div>
                  </div>
                  <div className={`cdp-activity-badge cdp-badge-${app.status?.toLowerCase()}`}>
                    {app.status || 'PENDING'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboardPremium;
