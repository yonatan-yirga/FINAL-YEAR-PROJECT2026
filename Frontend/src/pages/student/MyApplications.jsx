/**
 * MyApplications Page 
 * Student: view and manage own applications
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import ApplicationCard from '../../components/cards/ApplicationCard';
import applicationService from '../../services/applicationService';
import { 
  ClipboardList, Clock, CheckCircle, XCircle, Search, 
  Filter, TrendingUp, AlertCircle, FileText, Eye,
  RefreshCw, Plus, ArrowRight
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

  const getFiltered = () =>
    filterStatus === 'ALL' ? applications : applications.filter(a => a.status === filterStatus);

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === 'PENDING').length,
    offered:  applications.filter(a => a.status === 'OFFERED').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
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

  return (
    <div className="ma-page">
      <Header title="My Applications" subtitle="Track your internship application journey" />

      <div className="ma-content">

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

        {/* Compact Stats Bar - Upwork Style */}
        <div className="ma-stats-bar">
          <div className="ma-stats-compact">
            <div className="ma-stat-compact">
              <ClipboardList size={18} />
              <span className="ma-stat-compact-value">{counts.all}</span>
              <span className="ma-stat-compact-label">Applications</span>
            </div>
            
            <div className="ma-stat-divider" />
            
            <div className="ma-stat-compact">
              <Clock size={18} />
              <span className="ma-stat-compact-value">{counts.pending}</span>
              <span className="ma-stat-compact-label">Pending</span>
            </div>
            
            <div className="ma-stat-divider" />
            
            <div className="ma-stat-compact">
              <CheckCircle size={18} />
              <span className="ma-stat-compact-value">{counts.accepted}</span>
              <span className="ma-stat-compact-label">Accepted</span>
            </div>
            
            <div className="ma-stat-divider" />
            
            <div className="ma-stat-compact">
              <XCircle size={18} />
              <span className="ma-stat-compact-value">{counts.rejected}</span>
              <span className="ma-stat-compact-label">Rejected</span>
            </div>
          </div>
          
          <button 
            className="ma-refresh-btn-compact"
            onClick={fetchApplications}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        {/* Compact Filter Bar */}
        <div className="ma-filter-compact">
          {[
            { key: 'ALL', label: `All`, icon: ClipboardList },
            { key: 'PENDING', label: `Pending`, icon: Clock },
            { key: 'OFFERED', label: `Offers`, icon: Eye },
            { key: 'ACCEPTED', label: `Accepted`, icon: CheckCircle },
            { key: 'REJECTED', label: `Rejected`, icon: XCircle },
          ].map(({ key, label, icon: IconComponent }) => (
            <button
              key={key}
              className={`ma-filter-chip ${filterStatus === key ? 'active' : ''}`}
              onClick={() => setFilterStatus(key)}
            >
              <IconComponent size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="ma-loading">
            <div className="ma-spinner" />
            <p>Loading applications...</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="ma-grid">
            {filtered.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                userRole="STUDENT"
                onWithdraw={handleWithdraw}
                onConfirm={handleConfirm}
              />
            ))}
          </div>
        )}

        {/* Modern Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="ma-empty">
            <div className="ma-empty-illustration">
              <div className="ma-empty-icon-container">
                <FileText size={48} strokeWidth={1.5} />
              </div>
              <div className="ma-empty-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
            </div>
            
            <div className="ma-empty-content">
              <h2>No Applications Found</h2>
              <p>
                {filterStatus === 'ALL'
                  ? "Ready to start your internship journey? Browse available opportunities and submit your first application."
                  : `No applications match the "${filterStatus.toLowerCase()}" status filter.`}
              </p>
              
              {filterStatus === 'ALL' && (
                <div className="ma-empty-actions">
                  <button
                    className="ma-cta-btn primary"
                    onClick={() => navigate('/student/search-internships')}
                  >
                    <Search size={18} />
                    <span>Browse Internships</span>
                    <ArrowRight size={16} />
                  </button>
                  
                  <button
                    className="ma-cta-btn secondary"
                    onClick={() => navigate('/student/profile')}
                  >
                    <Plus size={18} />
                    <span>Complete Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;