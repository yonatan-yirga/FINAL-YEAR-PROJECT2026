/**
 * AcceptModal Component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import applicationService from '../../services/applicationService';

const AcceptModal = ({ show, onClose, application, onSuccess }) => {
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setAccepting(true);
    setError('');

    const result = await applicationService.acceptApplication(application.id);

    setAccepting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Accept Application" size="small">
      <div>
        <p style={{ marginBottom: '16px', color: '#4a5568' }}>
          Are you sure you want to accept this application?
        </p>

        <div style={{
          backgroundColor: '#f7fafc',
          padding: '16px',
          borderRadius: '6px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: '#2d3748' }}>
            <strong>Student:</strong> {application?.student_name}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: '#2d3748' }}>
            <strong>Email:</strong> {application?.student_email}
          </p>
          <p style={{ fontSize: '14px', margin: 0, color: '#2d3748' }}>
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

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={accepting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: accepting ? 'not-allowed' : 'pointer',
              opacity: accepting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: accepting ? 'not-allowed' : 'pointer',
              opacity: accepting ? 0.5 : 1,
            }}
          >
            {accepting ? 'Accepting...' : 'Accept Application'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

AcceptModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  application: PropTypes.shape({
    id: PropTypes.number.isRequired,
    student_name: PropTypes.string.isRequired,
    student_email: PropTypes.string.isRequired,
    internship_title: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func.isRequired,
};

export default AcceptModal;