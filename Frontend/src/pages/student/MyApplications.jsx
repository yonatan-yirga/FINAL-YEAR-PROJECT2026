/**
 * MyApplications Page - Premium Redesign (Table Format)
 * Student: view and manage own applications with compact glassmorphism
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import applicationService from '../../services/applicationService';
import { 
  ClipboardList, Clock, CheckCircle, XCircle, Search, 
  Eye, RefreshCw, Plus, ArrowRight, FileText, MapPin, 
  Briefcase, Building2, Timer, CheckCircle2, XOctagon, 
  Award, Calendar, TrendingUp
} from 'lucide-react';
import './MyApplications.css';

const MyApplications = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchApplications();
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await applicationService.getMyApplications();
      if (result.success && result.data) {
        const data = result.data.results || result.data;
        console.log('Applications data:', data); // Debug log
        setApplications(Array.isArray(data) ? data : []);
      } else {
        setError(result.error || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch {
      setError('An unexpected error occurred.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const applicationsArray = Array.isArray(applications) ? applications : [];
  
  const getFiltered = () =>
    filterStatus === 'ALL' ? applicationsArray : applicationsArray.filter(a => a.status === filterStatus);

  const counts = {
    all:      applicationsArray.length,
    pending:  applicationsArray.filter(a => a.status === 'PENDING').length,
    offered:  applicationsArray.filter(a => a.status === 'OFFERED').length,
    accepted: applicationsArray.filter(a => a.status === 'ACCEPTED').length,
    rejected: applicationsArray.filter(a => a.status === 'REJECTED').length,
  };

  const handleWithdraw = async (application) => {
    if (!window.confirm(`Withdraw application to ${application.internship_title}?`)) return;
    try {
      const result = await applicationService.withdrawApplication(application.id);
      if (result.success) {
        setSuccessMessage('Application withdrawn successfully');
        fetchApplications();
      } else {
        setError(result.error || 'Failed to withdraw application');
      }
    } catch {
      setError('Failed to withdraw application');
    }
  };

  const handleConfirm = async (application) => {
    if (!window.confirm(`Confirm your placement at ${application.company_name} for ${application.internship_title}? This action is final.`)) return;
    try {
      setLoading(true);
      const result = await applicationService.confirmPlacement(application.id);
      if (result.success) {
        setSuccessMessage('Placement confirmed successfully! Congratulations on your internship.');
        fetchApplications();
      } else {
        setError(result.error || 'Failed to confirm placement');
      }
    } catch {
      setError('An unexpected error occurred during confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = getFiltered();

  // Helper to render compact step dots in table format
  const renderCompactStepper = (status) => {
    let currentStage = 0;
    let activeColor = '#2563eb';
    let isRejected = false;
    let label = 'Under Review';

    if (status === 'PENDING') {
      currentStage = 1; // Stage 1 (Reviewing) is active
      activeColor = '#f59e0b';
      label = 'Under Review';
    } else if (status === 'OFFERED') {
      currentStage = 2; // Stage 2 (Offer) is active
      activeColor = '#6366f1';
      label = 'Offer Received';
    } else if (status === 'ACCEPTED') {
      currentStage = 3; // Stage 3 (Placed) is complete
      activeColor = '#10b981';
      label = 'Placed & Confirmed';
    } else if (status === 'REJECTED') {
      currentStage = 2;
      isRejected = true;
      activeColor = '#ef4444';
      label = 'Not Selected';
    }

    return (
      <div className="ma-compact-stepper">
        <div className="ma-compact-stepper-dots">
          {[0, 1, 2, 3].map((step) => {
            let dotClass = '';
            if (step < currentStage) {
              dotClass = 'ma-dot-done';
            } else if (step === currentStage) {
              dotClass = isRejected ? 'ma-dot-rejected' : 'ma-dot-active';
            } else {
              dotClass = 'ma-dot-pending';
            }
            return <div key={step} className={`ma-compact-dot ${dotClass}`} />;
          })}
        </div>
        <span className="ma-compact-stepper-label" style={{ color: activeColor }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="ma-page">
      <Header title="My Applications" subtitle="Track your internship application journey" />

      <div className="ma-content">
        {/* Feedback Alert Bar */}
        {successMessage && (
          <div className="ma-alert ma-alert-success">
            <span>✓ {successMessage}</span>
            <button onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}
        {error && (
          <div className="ma-alert ma-alert-error">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* 5-Column Stats Grid Dashboard */}
        <div className="ma-stats-grid">
          {/* Card 1: Total */}
          <div className="ma-stat-card" style={{ '--accent-color': '#2563eb', '--bg-light': '#eff6ff' }}>
            <div className="ma-stat-card-header">
              <span className="ma-stat-card-title">All Submissions</span>
              <div className="ma-stat-card-icon-wrapper">
                <ClipboardList />
              </div>
            </div>
            <div className="ma-stat-card-body">
              <span className="ma-stat-card-value">{counts.all}</span>
              <span className="ma-stat-card-label">Apps</span>
            </div>
          </div>

          {/* Card 2: Under Review */}
          <div className="ma-stat-card" style={{ '--accent-color': '#f59e0b', '--bg-light': '#fffbeb' }}>
            <div className="ma-stat-card-header">
              <span className="ma-stat-card-title">Under Review</span>
              <div className="ma-stat-card-icon-wrapper">
                <Clock />
              </div>
            </div>
            <div className="ma-stat-card-body">
              <span className="ma-stat-card-value">{counts.pending}</span>
              <span className="ma-stat-card-label">Review</span>
            </div>
          </div>

          {/* Card 3: Offers */}
          <div className="ma-stat-card" style={{ '--accent-color': '#6366f1', '--bg-light': '#f5f3ff' }}>
            <div className="ma-stat-card-header">
              <span className="ma-stat-card-title">Offers Recieved</span>
              <div className="ma-stat-card-icon-wrapper">
                <Award />
              </div>
            </div>
            <div className="ma-stat-card-body">
              <span className="ma-stat-card-value">{counts.offered}</span>
              <span className="ma-stat-card-label">Offers</span>
            </div>
          </div>

          {/* Card 4: Accepted */}
          <div className="ma-stat-card" style={{ '--accent-color': '#10b981', '--bg-light': '#f0fdf4' }}>
            <div className="ma-stat-card-header">
              <span className="ma-stat-card-title">Confirmed Placements</span>
              <div className="ma-stat-card-icon-wrapper">
                <CheckCircle />
              </div>
            </div>
            <div className="ma-stat-card-body">
              <span className="ma-stat-card-value">{counts.accepted}</span>
              <span className="ma-stat-card-label">Placed</span>
            </div>
          </div>

          {/* Card 5: Rejected */}
          <div className="ma-stat-card" style={{ '--accent-color': '#ef4444', '--bg-light': '#fef2f2' }}>
            <div className="ma-stat-card-header">
              <span className="ma-stat-card-title">Not Selected</span>
              <div className="ma-stat-card-icon-wrapper">
                <XCircle />
              </div>
            </div>
            <div className="ma-stat-card-body">
              <span className="ma-stat-card-value">{counts.rejected}</span>
              <span className="ma-stat-card-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Control Panel: Filter Chips + Refresh Trigger */}
        <div className="ma-control-panel">
          <div className="ma-filter-compact">
            {[
              { key: 'ALL', label: 'All', icon: ClipboardList },
              { key: 'PENDING', label: 'Reviewing', icon: Clock },
              { key: 'OFFERED', label: 'Offers', icon: Award },
              { key: 'ACCEPTED', label: 'Placed', icon: CheckCircle },
              { key: 'REJECTED', label: 'Rejected', icon: XCircle }
            ].map(({ key, label, icon: IconComponent }) => (
              <button
                key={key}
                className={`ma-filter-chip ${filterStatus === key ? 'active' : ''}`}
                onClick={() => setFilterStatus(key)}
              >
                <IconComponent />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            className="ma-refresh-btn-premium"
            onClick={fetchApplications}
            disabled={loading}
            title="Sync Database"
          >
            <RefreshCw className={loading ? 'spinning' : ''} />
          </button>
        </div>

        {/* Loading Widget */}
        {loading && (
          <div className="ma-loading-premium">
            <div className="ma-loading-spinner-wrapper">
              <div className="ma-loading-spinner-glow" />
              <div className="ma-loading-spinner" />
            </div>
            <p>Syncing applications with sector nodes...</p>
          </div>
        )}

        {/* Ultra-Premium Glassmorphic Table Layout */}
        {!loading && filtered.length > 0 && (
          <div className="ma-table-wrapper">
            <div className="ma-table-container">
              <table className="ma-table-premium">
                <thead>
                  <tr>
                    <th>
                      <div className="th-content">
                        <Briefcase />
                        <span>Position & Company</span>
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <Calendar />
                        <span>Applied Date</span>
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <MapPin />
                        <span>Location</span>
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <TrendingUp />
                        <span>Timeline Progress</span>
                      </div>
                    </th>
                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const statusConfig = {
                      PENDING: {
                        color: '#b45309',
                        bg: '#fef3c7',
                        border: 'rgba(245, 158, 11, 0.4)',
                        icon: Clock,
                        gradColor: '#f59e0b',
                        logoBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        logoColor: '#d97706'
                      },
                      OFFERED: {
                        color: '#4f46e5',
                        bg: '#e0e7ff',
                        border: 'rgba(99, 102, 241, 0.4)',
                        icon: Award,
                        gradColor: '#8b5cf6',
                        logoBg: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)',
                        logoColor: '#4f46e5'
                      },
                      ACCEPTED: {
                        color: '#047857',
                        bg: '#d1fae5',
                        border: 'rgba(16, 185, 129, 0.4)',
                        icon: CheckCircle2,
                        gradColor: '#10b981',
                        logoBg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        logoColor: '#059669'
                      },
                      REJECTED: {
                        color: '#b91c1c',
                        bg: '#fee2e2',
                        border: 'rgba(239, 68, 68, 0.4)',
                        icon: XOctagon,
                        gradColor: '#ef4444',
                        logoBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                        logoColor: '#dc2626'
                      }
                    };

                    const config = statusConfig[app.status] || statusConfig.PENDING;
                    const companyInitial = app.company_name ? app.company_name.charAt(0).toUpperCase() : 'C';

                    return (
                      <tr 
                        key={app.id} 
                        className="ma-table-row-premium"
                        style={{
                          '--status-color': config.gradColor,
                          '--logo-bg': config.logoBg,
                          '--logo-color': config.logoColor
                        }}
                      >
                        {/* 1. Position & Company */}
                        <td>
                          <div className="position-cell">
                            <div className="ma-app-logo">
                              {companyInitial}
                            </div>
                            <div className="position-info">
                              <span className="position-title" title={app.internship_title}>
                                {app.internship_title || 'Position Title'}
                              </span>
                              <div className="company-name">
                                <Building2 />
                                <span>{app.company_name || 'Company Name'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Applied Date */}
                        <td>
                          <div className="date-badge">
                            <Calendar />
                            <span>
                              {new Date(app.applied_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>

                        {/* 3. Location */}
                        <td>
                          <div className="location-badge">
                            <MapPin />
                            <span>{app.internship_location || 'Remote'}</span>
                          </div>
                        </td>

                        {/* 4. Timeline Progress */}
                        <td>
                          {renderCompactStepper(app.status)}
                        </td>

                        {/* 5. Actions */}
                        <td className="action-cell" style={{ paddingRight: '24px' }}>
                          <div className="ma-action-group">
                            <button
                              className="ma-btn-premium view"
                              onClick={() => navigate(`/student/internships/${app.internship}`)}
                              title="Inspect Internship Posting"
                            >
                              <Eye />
                              <span>View Sector</span>
                            </button>

                            {app.status === 'OFFERED' && (
                              <button
                                className="ma-btn-premium accept"
                                onClick={() => handleConfirm(app)}
                                title="Confirm Placement"
                              >
                                <CheckCircle2 />
                                <span>Accept Offer</span>
                              </button>
                            )}

                            {app.status === 'PENDING' && (
                              <button
                                className="ma-btn-premium withdraw"
                                onClick={() => handleWithdraw(app)}
                                title="Withdraw Application"
                              >
                                <XOctagon />
                                <span>Withdraw</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State Layout */}
        {!loading && filtered.length === 0 && (
          <div className="ma-empty-premium">
            <div className="ma-empty-particles-premium">
              <div className="ma-empty-particle" />
              <div className="ma-empty-particle" />
              <div className="ma-empty-particle" />
            </div>

            <div className="ma-empty-illustration-premium">
              <div className="ma-empty-icon-ring">
                <FileText size={38} strokeWidth={1.5} />
              </div>
            </div>

            <div className="ma-empty-text-group">
              <h2 className="ma-empty-title">Sector Logs Empty</h2>
              <p className="ma-empty-desc">
                {filterStatus === 'ALL'
                  ? 'No application transmissions registered. Connect with available industrial sectors to initialize your placement journey.'
                  : `No internship applications currently match the "${filterStatus.toLowerCase()}" status filter.`}
              </p>
            </div>

            {filterStatus === 'ALL' && (
              <div className="ma-empty-actions-premium">
                <button
                  className="ma-cta-btn-premium primary"
                  onClick={() => navigate('/student/search-internships')}
                >
                  <Search size={15} />
                  <span>Scan for Internships</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  className="ma-cta-btn-premium secondary"
                  onClick={() => navigate('/student/profile')}
                >
                  <Plus size={15} />
                  <span>Initialize Profile</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;