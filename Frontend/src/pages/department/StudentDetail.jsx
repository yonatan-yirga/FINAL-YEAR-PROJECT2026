/**
 * Student Detail Page - Department Head View
 * Shows comprehensive student, company, and advisor information
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  User, Building2, UserCheck, Mail, Phone, Calendar,
  MapPin, Award, Clock, ArrowLeft, UserPlus, Briefcase,
  FileText, AlertCircle, CheckCircle, TrendingUp
} from 'lucide-react';
import './StudentDetail.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getStudentDetail(id);
      
      if (response.success) {
        setStudent(response.data);
        setError(null);
      } else {
        console.error('Failed to fetch student details:', response.error);
        setError(response.error || 'Failed to load student details');
      }
    } catch (err) {
      console.error('Error in fetchStudentDetail:', err);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      NOT_APPLIED: { label: 'Not Assigned', icon: Clock, color: '#718096' },
      APPLIED: { label: 'Assigned', icon: FileText, color: '#ED8936' },
      ACTIVE: { label: 'Active', icon: CheckCircle, color: '#48BB78' },
      COMPLETED: { label: 'Completed', icon: Award, color: '#9F7AEA' },
    };

    const config = statusConfig[status] || statusConfig.NOT_APPLIED;
    const IconComponent = config.icon;

    return (
      <span className="dept-sd-status-badge" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="dept-sd-page">
        <Header title="Student Details" subtitle="Loading student information..." />
        <div className="dept-sd-loading">
          <div className="dept-sd-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="dept-sd-page">
        <Header title="Student Details" subtitle="Error loading student" />
        <div className="dept-sd-error">
          <AlertCircle size={48} />
          <h3>{error || 'Student not found'}</h3>
          <button onClick={() => navigate('/department/students')} className="dept-sd-back-btn">
            <ArrowLeft size={16} />
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dept-sd-page">
      <Header
        title="Student Details"
        subtitle="Comprehensive student, company, and advisor information"
      />

      <div className="dept-sd-content">
        {/* Back Button */}
        <button onClick={() => navigate('/department/students')} className="dept-sd-back-button">
          <ArrowLeft size={16} />
          Back to Students
        </button>

        {/* Student Overview Card */}
        <div className="dept-sd-overview-card">
          <div className="dept-sd-overview-header">
            <div className="dept-sd-avatar">
              <User size={32} />
            </div>
            <div className="dept-sd-overview-info">
              <h2>{student.full_name}</h2>
              <p className="dept-sd-university-id">{student.university_id}</p>
            </div>
            {getStatusBadge(student.internship_status)}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dept-sd-grid">
          {/* Student Information Section */}
          <div className="dept-sd-section">
            <div className="dept-sd-section-header">
              <div className="dept-sd-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <User size={20} />
              </div>
              <div>
                <h3>Student Information</h3>
                <p>Personal and academic details</p>
              </div>
            </div>
            <div className="dept-sd-info-table">
              <div className="dept-sd-info-row">
                <span className="dept-sd-info-label">
                  <User size={14} />
                  Full Name
                </span>
                <span className="dept-sd-info-value">{student.full_name || '-'}</span>
              </div>
              <div className="dept-sd-info-row">
                <span className="dept-sd-info-label">
                  <Award size={14} />
                  University ID
                </span>
                <span className="dept-sd-info-value">{student.university_id || '-'}</span>
              </div>
              <div className="dept-sd-info-row">
                <span className="dept-sd-info-label">
                  <Mail size={14} />
                  Email
                </span>
                <span className="dept-sd-info-value">{student.email || '-'}</span>
              </div>
              <div className="dept-sd-info-row">
                <span className="dept-sd-info-label">
                  <Phone size={14} />
                  Phone Number
                </span>
                <span className="dept-sd-info-value">{student.phone_number || '-'}</span>
              </div>
              <div className="dept-sd-info-row">
                <span className="dept-sd-info-label">
                  <Briefcase size={14} />
                  Department
                </span>
                <span className="dept-sd-info-value">{student.department || '-'}</span>
              </div>
              <div className="dept-sd-info-row">
                <span className="dept-sd-info-label">
                  <TrendingUp size={14} />
                  Status
                </span>
                <span className="dept-sd-info-value">{getStatusBadge(student.internship_status)}</span>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="dept-sd-section">
            <div className="dept-sd-section-header">
              <div className="dept-sd-section-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h3>Company Information</h3>
                <p>Internship and company details</p>
              </div>
            </div>
            
            {student.company_name ? (
              <div className="dept-sd-info-table">
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <Building2 size={14} />
                    Company Name
                  </span>
                  <span className="dept-sd-info-value">{student.company_name}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <Briefcase size={14} />
                    Internship Title
                  </span>
                  <span className="dept-sd-info-value">{student.internship_title || '-'}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <Calendar size={14} />
                    Start Date
                  </span>
                  <span className="dept-sd-info-value">{student.start_date || '-'}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <Calendar size={14} />
                    End Date
                  </span>
                  <span className="dept-sd-info-value">{student.end_date || '-'}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <MapPin size={14} />
                    Location
                  </span>
                  <span className="dept-sd-info-value">{student.company_location || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="dept-sd-no-advisor">
                <AlertCircle size={48} />
                <h4>No Company Assigned</h4>
                <p>This student has not been assigned to a company/internship yet.</p>
                <button 
                  onClick={() => {
                    // Navigate to assign company page with student ID
                    navigate(`/department/assign-company?studentId=${student.id}`);
                  }}
                  className="dept-sd-assign-btn"
                >
                  <Building2 size={16} />
                  Assign Company
                </button>
              </div>
            )}
          </div>

          {/* Advisor Information Section */}
          <div className="dept-sd-section dept-sd-section-full">
            <div className="dept-sd-section-header">
              <div className="dept-sd-section-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <h3>Advisor Information</h3>
                <p>Assigned academic advisor details</p>
              </div>
            </div>
            
            {student.advisor_name ? (
              <div className="dept-sd-info-table">
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <UserCheck size={14} />
                    Advisor Name
                  </span>
                  <span className="dept-sd-info-value">{student.advisor_name}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <Mail size={14} />
                    Advisor Email
                  </span>
                  <span className="dept-sd-info-value">{student.advisor_email || '-'}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <Phone size={14} />
                    Advisor Phone
                  </span>
                  <span className="dept-sd-info-value">{student.advisor_phone || '-'}</span>
                </div>
                <div className="dept-sd-info-row">
                  <span className="dept-sd-info-label">
                    <MapPin size={14} />
                    Advising Location
                  </span>
                  <span className="dept-sd-info-value">{student.advisor_location || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="dept-sd-no-advisor">
                <AlertCircle size={48} />
                <h4>No Advisor Assigned</h4>
                {student.has_accepted_application ? (
                  <>
                    <p>This student has not been assigned an advisor yet.</p>
                    <button 
                      onClick={() => {
                        // Navigate to assign advisor page with student ID
                        navigate(`/department/assign-advisor?studentId=${student.id}`);
                      }}
                      className="dept-sd-assign-btn"
                    >
                      <UserPlus size={16} />
                      Assign Advisor
                    </button>
                  </>
                ) : (
                  <p>This student needs an accepted internship application before an advisor can be assigned.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
