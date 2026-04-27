/**
 * Pending Registrations Page
 * Lists all pending registrations with filtering and actions
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import uilService from '../../services/uilService';
import RegistrationDetailModal from '../../components/uil/RegistrationDetailModal';
import ApprovalConfirmation from '../../components/uil/ApprovalConfirmation';
import RejectionForm from '../../components/uil/RejectionForm';
import './UIL.css';

const PendingRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Fetch pending registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    
    const result = await uilService.getPendingRegistrations();
    
    if (result.success) {
      setRegistrations(result.data);
      setFilteredRegistrations(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter by tab
  useEffect(() => {
    let filtered = registrations;
    
    if (activeTab !== 'ALL') {
      filtered = registrations.filter(reg => reg.request_type === activeTab);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.student_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.advisor_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRegistrations(filtered);
  }, [activeTab, searchTerm, registrations]);

  const handleView = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleApproveClick = (registration) => {
    setSelectedRegistration(registration);
    setShowApprovalModal(true);
  };

  const handleRejectClick = (registration) => {
    setSelectedRegistration(registration);
    setShowRejectionModal(true);
  };

  const handleApprovalSuccess = () => {
    setShowApprovalModal(false);
    setShowDetailModal(false);
    fetchRegistrations(); // Refresh list
  };

  const handleRejectionSuccess = () => {
    setShowRejectionModal(false);
    setShowDetailModal(false);
    fetchRegistrations(); // Refresh list
  };

  const tabs = [
    { key: 'ALL', label: 'All Pending' },
    { key: 'STUDENT', label: 'Students' },
    { key: 'COMPANY', label: 'Companies' },
    { key: 'ADVISOR', label: 'Advisors' },
    { key: 'DEPARTMENT', label: 'Departments' },
  ];

  return (
    <div className="pending-registrations-page">
      {/* Header */}
      <div className="page-header">
        <h1>Pending Registrations</h1>
        <p>Review and approve user registration requests</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key !== 'ALL' && (
              <span className="tab-count">
                {registrations.filter(r => r.request_type === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading registrations...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="table-container">
          {filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3>No Pending Registrations</h3>
              <p>There are no pending registrations at the moment.</p>
            </div>
          ) : (
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="name-cell">
                      {registration.student_full_name ||
                       registration.company_name ||
                       registration.advisor_full_name ||
                       registration.department_name ||
                       'N/A'}
                    </td>
                    <td>{registration.email}</td>
                    <td>
                      {registration.request_type === 'COMPANY' && registration.target_department_names?.length > 0
                        ? registration.target_department_names.join(', ')
                        : registration.department_name}
                    </td>
                    <td className="date-cell">
                      {new Date(registration.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleView(registration)}
                        className="btn-icon btn-view"
                        title="View Details"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleApproveClick(registration)}
                        className="btn-icon btn-approve"
                        title="Approve"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRejectClick(registration)}
                        className="btn-icon btn-reject"
                        title="Reject"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          onClose={() => setShowDetailModal(false)}
          onApprove={() => {
            setShowDetailModal(false);
            handleApproveClick(selectedRegistration);
          }}
          onReject={() => {
            setShowDetailModal(false);
            handleRejectClick(selectedRegistration);
          }}
        />
      )}

      {showApprovalModal && selectedRegistration && (
        <ApprovalConfirmation
          registration={selectedRegistration}
          onConfirm={handleApprovalSuccess}
          onCancel={() => setShowApprovalModal(false)}
        />
      )}

      {showRejectionModal && selectedRegistration && (
        <RejectionForm
          registration={selectedRegistration}
          onSubmit={handleRejectionSuccess}
          onCancel={() => setShowRejectionModal(false)}
        />
      )}
    </div>
  );
};

export default PendingRegistrations;