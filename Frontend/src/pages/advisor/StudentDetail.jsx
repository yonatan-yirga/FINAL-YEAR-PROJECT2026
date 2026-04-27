/**
 * Student Detail Page - Upwork-Inspired Design
 * Detailed view of a single student with feedback management
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import advisorService from '../../services/advisorService';
import { 
  ArrowLeft, User, Mail, Phone, Building2, MapPin, Calendar,
  Clock, FileText, MessageSquare, CheckCircle, Send, X, Loader
} from 'lucide-react';
import './StudentDetail.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await advisorService.getStudentDetail(id);
      
      if (response.success) {
        setAssignment(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Feedback cannot be empty');
      return;
    }

    if (feedbackText.trim().length < 10) {
      setFeedbackError('Feedback must be at least 10 characters');
      return;
    }

    try {
      setFeedbackSubmitting(true);
      setFeedbackError(null);
      
      const response = await advisorService.createFeedback(id, feedbackText);
      
      if (response.success) {
        setShowFeedbackModal(false);
        setFeedbackText('');
        fetchStudentDetail(); // Refresh to show new feedback
      } else {
        setFeedbackError(response.error);
      }
    } catch (err) {
      setFeedbackError('Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="sd-page">
        <Header title="Student Details" subtitle="Loading..." />
        <div className="sd-content">
          <div className="sd-loading">
            <Loader className="sd-spinner-icon" size={40} />
            <p>Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="sd-page">
        <Header title="Student Details" subtitle="Error" />
        <div className="sd-content">
          <div className="sd-error">
            <p>{error || 'Student not found'}</p>
          </div>
          <button onClick={() => navigate('/advisor/my-students')} className="sd-back-btn">
            <ArrowLeft size={16} />
            Back to My Students
          </button>
        </div>
      </div>
    );
  }

  const { student, internship, feedbacks } = assignment;

  return (
    <div className="sd-page">
      <Header
        title={student.full_name}
        subtitle={`${internship.title} at ${internship.company_name}`}
      />

      <div className="sd-content">
        {/* Top Bar */}
        <div className="sd-top-bar">
          <button onClick={() => navigate('/advisor/my-students')} className="sd-back-btn">
            <ArrowLeft size={16} />
            Back to My Students
          </button>

          {/* Status Badge */}
          {assignment.is_active ? (
            <span className="sd-status-badge sd-status-active">
              <span className="sd-status-dot"></span>
              Active Internship
            </span>
          ) : (
            <span className="sd-status-badge sd-status-done">
              <span className="sd-status-dot"></span>
              Completed
            </span>
          )}
        </div>

        {/* Main Grid */}
        <div className="sd-grid">
          {/* Left Column */}
          <div className="sd-left">
            {/* Student Information */}
            <div className="sd-card">
              <h3 className="sd-card-title">
                <User size={18} />
                Student Information
              </h3>
              <table className="sd-table">
                <tbody>
                  <tr>
                    <td className="sd-table-label">
                      <User size={14} />
                      Full Name
                    </td>
                    <td className="sd-table-value">{student.full_name}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Mail size={14} />
                      Email
                    </td>
                    <td className="sd-table-value">{student.email}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <FileText size={14} />
                      University ID
                    </td>
                    <td className="sd-table-value">{student.university_id}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Phone size={14} />
                      Phone
                    </td>
                    <td className="sd-table-value">{student.phone_number || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Building2 size={14} />
                      Department
                    </td>
                    <td className="sd-table-value">{student.department_name}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <FileText size={14} />
                      Skills
                    </td>
                    <td className="sd-table-value">{student.skills || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Internship Information */}
            <div className="sd-card">
              <h3 className="sd-card-title">
                <Building2 size={18} />
                Internship Details
              </h3>
              <table className="sd-table">
                <tbody>
                  <tr>
                    <td className="sd-table-label">
                      <FileText size={14} />
                      Position
                    </td>
                    <td className="sd-table-value">{internship.title}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Building2 size={14} />
                      Company
                    </td>
                    <td className="sd-table-value">{internship.company_name}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <MapPin size={14} />
                      Location
                    </td>
                    <td className="sd-table-value">{internship.location}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Clock size={14} />
                      Duration
                    </td>
                    <td className="sd-table-value">{internship.duration_months} months</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Calendar size={14} />
                      Start Date
                    </td>
                    <td className="sd-table-value">{new Date(internship.start_date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Calendar size={14} />
                      End Date
                    </td>
                    <td className="sd-table-value">{internship.end_date ? new Date(internship.end_date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <FileText size={14} />
                      Description
                    </td>
                    <td className="sd-table-value">{internship.description}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <FileText size={14} />
                      Required Skills
                    </td>
                    <td className="sd-table-value">{internship.required_skills}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Company Contact */}
            <div className="sd-card">
              <h3 className="sd-card-title">
                <Building2 size={18} />
                Company Contact
              </h3>
              <table className="sd-table">
                <tbody>
                  <tr>
                    <td className="sd-table-label">
                      <Mail size={14} />
                      Email
                    </td>
                    <td className="sd-table-value">{internship.company_email}</td>
                  </tr>
                  <tr>
                    <td className="sd-table-label">
                      <Phone size={14} />
                      Phone
                    </td>
                    <td className="sd-table-value">{internship.company_phone || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="sd-right">
            {/* Actions */}
            {assignment.is_active && (
              <div className="sd-card">
                <h3 className="sd-card-title">
                  <MessageSquare size={18} />
                  Actions
                </h3>
                <div className="sd-actions">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="sd-action-btn"
                  >
                    <Send size={18} />
                    Send Feedback
                  </button>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="sd-card">
              <h3 className="sd-card-title">
                <FileText size={18} />
                Statistics
              </h3>
              <div className="sd-stats">
                <StatBox icon={<Clock size={20} />} label="Duration" value={`${assignment.duration_days}`} unit="days" />
                <StatBox icon={<MessageSquare size={20} />} label="Feedback" value={assignment.feedback_count} />
                <StatBox 
                  icon={assignment.is_active ? <CheckCircle size={20} /> : <Clock size={20} />} 
                  label="Status" 
                  value={assignment.is_active ? 'Active' : 'Done'} 
                  isStatus
                />
              </div>
            </div>

            {/* Feedback History */}
            <div className="sd-card">
              <div className="sd-card-title-row">
                <h3 className="sd-card-title">
                  <MessageSquare size={18} />
                  Feedback History
                </h3>
                <span className="sd-count-badge">{feedbacks?.length || 0}</span>
              </div>

              {feedbacks && feedbacks.length > 0 ? (
                <div className="sd-feedback-list">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="sd-feedback-item">
                      <div className="sd-feedback-meta">
                        <span className="sd-feedback-date">
                          <Calendar size={12} />
                          {new Date(feedback.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="sd-feedback-text">{feedback.feedback_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sd-no-feedback">
                  <MessageSquare size={32} />
                  <p>No feedback given yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="sd-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal-header">
              <h3>
                <MessageSquare size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Send Feedback
              </h3>
              <button onClick={() => setShowFeedbackModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <div className="sd-modal-body">
              {feedbackError && (
                <div className="sd-error sd-modal-error">
                  <p>{feedbackError}</p>
                </div>
              )}
              
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter your feedback here... (minimum 10 characters)"
                className="sd-textarea"
                rows={8}
                maxLength={5000}
              />
              
              <div className="sd-char-count">
                {feedbackText.length} / 5000 characters
              </div>
            </div>
            
            <div className="sd-modal-footer">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="sd-btn-ghost"
                disabled={feedbackSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="sd-btn-primary"
                disabled={feedbackSubmitting}
              >
                {feedbackSubmitting ? (
                  <>
                    <Loader size={16} className="sd-spinner-icon" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Components
const StatBox = ({ icon, label, value, unit, isStatus }) => (
  <div className="sd-stat-box">
    <div className={`sd-stat-value ${isStatus ? 'sd-val-gray' : 'sd-val-green'}`}>
      {icon}
    </div>
    <span className="sd-stat-value">{value}{unit && ` ${unit}`}</span>
    <span className="sd-stat-label">{label}</span>
  </div>
);

export default StudentDetail;