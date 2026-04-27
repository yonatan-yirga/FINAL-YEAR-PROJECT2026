/**
 * Rejection Form Modal
 * Allows UIL to reject registration with reason
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import uilService from '../../services/uilService';
import '../../pages/uil/UIL.css';

const RejectionForm = ({ registration, onSubmit, onCancel }) => {
  const [reason, setReason] = useState('');
  const [commonReason, setCommonReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonReasons = [
    { value: '', label: 'Select a common reason (optional)' },
    { value: 'Invalid document - The uploaded document is not valid or readable', label: 'Invalid document' },
    { value: 'Incomplete information - Required information is missing or incomplete', label: 'Incomplete information' },
    { value: 'Department mismatch - The selected department does not match the documentation', label: 'Department mismatch' },
    { value: 'Duplicate registration - A registration already exists for this email', label: 'Duplicate registration' },
    { value: 'Invalid credentials - The provided credentials cannot be verified', label: 'Invalid credentials' },
  ];

  const handleCommonReasonChange = (e) => {
    const value = e.target.value;
    setCommonReason(value);
    if (value) {
      setReason(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    setError('');

    const result = await uilService.rejectRegistration(registration.id, reason);

    if (result.success) {
      onSubmit();
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
          <div className="rejection-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2>Reject Registration</h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="confirmation-text">
              You are rejecting the registration for:
            </p>

            <div className="summary-card rejection-summary">
              <div className="summary-row">
                <span className="summary-label">Name:</span>
                <span className="summary-value">{getName()}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{registration.email}</span>
              </div>
            </div>

            {/* Common Reasons Dropdown */}
            <div className="form-group">
              <label htmlFor="commonReason">Quick Select</label>
              <select
                id="commonReason"
                value={commonReason}
                onChange={handleCommonReasonChange}
                className="form-select"
              >
                {commonReasons.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rejection Reason Textarea */}
            <div className="form-group">
              <label htmlFor="reason">
                Rejection Reason <span className="required">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-textarea"
                rows="5"
                placeholder="Provide a detailed reason for rejection. This will be sent to the applicant."
                required
              />
              <p className="form-help">
                Be clear and specific so the applicant can address the issues and resubmit.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-danger" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

RejectionForm.propTypes = {
  registration: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RejectionForm;