/**
 * ApplicationDetailModal Component
 * Full review view for companies to see student application details
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import StatusBadge from '../common/StatusBadge';
import './ApplicationDetailModal.css';

const ApplicationDetailModal = ({ show, onClose, application, onAccept, onReject }) => {
  if (!application) return null;

  return (
    <Modal show={show} onClose={onClose} title="Application Review" size="large">
      <div className="app-detail-container">
        {/* Header */}
        <div className="app-detail-header">
          <div className="student-identity">
            <h3>{application.student_name}</h3>
            <p>{application.student_email} • Applied on {new Date(application.applied_at).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Content Grid */}
        <div className="detail-grid">
          <div className="app-detail-section">
            <h4><span>👤</span> About Myself</h4>
            <div className="detail-content-box">
              {application.about_me || application.cover_letter || <span className="empty-detail">No summary provided</span>}
            </div>
          </div>

          <div className="app-detail-section">
            <h4><span>🎓</span> Education Level</h4>
            <div className="detail-content-box">
              {application.education_level || <span className="empty-detail">Not specified</span>}
            </div>
          </div>
        </div>

        <div className="app-detail-section">
          <h4><span>💼</span> Relevant Experience</h4>
          <div className="detail-content-box">
            {application.experience || <span className="empty-detail">No experience details provided</span>}
          </div>
        </div>

        <div className="app-detail-section">
          <h4><span>🚀</span> Projects & Work</h4>
          <div className="detail-content-box">
            {application.projects || <span className="empty-detail">No projects listed</span>}
          </div>
        </div>

        {/* Certificate Section */}
        {application.certificate && (
          <div className="app-detail-section">
            <h4><span>📜</span> Attached Certificate</h4>
            <div className="certificate-box">
              <div className="cert-info">
                <div className="cert-icon">📎</div>
                <div className="cert-meta">
                  <p>Supporting Document / Certificate</p>
                  <span>Validated by Student Repository</span>
                </div>
              </div>
              <a 
                href={application.certificate} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="view-cert-btn"
              >
                <span>👁️</span> View Certificate
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons (only if pending) */}
        {application.status === 'PENDING' && (
          <div className="app-detail-footer">
            <button 
              className="detail-action-btn btn-reject" 
              onClick={() => {
                onReject(application);
                onClose();
              }}
            >
              Reject Candidate
            </button>
            <button 
              className="detail-action-btn btn-accept" 
              onClick={() => {
                onAccept(application);
                onClose();
              }}
            >
              Accept Candidate
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

ApplicationDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  application: PropTypes.object,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default ApplicationDetailModal;
