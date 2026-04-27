/**
 * Approval Confirmation Modal
 * Confirms registration approval with summary
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import uilService from '../../services/uilService';
import '../../pages/uil/UIL.css';

const ApprovalConfirmation = ({ registration, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    const result = await uilService.approveRegistration(registration.id);

    if (result.success) {
      onConfirm();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getName = () => {
    return registration.student_full_name ||
           registration.company_name ||
           registration.advisor_full_name ||
           registration.department_name;
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="approval-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2>Approve Registration?</h2>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="confirmation-text">
            Are you sure you want to approve this registration?
          </p>

          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-label">Name:</span>
              <span className="summary-value">{getName()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Email:</span>
              <span className="summary-value">{registration.email}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Type:</span>
              <span className="summary-value">{registration.request_type_display}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Department:</span>
              <span className="summary-value">{registration.department_name}</span>
            </div>
          </div>

          <div className="info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>A user account will be created and login credentials will be sent to the registered email address.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-success" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Approving...
              </>
            ) : (
              'Confirm Approval'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ApprovalConfirmation.propTypes = {
  registration: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ApprovalConfirmation;