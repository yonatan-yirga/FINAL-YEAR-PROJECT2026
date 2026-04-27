/**
 * MyStudents Page - Modern UI/UX Design
 * Beautiful interface for managing assigned students
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import advisorService from '../../services/advisorService';
import { 
  Users, Search, Filter, Calendar, Clock, Building2, 
  User, Mail, Phone, MapPin, TrendingUp, Eye, RefreshCw,
  CheckCircle, AlertCircle, Star, Award, Target, ArrowRight,
  GraduationCap, Briefcase, MessageSquare, Plus
} from 'lucide-react';
import './MyStudents.css';

const MyStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Fetch students with retry logic
  const fetchStudents = useCallback(async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (activeFilter === 'active') {
        params.active = 'true';
      } else if (activeFilter === 'completed') {
        params.active = 'false';
      }

      const response = await advisorService.getMyStudents(params);

      if (response.success) {
        const studentsData = response.data.results || response.data || [];
        setStudents(studentsData);
        setStatistics(response.data.statistics);
      } else {
        if (attempt < 2) {
          setTimeout(() => fetchStudents(attempt + 1), 700 * (attempt + 1));
          return;
        }
        setError(response.error || 'Failed to load students');
      }
    } catch (err) {
      if (attempt < 2) {
        setTimeout(() => fetchStudents(attempt + 1), 700 * (attempt + 1));
        return;
      }
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchStudents(0);
  }, [fetchStudents, retryKey]);

  const handleStudentClick = (student) => {
    navigate(`/advisor/students/${student.id}`);
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.student_name?.toLowerCase().includes(searchLower) ||
      student.student_email?.toLowerCase().includes(searchLower) ||
      student.university_id?.toLowerCase().includes(searchLower) ||
      student.company_name?.toLowerCase().includes(searchLower) ||
      student.internship_title?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusInfo = (isActive) => {
    if (isActive) {
      return {
        label: 'Active',
        color: '#15803D',
        bg: '#DCFCE7',
        icon: CheckCircle
      };
    }
    return {
      label: 'Completed',
      color: '#64748B',
      bg: '#F1F5F9',
      icon: Award
    };
  };

  return (
    <div className="ms-page">
      <Header
        title="My Students"
        subtitle="Manage and monitor your assigned students"
      />

      <div className="ms-content">
        
        {/* Statistics Dashboard */}
        {statistics && (
          <div className="ms-stats-dashboard">
            <div className="ms-stat-card">
              <div className="ms-stat-icon ms-icon-blue">
                <Users size={24} />
              </div>
              <div className="ms-stat-body">
                <span className="ms-stat-label">Total Students</span>
                <span className="ms-stat-value ms-val-blue">{statistics.total_students}</span>
              </div>
              <div className="ms-stat-trend">
                <TrendingUp size={16} />
              </div>
            </div>
            
            <div className="ms-stat-card">
              <div className="ms-stat-icon ms-icon-green">
                <CheckCircle size={24} />
              </div>
              <div className="ms-stat-body">
                <span className="ms-stat-label">Active Internships</span>
                <span className="ms-stat-value ms-val-green">{statistics.active_students}</span>
              </div>
              <div className="ms-stat-pulse" />
            </div>
            
            <div className="ms-stat-card">
              <div className="ms-stat-icon ms-icon-gray">
                <Award size={24} />
              </div>
              <div className="ms-stat-body">
                <span className="ms-stat-label">Completed</span>
                <span className="ms-stat-value ms-val-gray">{statistics.completed_students}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="ms-toolbar">
          <div className="ms-filter-section">
            <div className="ms-filter-header">
              <Filter size={18} />
              <span>Filter Students</span>
            </div>
            
            <div className="ms-filter-buttons">
              <button
                className={`ms-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <Users size={16} />
                <span>All Students</span>
                <span className="ms-filter-count">{statistics?.total_students || 0}</span>
              </button>
              
              <button
                className={`ms-filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                <CheckCircle size={16} />
                <span>Active</span>
                <span className="ms-filter-count">{statistics?.active_students || 0}</span>
              </button>
              
              <button
                className={`ms-filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                <Award size={16} />
                <span>Completed</span>
                <span className="ms-filter-count">{statistics?.completed_students || 0}</span>
              </button>
            </div>
          </div>

          <div className="ms-search-section">
            <div className="ms-search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search students by name, company, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ms-search-input"
              />
            </div>
            
            <button 
              className="ms-refresh-btn"
              onClick={() => setRetryKey(k => k + 1)}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="ms-alert ms-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button 
              className="ms-retry-btn"
              onClick={() => setRetryKey(k => k + 1)}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="ms-loading">
            <div className="ms-spinner" />
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="ms-empty-state">
            <div className="ms-empty-illustration">
              <div className="ms-empty-icon-container">
                <Users size={48} />
              </div>
              <div className="ms-empty-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
            </div>
            
            <div className="ms-empty-content">
              <h2>No Students Found</h2>
              <p>
                {searchTerm 
                  ? `No students match your search for "${searchTerm}".`
                  : activeFilter === 'all' 
                    ? 'You have no assigned students yet.'
                    : `No ${activeFilter} students found.`
                }
              </p>
              
              {!searchTerm && activeFilter === 'all' && (
                <div className="ms-empty-actions">
                  <button
                    className="ms-cta-btn primary"
                    onClick={() => navigate('/advisor/dashboard')}
                  >
                    <ArrowRight size={18} />
                    <span>Go to Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="ms-table-container">
            <table className="ms-students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>University ID</th>
                  <th>Internship</th>
                  <th>Company</th>
                  <th>Start Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const statusInfo = getStatusInfo(student.is_active);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr
                      key={student.id}
                      className="ms-table-row"
                      onClick={() => handleStudentClick(student)}
                    >
                      {/* Student Name with Avatar */}
                      <td className="ms-student-cell">
                        <div className="ms-student-info">
                          <div className="ms-student-avatar-sm">
                            {student.student_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ms-student-details">
                            <div className="ms-student-name-sm">{student.student_name}</div>
                            {student.student_email && (
                              <div className="ms-student-email">{student.student_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* University ID */}
                      <td>
                        <span className="ms-table-text">{student.university_id}</span>
                      </td>
                      
                      {/* Internship Title */}
                      <td>
                        <span className="ms-table-text">{student.internship_title}</span>
                      </td>
                      
                      {/* Company */}
                      <td>
                        <div className="ms-company-cell">
                          <Building2 size={14} />
                          <span className="ms-table-text">{student.company_name}</span>
                        </div>
                      </td>
                      
                      {/* Start Date */}
                      <td>
                        <span className="ms-table-text">
                          {new Date(student.start_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      
                      {/* Duration */}
                      <td>
                        <span className="ms-table-text">{student.duration_days} days</span>
                      </td>
                      
                      {/* Status */}
                      <td>
                        <div 
                          className="ms-status-badge-sm"
                          style={{ 
                            color: statusInfo.color, 
                            backgroundColor: statusInfo.bg 
                          }}
                        >
                          <StatusIcon size={12} />
                          <span>{statusInfo.label}</span>
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td>
                        <div className="ms-table-actions">
                          <button 
                            className="ms-table-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/advisor/students/${student.id}`);
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <button 
                            className="ms-table-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/advisor/reports');
                            }}
                            title="View Reports"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStudents;