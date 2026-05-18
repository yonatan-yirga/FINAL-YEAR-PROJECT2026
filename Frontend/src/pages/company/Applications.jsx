/**
 * Applications Page (Company) 
 * Review and manage student applications
 */
import React, { useState, useEffect } from 'react';
import { 
  Users,
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Mail, 
  Calendar, 
  Eye, 
  Check, 
  X,
  User,
  Award,
  Briefcase,
  UserCheck,
  UserX,
  ClipboardList
} from 'lucide-react';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import AcceptModal from '../../components/modals/AcceptModal';
import RejectModal from '../../components/modals/RejectModal';
import ApplicationDetailModal from '../../components/modals/ApplicationDetailModal';
import applicationService from '../../services/applicationService';
import internshipService from '../../services/internshipService';
import './Applications.css';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterInternship, setFilterInternship] = useState('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [acceptModal, setAcceptModal] = useState({ show: false, application: null });

  const [rejectModal, setRejectModal] = useState({ show: false, application: null });
  const [detailModal, setDetailModal] = useState({ show: false, application: null });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchApplications(), fetchInternships()]);
    setLoading(false);
  };

  const fetchApplications = async () => {
    try {
      setError('');
      const result = await applicationService.getCompanyApplications();
      if (result.success && result.data) {
        const data = result.data.results || result.data;
        setApplications(Array.isArray(data) ? data : []);
      } else {
        setError(result.error || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch {
      setError('An unexpected error occurred');
      setApplications([]);
    }
  };

  const fetchInternships = async () => {
    try {
      const result = await internshipService.getMyInternships();
      if (result.success && result.data) {
        const data = result.data.results || result.data;
        setInternships(Array.isArray(data) ? data : []);
      } else {
        setInternships([]);
      }
    } catch { setInternships([]); }
  };

  const getFiltered = () => {
    let d = [...applications];
    if (filterStatus !== 'ALL') d = d.filter(a => a.status === filterStatus);
    if (filterInternship !== 'ALL') d = d.filter(a => a.internship === parseInt(filterInternship));
    
    // Search filter
    if (search) {
      const s = search.toLowerCase();
      d = d.filter(a => 
        a.student_name?.toLowerCase().includes(s) || 
        a.university_id?.toLowerCase().includes(s)
      );
    }

    // Sort
    d.sort((a, b) => {
      if (sortBy === '-created_at') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'created_at') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'student_name') return (a.student_name || '').localeCompare(b.student_name || '');
      return 0;
    });

    return d;
  };


  const counts = {
    all: applications.length,
    pending:  applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  const filtered = getFiltered();

  return (
    <div className="ap-page">
      <Header title="Applications" subtitle="Review and manage student applications" />

      <div className="ap-content">

        {successMessage && (
          <div className="ap-alert ap-alert-success">
            <span>✓ {successMessage}</span>
            <button onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}
        {error && (
          <div className="ap-alert ap-alert-error">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="ap-stats">
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-green">
              <ClipboardList size={24} strokeWidth={2.5} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Total Applications</span>
              <span className="ap-stat-value">{counts.all}</span>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-yellow">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Pending Review</span>
              <span className="ap-stat-value ap-val-yellow">{counts.pending}</span>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-green">
              <UserCheck size={24} strokeWidth={2.5} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Accepted</span>
              <span className="ap-stat-value ap-val-green">{counts.accepted}</span>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-red">
              <UserX size={24} strokeWidth={2.5} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Rejected</span>
              <span className="ap-stat-value ap-val-red">{counts.rejected}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="ap-filter-bar">
          <div className="ap-filter-tabs">
            {[
              { key: 'ALL',      label: `All (${counts.all})` },
              { key: 'PENDING',  label: `Pending (${counts.pending})` },
              { key: 'ACCEPTED', label: `Accepted (${counts.accepted})` },
              { key: 'REJECTED', label: `Rejected (${counts.rejected})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`ap-filter-btn ${filterStatus === key ? 'active' : ''}`}
                onClick={() => setFilterStatus(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {internships.length > 1 && (
            <div className="ap-internship-filter">
              <label>Filter by Internship:</label>
              <select
                value={filterInternship}
                onChange={(e) => setFilterInternship(e.target.value)}
              >
                <option value="ALL">All Internships</option>
                {internships.map(i => (
                  <option key={i.id} value={i.id}>{i.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="ap-search-sort-row" style={{ display: 'flex', gap: 16, marginTop: 20, marginBottom: 24 }}>
          <div className="ap-search-wrapper" style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#667eea', zIndex: 1 }} />
            <input
              type="text"
              placeholder="Search by student name or university ID..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (window.apTimeout) clearTimeout(window.apTimeout);
                window.apTimeout = setTimeout(() => setSearch(e.target.value), 400);
              }}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                borderRadius: 16,
                border: '2px solid rgba(102, 126, 234, 0.2)',
                outline: 'none',
                fontSize: 14,
                fontWeight: 500,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.15)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              border: '2px solid rgba(102, 126, 234, 0.2)',
              outline: 'none',
              fontSize: 14,
              fontWeight: 700,
              minWidth: 180,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#667eea',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = 'white';
              e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
              e.target.style.background = 'rgba(255, 255, 255, 0.95)';
              e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="student_name">Student Name (A-Z)</option>
          </select>
        </div>


        {/* Loading */}
        {loading && (
          <div className="ap-loading">
            <div className="ap-spinner" />
            <p>Loading applications...</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="ap-table-card">
            <div className="ap-table-wrapper">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Skills</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((application) => (
                    <tr key={application.id} className="ap-table-row">
                      <td>
                        <div className="ap-student-cell">
                          <div className="ap-student-avatar">
                            <User size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="ap-student-name">{application.student_name}</div>
                            <div className="ap-student-id">{application.university_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="ap-email-cell">
                          <Mail size={16} strokeWidth={2.5} />
                          <span>{application.student_email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ap-skills-cell">
                          {application.student_skills ? (
                            <>
                              {application.student_skills.split(',').slice(0, 2).map((skill, idx) => (
                                <span key={idx} className="ap-skill-badge">
                                  {skill.trim()}
                                </span>
                              ))}
                              {application.student_skills.split(',').length > 2 && (
                                <span className="ap-skill-more">
                                  +{application.student_skills.split(',').length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="ap-no-skills">No skills listed</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ap-date-cell">
                          <Calendar size={16} strokeWidth={2.5} />
                          <span>{new Date(application.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={application.status} />
                      </td>
                      <td>
                        <div className="ap-actions-cell">
                          <button
                            className="ap-action-btn ap-action-view"
                            onClick={() => setDetailModal({ show: true, application })}
                            title="View Details"
                          >
                            <Eye size={18} strokeWidth={2.5} />
                          </button>
                          {application.status === 'PENDING' && (
                            <>
                              <button
                                className="ap-action-btn ap-action-accept"
                                onClick={() => setAcceptModal({ show: true, application })}
                                title="Accept Application"
                              >
                                <Check size={18} strokeWidth={2.5} />
                              </button>
                              <button
                                className="ap-action-btn ap-action-reject"
                                onClick={() => setRejectModal({ show: true, application })}
                                title="Reject Application"
                              >
                                <X size={18} strokeWidth={2.5} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="ap-empty">
            <div className="ap-empty-icon-circle">
              <Users size={48} strokeWidth={1.5} />
            </div>
            <h2>No applications found</h2>
            <p>
              {filterStatus === 'ALL' && filterInternship === 'ALL'
                ? "You haven't received any applications yet."
                : 'No applications match your current filters.'}
            </p>
          </div>
        )}
      </div>

      <AcceptModal
        show={acceptModal.show}
        onClose={() => setAcceptModal({ show: false, application: null })}
        application={acceptModal.application}
        onSuccess={() => {
          setSuccessMessage('Application accepted successfully!');
          setAcceptModal({ show: false, application: null });
          fetchData();
        }}
      />
      <RejectModal
        show={rejectModal.show}
        onClose={() => setRejectModal({ show: false, application: null })}
        application={rejectModal.application}
        onSuccess={() => {
          setSuccessMessage('Application rejected successfully.');
          setRejectModal({ show: false, application: null });
          fetchData();
        }}
      />

      <ApplicationDetailModal
        show={detailModal.show}
        onClose={() => setDetailModal({ show: false, application: null })}
        application={detailModal.application}
        onAccept={(application) => setAcceptModal({ show: true, application })}
        onReject={(application) => setRejectModal({ show: true, application })}
      />
    </div>
  );
};

export default Applications;