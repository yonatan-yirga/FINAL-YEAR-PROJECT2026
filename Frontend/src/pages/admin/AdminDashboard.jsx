/**
 * Admin Dashboard - Upwork-Inspired Design
 * System management and oversight
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, Bell, Lock, BarChart3, 
  Settings, ExternalLink, ArrowRight, Shield, Search,
  RefreshCw, AlertTriangle
} from 'lucide-react';
import Header from '../../components/common/Header';
import useAuth from '../../hooks/useAuth';
import departmentService from '../../services/departmentService';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for student list
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch students from department service
      const response = await departmentService.getStudents();
      
      if (response.success) {
        setStudents(response.data || []);
      } else {
        setError(response.error || 'Failed to load students');
      }
    } catch (err) {
      setError('An error occurred while loading students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.university_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickLinks = [
    {
      icon: <Settings size={16} />,
      label: 'Django Console',
      path: `${BACKEND_URL}/admin/`
    },
    {
      icon: <Users size={16} />,
      label: 'User Hub',
      path: '/admin/users'
    },
    {
      icon: <FileText size={16} />,
      label: 'Audit Logs',
      path: `${BACKEND_URL}/admin/`
    }
  ];

  const handleQuickLinkClick = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="admin-dashboard">
      <Header 
        title="Admin Dashboard" 
        subtitle="System management and oversight" 
      />
      
      <div className="admin-content">
        <div className="admin-layout">
          {/* Main Column */}
          <div>
            {/* Welcome Banner */}
            <div className="admin-welcome">
              <div className="admin-welcome-header">
                <div>
                  <h2 className="admin-welcome-title">
                    Welcome back, {user?.full_name || 'Administrator'}
                  </h2>
                  <p className="admin-welcome-role">System Administrator</p>
                </div>
                <span className="admin-welcome-badge">
                  <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Root Access
                </span>
              </div>
              <p className="admin-welcome-text">
                Manage the system, verify new users, and maintain data integrity.
              </p>
            </div>

            {/* Core Infrastructure */}
            <h3 className="admin-section-title">Core Infrastructure</h3>
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <h4 className="admin-panel-title">Admin Backend</h4>
                  <p className="admin-panel-description">
                    Direct access to low-level database models, advanced user auditing, 
                    and system-wide configuration parameters.
                  </p>
                </div>
                <span className="admin-panel-badge">Root Access</span>
              </div>
              
              <a 
                href={`${BACKEND_URL}/admin/`} 
                target="_blank" 
                rel="noreferrer" 
                className="admin-panel-button"
              >
                <span>Launch Admin Panel</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Student List Table */}
            <h3 className="admin-section-title">Student Directory</h3>
            <div className="admin-table-container">
              <div className="admin-table-header">
                <div className="admin-table-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search students by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
                <button 
                  onClick={fetchStudents} 
                  className="admin-refresh-btn"
                  disabled={loading}
                >
                  <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                  Refresh
                </button>
              </div>

              {error && (
                <div className="admin-error-alert">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                  <button onClick={fetchStudents} className="admin-retry-btn">
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                <div className="admin-table-loading">
                  <div className="admin-spinner" />
                  <p>Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="admin-table-empty">
                  <Users size={40} />
                  <p>No students found</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>University ID</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id || index}>
                          <td className="admin-table-name">
                            {student.full_name || student.student_name || 'N/A'}
                          </td>
                          <td>{student.university_id || student.student_id || 'N/A'}</td>
                          <td>{student.email || 'N/A'}</td>
                          <td>{student.phone_number || student.phone || 'N/A'}</td>
                          <td>{student.city || 'N/A'}</td>
                          <td>
                            <span className={`admin-status-badge ${
                              student.is_active !== false ? 'active' : 'inactive'
                            }`}>
                              {student.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                className="admin-action-btn admin-action-view"
                                onClick={() => navigate(`/admin/student/${student.id}`)}
                                title="View Details"
                              >
                                <ExternalLink size={14} />
                                View
                              </button>
                              <button
                                className="admin-action-btn admin-action-settings"
                                onClick={() => navigate(`/admin/student/${student.id}/settings`)}
                                title="Settings"
                              >
                                <Settings size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="admin-table-footer">
                <span className="admin-table-count">
                  Showing {filteredStudents.length} of {students.length} students
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="admin-sidebar">
            <div className="admin-sidebar-section">
              <h3 className="admin-sidebar-title">Quick Links</h3>
              <div className="admin-quick-links">
                {quickLinks.map((link, index) => (
                  <div 
                    key={index}
                    className="admin-quick-link"
                    onClick={() => handleQuickLinkClick(link.path)}
                  >
                    <div className="admin-quick-link-content">
                      <span className="admin-quick-link-icon">{link.icon}</span>
                      <span className="admin-quick-link-label">{link.label}</span>
                    </div>
                    <span className="admin-quick-link-arrow">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
