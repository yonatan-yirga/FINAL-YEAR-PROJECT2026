/**
 * Admin Student Detail Page - Upwork-Inspired Design
 * View comprehensive student information
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  User, Mail, Phone, MapPin, Calendar, Building2, Briefcase,
  Award, FileText, CheckCircle, Clock, AlertTriangle, ArrowLeft,
  RefreshCw, Settings
} from 'lucide-react';
import './StudentDetail.css';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all students and find the one with matching ID
      const response = await departmentService.getStudents();
      
      if (response.success) {
        const studentData = response.data.find(s => s.id === parseInt(id));
        if (studentData) {
          setStudent(studentData);
        } else {
          setError('Student not found');
        }
      } else {
        setError(response.error || 'Failed to load student details');
      }
    } catch (err) {
      setError('An error occurred while loading student details');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      NOT_APPLIED: { label: 'Not Applied', icon: Clock, className: 'status-pending' },
      APPLIED: { label: 'Applied', icon: FileText, className: 'status-applied' },
      ACTIVE: { label: 'Active', icon: CheckCircle, className: 'status-active' },
      COMPLETED: { label: 'Completed', icon: Award, className: 'status-completed' },
    };

    const config = statusConfig[status] || statusConfig.NOT_APPLIED;
    const IconComponent = config.icon;

    return (
      <span className={`sd-status-badge ${config.className}`}>
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="sd-page">
        <Header title="Student Details" subtitle="Loading student information..." />
        <div className="sd-content">
          <div className="sd-loading">
            <div className="sd-spinner" />
            <p>Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="sd-page">
        <Header title="Student Details" subtitle="Error loading student" />
        <div className="sd-content">
          <div className="sd-error">
            <AlertTriangle size={48} />
            <h3>{error || 'Student not found'}</h3>
            <button onClick={() => navigate('/admin/dashboard')} className="sd-back-btn">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-page">
      <Header 
        title="Student Details" 
        subtitle={`Viewing profile for ${student.full_name || student.student_name}`}
      />

      <div className="sd-content">
        {/* Back Button */}
        <button onClick={() => navigate('/admin/dashboard')} className="sd-back-button">
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Student Header Card */}
        <div className="sd-header-card">
          <div className="sd-header-left">
            <div className="sd-avatar">
              <User size={32} />
            </div>
            <div className="sd-header-info">
              <h2 className="sd-student-name">{student.full_name || student.student_name || 'N/A'}</h2>
              <p className="sd-student-id">ID: {student.university_id || student.student_id || 'N/A'}</p>
            </div>
          </div>
          <div className="sd-header-right">
            {student.internship_status && getStatusBadge(student.internship_status)}
            <button 
              onClick={() => navigate(`/admin/student/${id}/settings`)}
              className="sd-settings-btn"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        <div className="sd-grid">
          {/* Personal Information */}
          <div className="sd-section">
            <div className="sd-section-header">
              <User size={18} />
              <h3>Personal Information</h3>
            </div>
            <div className="sd-info-table">
              <table>
                <tbody>
                  <tr>
                    <td className="sd-label">
                      <User size={14} />
                      Full Name
                    </td>
                    <td className="sd-value">{student.full_name || student.student_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Mail size={14} />
                      Email
                    </td>
                    <td className="sd-value">{student.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Phone size={14} />
                      Phone
                    </td>
                    <td className="sd-value">{student.phone_number || student.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <MapPin size={14} />
                      City
                    </td>
                    <td className="sd-value">{student.city || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Building2 size={14} />
                      Address
                    </td>
                    <td className="sd-value">{student.address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Calendar size={14} />
                      Date Joined
                    </td>
                    <td className="sd-value">
                      {student.date_joined ? new Date(student.date_joined).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Information */}
          <div className="sd-section">
            <div className="sd-section-header">
              <Award size={18} />
              <h3>Academic Information</h3>
            </div>
            <div className="sd-info-table">
              <table>
                <tbody>
                  <tr>
                    <td className="sd-label">
                      <FileText size={14} />
                      University ID
                    </td>
                    <td className="sd-value">{student.university_id || student.student_id || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Building2 size={14} />
                      Department
                    </td>
                    <td className="sd-value">{student.department_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <User size={14} />
                      Advisor
                    </td>
                    <td className="sd-value">{student.advisor_name || 'Not Assigned'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <CheckCircle size={14} />
                      Account Status
                    </td>
                    <td className="sd-value">
                      <span className={`sd-account-status ${student.is_active !== false ? 'active' : 'inactive'}`}>
                        {student.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Internship Information */}
          <div className="sd-section sd-section-full">
            <div className="sd-section-header">
              <Briefcase size={18} />
              <h3>Internship Information</h3>
            </div>
            <div className="sd-info-table">
              <table>
                <tbody>
                  <tr>
                    <td className="sd-label">
                      <FileText size={14} />
                      Status
                    </td>
                    <td className="sd-value">
                      {student.internship_status ? getStatusBadge(student.internship_status) : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Building2 size={14} />
                      Company
                    </td>
                    <td className="sd-value">{student.company_name || 'Not Assigned'}</td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Calendar size={14} />
                      Start Date
                    </td>
                    <td className="sd-value">
                      {student.start_date ? new Date(student.start_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="sd-label">
                      <Calendar size={14} />
                      End Date
                    </td>
                    <td className="sd-value">
                      {student.end_date ? new Date(student.end_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sd-actions">
          <button onClick={fetchStudentDetail} className="sd-refresh-btn">
            <RefreshCw size={16} />
            Refresh Data
          </button>
          <button 
            onClick={() => navigate(`/admin/student/${id}/settings`)}
            className="sd-settings-action-btn"
          >
            <Settings size={16} />
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
