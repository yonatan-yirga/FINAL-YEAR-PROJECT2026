/**
 * Escalations Page - Modern UI/UX Design
 * Authority Inbox for Department Head to handle strategic interventions
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  AlertTriangle, CheckCircle, Shield, Plus, MessageSquare, Send,
  X, RefreshCw, Filter, Search, Clock, User, Building2, FileText,
  ArrowRight, AlertCircle, TrendingUp, Zap
} from 'lucide-react';
import './Escalations.css';

const Escalations = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [formData, setFormData] = useState({
    issue_type: 'OTHER',
    title: '',
    description: '',
    student_id: '',
    advisor_id: '',
    company_id: '',
  });

  useEffect(() => {
    fetchEscalations();
  }, [statusFilter]);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getEscalations({ status: statusFilter });
      
      if (response.success) {
        setEscalations(response.data.escalations || []);
        setError('');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedEscalation || !resolutionNotes.trim()) {
      setError('Please enter resolution notes');
      return;
    }

    try {
      const response = await departmentService.resolveEscalation(selectedEscalation.id, {
        resolution_notes: resolutionNotes
      });

      if (response.success) {
        setSuccess('Escalation resolved successfully');
        setShowResolveModal(false);
        setResolutionNotes('');
        setSelectedEscalation(null);
        fetchEscalations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to resolve escalation');
    }
  };

  const handleEscalateToUIL = async () => {
    if (!selectedEscalation || !escalationReason.trim()) {
      setError('Please enter escalation reason');
      return;
    }

    try {
      const response = await departmentService.escalateToUIL(selectedEscalation.id, {
        escalation_reason: escalationReason
      });

      if (response.success) {
        setSuccess('Issue escalated to UIL successfully');
        setEscalationReason('');
        setSelectedEscalation(null);
        fetchEscalations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to escalate to UIL');
    }
  };

  const handleCreateEscalation = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await departmentService.createEscalation(formData);

      if (response.success) {
        setSuccess('Escalation created successfully');
        setShowModal(false);
        setFormData({
          issue_type: 'OTHER',
          title: '',
          description: '',
          student_id: '',
          advisor_id: '',
          company_id: '',
        });
        fetchEscalations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to create escalation');
    }
  };

  const getStats = () => {
    return {
      open: escalations.filter(e => e.status === 'OPEN').length,
      resolved: escalations.filter(e => e.status === 'RESOLVED').length,
      escalatedToUIL: escalations.filter(e => e.status === 'ESCALATED_TO_UIL').length,
    };
  };

  const stats = getStats();

  const filteredEscalations = escalations.filter(esc =>
    esc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    esc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (esc.student_name && esc.student_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getIssueTypeColor = (type) => {
    const colors = {
      FAILING_STUDENT: '#DC2626',
      INACTIVE_ADVISOR: '#D97706',
      COMPANY_ISSUE: '#9333EA',
      PLACEMENT_CONFLICT: '#0284C7',
      OTHER: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  const getIssueTypeIcon = (type) => {
    const icons = {
      FAILING_STUDENT: AlertTriangle,
      INACTIVE_ADVISOR: Clock,
      COMPANY_ISSUE: Building2,
      PLACEMENT_CONFLICT: Zap,
      OTHER: AlertCircle,
    };
    return icons[type] || AlertCircle;
  };

  const getIssueTypeLabel = (type) => {
    const labels = {
      FAILING_STUDENT: 'Student Performance Risk',
      INACTIVE_ADVISOR: 'Advisor Inactivity',
      COMPANY_ISSUE: 'Company Policy Violation',
      PLACEMENT_CONFLICT: 'Placement Conflict',
      OTHER: 'Other Strategic Issue',
    };
    return labels[type] || type;
  };

  return (
    <div className="esc-page">
      <Header 
        title="Escalation Command Inbox" 
        subtitle="Manage formal interventions and strategic policy violations" 
      />
      
      <div className="esc-content">
        
        {/* Success Alert */}
        {success && (
          <div className="esc-alert esc-alert-success">
            <CheckCircle size={20} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="esc-alert esc-alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button 
              className="esc-retry-btn"
              onClick={fetchEscalations}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="esc-stats-grid">
          <div className="esc-stat-card esc-stat-primary">
            <div className="esc-stat-icon esc-icon-red">
              <AlertTriangle size={18} />
            </div>
            <div className="esc-stat-body">
              <span className="esc-stat-label">Open Issues</span>
              <span className="esc-stat-value">{stats.open}</span>
            </div>
            {stats.open > 0 && <div className="esc-stat-pulse" />}
          </div>

          <div className="esc-stat-card">
            <div className="esc-stat-icon esc-icon-green">
              <CheckCircle size={18} />
            </div>
            <div className="esc-stat-body">
              <span className="esc-stat-label">Resolved</span>
              <span className="esc-stat-value">{stats.resolved}</span>
            </div>
          </div>

          <div className="esc-stat-card">
            <div className="esc-stat-icon esc-icon-purple">
              <Shield size={18} />
            </div>
            <div className="esc-stat-body">
              <span className="esc-stat-label">Escalated to UIL</span>
              <span className="esc-stat-value">{stats.escalatedToUIL}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="esc-filter-container">
          <div className="esc-filter-header">
            <h3 className="esc-filter-title">
              <Filter size={16} />
              Filter & Search
            </h3>
            <div className="esc-filter-actions">
              <button 
                onClick={fetchEscalations} 
                className="esc-refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="esc-create-btn"
              >
                <Plus size={14} />
                Report Issue
              </button>
            </div>
          </div>

          <div className="esc-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by title, description, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="esc-search-input"
            />
          </div>

          <div className="esc-filter-bar">
            {['OPEN', 'RESOLVED', 'ESCALATED_TO_UIL'].map(status => (
              <button
                key={status}
                className={`esc-filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                <span className="esc-filter-label">
                  {status === 'OPEN' ? 'Open' : status === 'RESOLVED' ? 'Resolved' : 'Escalated to UIL'}
                </span>
                <span className="esc-filter-count">
                  {status === 'OPEN' ? stats.open : status === 'RESOLVED' ? stats.resolved : stats.escalatedToUIL}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Escalations List */}
        {loading ? (
          <div className="esc-loading">
            <div className="esc-spinner" />
            <p>Loading escalations...</p>
          </div>
        ) : filteredEscalations.length === 0 ? (
          <div className="esc-empty">
            <div className="esc-empty-icon">
              <Shield size={48} />
            </div>
            <h3>No Escalations Found</h3>
            <p>
              {statusFilter === 'OPEN' 
                ? 'No open escalations. Great work maintaining system integrity!' 
                : 'No escalations in this category'}
            </p>
            {statusFilter === 'OPEN' && (
              <button 
                onClick={() => setShowModal(true)}
                className="esc-empty-btn"
              >
                <Plus size={14} />
                Report an Issue
              </button>
            )}
          </div>
        ) : (
          <div className="esc-grid">
            {filteredEscalations.map(escalation => {
              const IssueIcon = getIssueTypeIcon(escalation.issue_type);
              const issueColor = getIssueTypeColor(escalation.issue_type);
              
              return (
                <div 
                  key={escalation.id} 
                  className={`esc-card ${escalation.status === 'OPEN' ? 'esc-card-open' : ''}`}
                >
                  <div className="esc-card-header">
                    <div className="esc-issue-icon" style={{ color: issueColor }}>
                      <IssueIcon size={18} />
                    </div>
                    <div className="esc-card-title-section">
                      <h3 className="esc-card-title">{escalation.title}</h3>
                      <span className="esc-issue-type" style={{ backgroundColor: `${issueColor}20`, color: issueColor }}>
                        {escalation.issue_type_display}
                      </span>
                    </div>
                  </div>

                  <p className="esc-card-description">{escalation.description}</p>

                  <div className="esc-card-meta">
                    {escalation.student_name && (
                      <div className="esc-meta-item">
                        <User size={12} />
                        <span><strong>Student:</strong> {escalation.student_name}</span>
                      </div>
                    )}
                    {escalation.advisor_name && (
                      <div className="esc-meta-item">
                        <User size={12} />
                        <span><strong>Advisor:</strong> {escalation.advisor_name}</span>
                      </div>
                    )}
                    {escalation.company_name && (
                      <div className="esc-meta-item">
                        <Building2 size={12} />
                        <span><strong>Company:</strong> {escalation.company_name}</span>
                      </div>
                    )}
                    <div className="esc-meta-item">
                      <Clock size={12} />
                      <span>{new Date(escalation.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {escalation.resolution_notes && (
                    <div className="esc-resolution-box">
                      <FileText size={12} />
                      <p>{escalation.resolution_notes}</p>
                    </div>
                  )}

                  <div className="esc-card-footer">
                    {escalation.status === 'OPEN' ? (
                      <>
                        <button 
                          onClick={() => {
                            setSelectedEscalation(escalation);
                            setShowResolveModal(true);
                          }}
                          className="esc-btn esc-btn-resolve"
                        >
                          <CheckCircle size={14} />
                          Resolve
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedEscalation(escalation);
                            setEscalationReason('');
                          }}
                          className="esc-btn esc-btn-escalate"
                          data-escalate={escalation.id}
                        >
                          <Shield size={14} />
                          Escalate to UIL
                        </button>
                      </>
                    ) : (
                      <span className={`esc-status-badge esc-status-${escalation.status.toLowerCase()}`}>
                        {escalation.status === 'RESOLVED' ? 'Resolved' : 'Escalated to UIL'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Escalation Modal */}
      {showModal && (
        <div className="esc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="esc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="esc-modal-header">
              <h3 className="esc-modal-title">
                <AlertTriangle size={18} />
                Report New Issue
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="esc-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEscalation} className="esc-modal-body">
              <div className="esc-form-group">
                <label className="esc-form-label">
                  Issue Type <span className="esc-required">*</span>
                </label>
                <select
                  value={formData.issue_type}
                  onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                  className="esc-form-input"
                >
                  <option value="FAILING_STUDENT">Student Performance Risk</option>
                  <option value="INACTIVE_ADVISOR">Advisor Inactivity</option>
                  <option value="COMPANY_ISSUE">Company Policy Violation</option>
                  <option value="PLACEMENT_CONFLICT">Placement Conflict</option>
                  <option value="OTHER">Other Strategic Issue</option>
                </select>
              </div>

              <div className="esc-form-group">
                <label className="esc-form-label">
                  Title <span className="esc-required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="esc-form-input"
                  placeholder="Brief title of the issue"
                  required
                />
              </div>

              <div className="esc-form-group">
                <label className="esc-form-label">
                  Description <span className="esc-required">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="esc-form-textarea"
                  placeholder="Detailed description of the issue"
                  rows="4"
                  required
                />
              </div>

              <div className="esc-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="esc-btn esc-btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="esc-btn esc-btn-save"
                >
                  <Send size={14} />
                  Report Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedEscalation && (
        <div className="esc-modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="esc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="esc-modal-header">
              <h3 className="esc-modal-title">
                <CheckCircle size={18} />
                Resolve Escalation
              </h3>
              <button 
                onClick={() => setShowResolveModal(false)}
                className="esc-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="esc-modal-body">
              <div className="esc-escalation-preview">
                <h4>{selectedEscalation.title}</h4>
                <p>{selectedEscalation.description}</p>
              </div>

              <div className="esc-form-group">
                <label className="esc-form-label">
                  Resolution Notes <span className="esc-required">*</span>
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="esc-form-textarea"
                  placeholder="Describe the resolution taken..."
                  rows="4"
                  required
                />
              </div>

              <div className="esc-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="esc-btn esc-btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResolve}
                  className="esc-btn esc-btn-save"
                >
                  <CheckCircle size={14} />
                  Mark as Resolved
                </button>
                <button 
                  onClick={() => {
                    setShowResolveModal(false);
                    setEscalationReason('');
                  }}
                  className="esc-btn esc-btn-escalate"
                >
                  <Shield size={14} />
                  Escalate to UIL Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Escalations;
