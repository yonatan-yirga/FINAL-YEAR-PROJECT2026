/**
 * InternshipCard Component
 * Reusable card for displaying internship information
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './InternshipCard.css';

const InternshipCard = ({
  internship,
  showMatch = false,
  onApply = null,
  onEdit = null,
  onDelete = null,
  userRole = null,
}) => {
  const navigate = useNavigate();
  
  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'badge-success';
      case 'CLOSED':
        return 'badge-warning';
      case 'FILLED':
        return 'badge-error';
      default:
        return 'badge-default';
    }
  };
  
  /**
   * Get match color
   */
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#48bb78'; // Green
    if (percentage >= 50) return '#f6ad55'; // Orange
    return '#cbd5e0'; // Gray
  };
  
  /**
   * Handle card click - navigate to detail
   */
  const handleCardClick = (e) => {
    // Don't navigate if clicking action buttons
    if (e.target.closest('button')) return;
    
    // Students navigate to detail view; company actions handled by onEdit/onDelete buttons
    if (userRole === 'STUDENT') {
      navigate(`/student/internships/${internship.id}`);
    }
    // COMPANY: no card-body navigation — use the Edit/Delete/Close buttons on the card
  };
  
  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  /**
   * Parse skills
   */
  const getSkills = () => {
    if (!internship.required_skills) return [];
    return internship.required_skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s)
      .slice(0, 5); // Show max 5 skills
  };
  
  const skills = getSkills();
  const hasMoreSkills = internship.required_skills && 
    internship.required_skills.split(',').length > 5;
  
  return (
    <div className="internship-card" onClick={handleCardClick}>
      {/* Match Badge (if showing match) */}
      {showMatch && internship.match_percentage !== undefined && (
        <div className="match-badge">
          <div 
            className="match-circle"
            style={{ 
              background: `conic-gradient(
                ${getMatchColor(internship.match_percentage)} ${internship.match_percentage * 3.6}deg,
                #e2e8f0 0deg
              )`
            }}
          >
            <div className="match-inner">
              <span className="match-percentage">{internship.match_percentage}%</span>
            </div>
          </div>
          <span className="match-label">Match</span>
        </div>
      )}
      
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{internship.title}</h3>
          <p className="card-company">{internship.company_name}</p>
        </div>
        
        <span className={`badge ${getStatusColor(internship.status)}`}>
          {internship.status}
        </span>
      </div>
      
      {/* Card Body */}
      <div className="card-body">
        {/* Info Grid */}
        <div className="info-grid">
          <div className="info-item">
            <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{internship.location}</span>
          </div>
          
          <div className="info-item">
            <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{internship.duration_months} months</span>
          </div>
          
          <div className="info-item">
            <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Starts {formatDate(internship.start_date)}</span>
          </div>
          
          {internship.available_slots !== undefined && (
            <div className="info-item">
              <svg className="info-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{internship.available_slots} slots available</span>
            </div>
          )}
        </div>
        
        {/* Skills */}
        {skills.length > 0 && (
          <div className="skills-section">
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill}
                </span>
              ))}
              {hasMoreSkills && (
                <span className="skill-badge more">+more</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Card Footer - Actions */}
      <div className="card-footer">
        {/* Student View */}
        {userRole === 'STUDENT' && (
          <>
            <button 
              className="btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/student/internships/${internship.id}`);
              }}
            >
              View Details
            </button>
            {onApply && internship.is_accepting_applications && (
              <button 
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(internship);
                }}
              >
                Apply Now
              </button>
            )}
          </>
        )}
        
        {/* Company View */}
        {userRole === 'COMPANY' && (
          <>
            {internship.application_count !== undefined && (
              <span className="application-count">
                {internship.application_count} applications
              </span>
            )}
            <div className="action-buttons">
              {onEdit && (
                <button 
                  className="btn-outline btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(internship);
                  }}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button 
                  className="btn-danger btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(internship);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

InternshipCard.propTypes = {
  internship: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    company_name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    duration_months: PropTypes.number.isRequired,
    start_date: PropTypes.string.isRequired,
    required_skills: PropTypes.string,
    status: PropTypes.string.isRequired,
    available_slots: PropTypes.number,
    match_percentage: PropTypes.number,
    is_accepting_applications: PropTypes.bool,
    application_count: PropTypes.number,
  }).isRequired,
  showMatch: PropTypes.bool,
  onApply: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  userRole: PropTypes.string,
};

export default InternshipCard;