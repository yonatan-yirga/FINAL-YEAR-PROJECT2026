/**
 * RejectModal Component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import applicationService from '../../services/applicationService';

const RejectModal = ({ show, onClose, application, onSuccess }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState('');

  const commonReasons = [
    'We have decided to proceed with other candidates.',
    'Your skills do not match our current requirements.',
    'The position has been filled.',
    'We are looking for candidates with more experience.',
  ];

  const handleReject = async (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason.');
      return;
    }

    setRejecting(true);
    setError('');

    const result = await applicationService.rejectApplication(
      application.id,
      rejectionReason
    );

    setRejecting(false);

    if (result.success) {
      setRejectionReason('');
      onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleClose = () => {
    if (!rejecting) {
      setRejectionReason('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal show={show} onClose={handleClose} title="Reject Application" size="medium">
      <form onSubmit={handleReject}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
            <strong>Student:</strong> {application?.student_name}
          </p>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            <strong>Internship:</strong> {application?.internship_title}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fed7d7',
            color: '#742a2a',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="commonReason"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568',
              marginBottom: '8px',
            }}
          >
            Common Reasons (Optional)
          </label>
          <select
            id="commonReason"
            onChange={(e) => setRejectionReason(e.target.value)}
            value=""
            disabled={rejecting}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          >
            <option value="">Select a reason...</option>
            {commonReasons.map((reason, index) => (
              <option key={index} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="rejectionReason"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568',
              marginBottom: '8px',
            }}
          >
            Rejection Reason <span style={{ color: '#f56565' }}>*</span>
          </label>
          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this application..."
            rows="4"
            required
            disabled={rejecting}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={rejecting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: rejecting ? 'not-allowed' : 'pointer',
              opacity: rejecting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={rejecting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f56565',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: rejecting ? 'not-allowed' : 'pointer',
              opacity: rejecting ? 0.5 : 1,
            }}
          >
            {rejecting ? 'Rejecting...' : 'Reject Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

RejectModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  application: PropTypes.shape({
    id: PropTypes.number.isRequired,
    student_name: PropTypes.string.isRequired,
    internship_title: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func.isRequired,
};

export default RejectModal;