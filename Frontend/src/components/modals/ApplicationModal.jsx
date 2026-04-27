/**
 * ApplicationModal Component
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import applicationService from '../../services/applicationService';

const ApplicationModal = ({ show, onClose, internship, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError('');

    const result = await applicationService.applyToInternship(
      internship.id,
      coverLetter
    );

    setSubmitting(false);

    if (result.success) {
      setCoverLetter('');
      onSuccess();
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setCoverLetter('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal show={show} onClose={handleClose} title="Apply to Internship" size="medium">
      <form onSubmit={handleSubmit}>
        <div className="modal-section">
          <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#2d3748' }}>
            {internship?.title}
          </h3>
          <p style={{ fontSize: '14px', color: '#718096', marginBottom: '16px' }}>
            {internship?.company_name} • {internship?.location}
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
            htmlFor="coverLetter"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568',
              marginBottom: '8px',
            }}
          >
            Cover Letter (Optional)
          </label>
          <textarea
            id="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the company why you're interested in this internship..."
            rows="6"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
            disabled={submitting}
          />
          <p style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
            {coverLetter.length} characters
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

ApplicationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  internship: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    company_name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func.isRequired,
};

export default ApplicationModal;