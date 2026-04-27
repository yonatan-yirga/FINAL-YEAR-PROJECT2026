/**
 * Registration Detail Modal
 * Shows full registration details with document viewer
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import uilService from '../../services/uilService';
import DocumentViewer from './DocumentViewer';
import '../../pages/uil/UIL.css';

const RegistrationDetailModal = ({ registration, onClose, onApprove, onReject }) => {
  const [fullDetails, setFullDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const result = await uilService.getRegistrationDetail(registration.id);
      if (result.success) {
        setFullDetails(result.data);
      }
      setLoading(false);
    };
    fetchDetails();
  }, [registration.id]);

  const details = fullDetails || registration;

  const renderStudentDetails = () => (
    <div className="details-grid">
      <div className="detail-item">
        <span className="detail-label">Full Name</span>
        <span className="detail-value">{details.student_full_name}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Email</span>
        <span className="detail-value">{details.email}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Phone Number</span>
        <span className="detail-value">{details.student_phone}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Date of Birth</span>
        <span className="detail-value">{details.student_dob}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Gender</span>
        <span className="detail-value">{details.student_gender}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">University ID</span>
        <span className="detail-value">{details.student_university_id}</span>
      </div>
      <div className="detail-item full-width">
        <span className="detail-label">Skills</span>
        <span className="detail-value">{details.student_skills}</span>
      </div>
    </div>
  );

  const renderCompanyDetails = () => (
    <div className="details-grid">
      <div className="detail-item">
        <span className="detail-label">Company Name</span>
        <span className="detail-value">{details.company_name}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Email</span>
        <span className="detail-value">{details.email}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Phone Number</span>
        <span className="detail-value">{details.company_phone}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">City</span>
        <span className="detail-value">{details.company_city}</span>
      </div>
      <div className="detail-item full-width">
        <span className="detail-label">Address</span>
        <span className="detail-value">{details.company_address}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Contact Person</span>
        <span className="detail-value">{details.company_contact_person}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Contact Title</span>
        <span className="detail-value">{details.company_contact_title}</span>
      </div>
      <div className="detail-item full-width">
        <span className="detail-label">Description</span>
        <span className="detail-value">{details.company_description}</span>
      </div>
    </div>
  );

  const renderAdvisorDetails = () => (
    <div className="details-grid">
      <div className="detail-item">
        <span className="detail-label">Full Name</span>
        <span className="detail-value">{details.advisor_full_name}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Email</span>
        <span className="detail-value">{details.email}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Phone Number</span>
        <span className="detail-value">{details.advisor_phone}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Staff ID</span>
        <span className="detail-value">{details.advisor_staff_id}</span>
      </div>
    </div>
  );

  const renderDepartmentDetails = () => (
    <div className="details-grid">
      <div className="detail-item">
        <span className="detail-label">Department Name</span>
        <span className="detail-value">{details.department_name}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Head Name</span>
        <span className="detail-value">{details.department_head_name}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Email</span>
        <span className="detail-value">{details.email}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Phone Number</span>
        <span className="detail-value">{details.department_phone}</span>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Registration Details</h2>
          <button onClick={onClose} className="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-large"></div>
            </div>
          ) : (
            <>
              {/* Basic Info */}
              <div className="info-section">
                <div className="info-row">
                  <span className={`badge badge-${details.request_type.toLowerCase()}`}>
                    {details.request_type_display}
                  </span>
                  <span className="info-department">
                    {details.request_type === 'COMPANY' && details.target_department_names?.length > 0
                      ? details.target_department_names.join(', ')
                      : details.department_name}
                  </span>
                  <span className="info-date">
                    Submitted: {new Date(details.submitted_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Role-specific details */}
              <div className="details-section">
                {details.request_type === 'STUDENT' && renderStudentDetails()}
                {details.request_type === 'COMPANY' && renderCompanyDetails()}
                {details.request_type === 'ADVISOR' && renderAdvisorDetails()}
                {details.request_type === 'DEPARTMENT' && renderDepartmentDetails()}
              </div>

              {/* Document Viewer */}
              {details.document_url && (
                <div className="document-section">
                  <h3>Uploaded Document</h3>
                  <DocumentViewer documentUrl={details.document_url} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <div className="footer-actions">
            <button onClick={onReject} className="btn-danger">
              Reject
            </button>
            <button onClick={onApprove} className="btn-success">
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

RegistrationDetailModal.propTypes = {
  registration: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default RegistrationDetailModal;