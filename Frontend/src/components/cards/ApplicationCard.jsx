/**
 * ApplicationCard Component
 */
import React from 'react';
import PropTypes from 'prop-types';
import StatusBadge from '../common/StatusBadge';
import './ApplicationCard.css';

const ApplicationCard = ({ application, userRole, onView, onAccept, onReject, onWithdraw, onConfirm }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="application-card">
      <div className="application-card-header">
        <div className="application-info">
          <h3 className="application-title">
            {userRole === 'STUDENT' ? application.internship_title : application.student_name}
          </h3>
          <p className="application-subtitle">
            {userRole === 'STUDENT' ? application.company_name : application.student_email}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="application-card-body">
        <div className="application-detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Applied: {formatDate(application.applied_at)}</span>
        </div>

        {userRole === 'STUDENT' && (
          <div className="application-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{application.internship_location}</span>
          </div>
        )}

        {userRole === 'COMPANY' && application.student_skills && (
          <div className="application-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="skills-preview">
              {application.student_skills.split(',').slice(0, 3).join(', ')}
              {application.student_skills.split(',').length > 3 && '...'}
            </span>
          </div>
        )}

        {application.reviewed_at && (
          <div className="application-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Reviewed: {formatDate(application.reviewed_at)}</span>
          </div>
        )}
      </div>

      {application.status === 'REJECTED' && application.rejection_reason && (
        <div className="rejection-reason">
          <strong>Reason:</strong> {application.rejection_reason}
        </div>
      )}

      {application.status === 'ACCEPTED' && userRole === 'STUDENT' && (
        <div className="acceptance-message">
          🎉 Congratulations! You have accepted this placement. Your advisor will be assigned shortly.
        </div>
      )}

      {application.status === 'OFFERED' && userRole === 'STUDENT' && (
        <div className="offer-message">
          💡 You have received an offer! Please confirm to finalize your placement.
        </div>
      )}

      <div className="application-card-footer">
        {onView && (
          <button className="btn-secondary" onClick={() => onView(application)}>
            View Details
          </button>
        )}

        {userRole === 'COMPANY' && application.status === 'PENDING' && (
          <>
            {onAccept && (
              <button className="btn-success" onClick={() => onAccept(application)}>
                Accept
              </button>
            )}
            {onReject && (
              <button className="btn-danger" onClick={() => onReject(application)}>
                Reject
              </button>
            )}
          </>
        )}

        {userRole === 'STUDENT' && application.status === 'PENDING' && onWithdraw && (
          <button className="btn-danger-outline" onClick={() => onWithdraw(application)}>
            Withdraw
          </button>
        )}

        {userRole === 'STUDENT' && application.status === 'OFFERED' && onConfirm && (
          <button className="btn-success" onClick={() => onConfirm(application)}>
            Confirm Placement
          </button>
        )}
      </div>
    </div>
  );
};

ApplicationCard.propTypes = {
  application: PropTypes.shape({
    id: PropTypes.number.isRequired,
    student_name: PropTypes.string,
    student_email: PropTypes.string,
    student_skills: PropTypes.string,
    internship_title: PropTypes.string,
    company_name: PropTypes.string,
    internship_location: PropTypes.string,
    status: PropTypes.string.isRequired,
    applied_at: PropTypes.string.isRequired,
    reviewed_at: PropTypes.string,
    rejection_reason: PropTypes.string,
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  onView: PropTypes.func,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onWithdraw: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default ApplicationCard;