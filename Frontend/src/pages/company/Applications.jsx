/**
 * Applications Page (Company) 
 * Review and manage student applications
 */
import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import Header from '../../components/common/Header';
import ApplicationCard from '../../components/cards/ApplicationCard';
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
    let d = applications;
    if (filterStatus !== 'ALL') d = d.filter(a => a.status === filterStatus);
    if (filterInternship !== 'ALL') d = d.filter(a => a.internship === parseInt(filterInternship));
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
              <FileText size={20} strokeWidth={2} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Total Applications</span>
              <span className="ap-stat-value">{counts.all}</span>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-yellow">
              <Clock size={20} strokeWidth={2} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Pending Review</span>
              <span className="ap-stat-value ap-val-yellow">{counts.pending}</span>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-green">
              <CheckCircle size={20} strokeWidth={2} />
            </div>
            <div className="ap-stat-body">
              <span className="ap-stat-label">Accepted</span>
              <span className="ap-stat-value ap-val-green">{counts.accepted}</span>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-icon-red">
              <XCircle size={20} strokeWidth={2} />
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

        {/* Loading */}
        {loading && (
          <div className="ap-loading">
            <div className="ap-spinner" />
            <p>Loading applications...</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="ap-grid">
            {filtered.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                userRole="COMPANY"
                onView={() => setDetailModal({ show: true, application })}
                onAccept={() => setAcceptModal({ show: true, application })}
                onReject={() => setRejectModal({ show: true, application })}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="ap-empty">
            <div className="ap-empty-icon-circle">
              <FileText size={40} strokeWidth={1.5} color="#6b7177" />
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