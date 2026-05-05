/**
 * Admin Dashboard - Upwork-Inspired Design
 * System management and oversight
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, Bell, Lock, BarChart3, 
  Settings, ExternalLink, ArrowRight, Shield, Search,
  RefreshCw, AlertTriangle, Building2, UserCheck, Briefcase
} from 'lucide-react';
import Header from '../../components/common/Header';
import useAuth from '../../hooks/useAuth';
import departmentService from '../../services/departmentService';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for user lists
  const [students, setStudents] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [deptHeads, setDeptHeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // students, advisors, deptHeads, companies

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [studentsRes, advisorsRes, companiesRes] = await Promise.all([
        departmentService.getStudents(),
        departmentService.getAdvisors(),
        departmentService.getCompanies()
      ]);

      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (advisorsRes.success) setAdvisors(advisorsRes.data || []);
      if (companiesRes.success) setCompanies(companiesRes.data || []);
      
      setDeptHeads([]);
      
    } catch (err) {
      setError('An error occurred while loading dashboard data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get current list based on active tab
  const getCurrentList = () => {
    switch (activeTab) {
      case 'students':
        return students;
      case 'advisors':
        return advisors;
      case 'deptHeads':
        return deptHeads;
      case 'companies':
        return companies;
      default:
        return [];
    }
  };

  // Filter users based on search
  const filteredUsers = getCurrentList().filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.university_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.advisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group users by department
  const groupedByDepartment = filteredUsers.reduce((groups, user) => {
    const dept = user.department_name || 'No Department';
    if (!groups[dept]) {
      groups[dept] = [];
    }
    groups[dept].push(user);
    return groups;
  }, {});

  // Sort departments alphabetically, "No Department" last
  const sortedDepartments = Object.keys(groupedByDepartment).sort((a, b) => {
    if (a === 'No Department') return 1;
    if (b === 'No Department') return -1;
    return a.localeCompare(b);
  });

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
      icon: <Briefcase size={16} />,
      label: 'Manage Users & Departments',
      path: '/uil/manage-users'
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

  const renderUserTable = (department, users) => {
    if (activeTab === 'students') {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>University ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Batch</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((student, index) => (
              <tr key={student.id || index}>
                <td className="admin-table-name">
                  {student.full_name || student.student_name || 'N/A'}
                </td>
                <td>{student.university_id || student.student_id || 'N/A'}</td>
                <td>{student.email || 'N/A'}</td>
                <td>{student.phone_number || student.phone || 'N/A'}</td>
                <td>
                  <span className="admin-batch-tag">{student.batch || 'N/A'}</span>
                </td>
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
      );
    } else if (activeTab === 'advisors') {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Advisor Name</th>
              <th>Staff ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Assigned Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((advisor, index) => (
              <tr key={advisor.id || index}>
                <td className="admin-table-name">
                  {advisor.full_name || advisor.advisor_name || 'N/A'}
                </td>
                <td>{advisor.staff_id || 'N/A'}</td>
                <td>{advisor.email || 'N/A'}</td>
                <td>{advisor.phone_number || advisor.phone || 'N/A'}</td>
                <td>
                  <span className="admin-count-badge">
                    {advisor.assignments_count || advisor.active_count || 0} students
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${
                    advisor.is_active !== false ? 'active' : 'inactive'
                  }`}>
                    {advisor.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-action-view"
                      onClick={() => navigate(`/admin/advisor/${advisor.id}`)}
                      title="View Details"
                    >
                      <ExternalLink size={14} />
                      View
                    </button>
                    <button
                      className="admin-action-btn admin-action-settings"
                      onClick={() => navigate(`/admin/advisor/${advisor.id}/settings`)}
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
      );
    } else if (activeTab === 'deptHeads') {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Staff ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((head, index) => (
              <tr key={head.id || index}>
                <td className="admin-table-name">
                  {head.full_name || head.name || 'N/A'}
                </td>
                <td>{head.staff_id || 'N/A'}</td>
                <td>{head.email || 'N/A'}</td>
                <td>{head.phone_number || head.phone || 'N/A'}</td>
                <td>
                  <span className={`admin-status-badge ${
                    head.is_active !== false ? 'active' : 'inactive'
                  }`}>
                    {head.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-action-view"
                      onClick={() => navigate(`/admin/user/${head.id}`)}
                      title="View Details"
                    >
                      <ExternalLink size={14} />
                      View
                    </button>
                    <button
                      className="admin-action-btn admin-action-settings"
                      onClick={() => navigate(`/admin/user/${head.id}/settings`)}
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
      );
    } else if (activeTab === 'companies') {
      return (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((company, index) => (
              <tr key={company.id || index}>
                <td className="admin-table-name">
                  {company.company_name || 'N/A'}
                </td>
                <td>{company.contact_person || 'N/A'}</td>
                <td>{company.email || 'N/A'}</td>
                <td>{company.city || 'N/A'}</td>
                <td>
                  <div className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-action-view"
                      onClick={() => navigate(`/admin/company/${company.id}`)}
                      title="View Details"
                    >
                      <ExternalLink size={14} />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
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

            {/* User Directory with Tabs */}
            <h3 className="admin-section-title">User Directory by Department</h3>
            
            {/* Tabs */}
            <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                <Users size={16} />
                Students ({students.length})
              </button>
              <button
                className={`admin-tab ${activeTab === 'advisors' ? 'active' : ''}`}
                onClick={() => setActiveTab('advisors')}
              >
                <UserCheck size={16} />
                Advisors ({advisors.length})
              </button>
              <button
                className={`admin-tab ${activeTab === 'deptHeads' ? 'active' : ''}`}
                onClick={() => setActiveTab('deptHeads')}
              >
                <Building2 size={16} />
                Department Heads ({deptHeads.length})
              </button>
              <button
                className={`admin-tab ${activeTab === 'companies' ? 'active' : ''}`}
                onClick={() => setActiveTab('companies')}
              >
                <Briefcase size={16} />
                Companies ({companies.length})
              </button>
            </div>


            <div className="admin-table-container">
              <div className="admin-table-header">
                <div className="admin-table-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
                <button 
                  onClick={fetchAllUsers} 
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
                  <button onClick={fetchAllUsers} className="admin-retry-btn">
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                <div className="admin-table-loading">
                  <div className="admin-spinner" />
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="admin-table-empty">
                  <Users size={40} />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  {sortedDepartments.map((department) => (
                    <div key={department} className="admin-department-group">
                      <div className="admin-department-header">
                        <Building2 size={18} />
                        <span className="admin-department-title">{department}</span>
                        <span className="admin-department-count">
                          ({groupedByDepartment[department].length} {activeTab})
                        </span>
                      </div>
                      
                      {renderUserTable(department, groupedByDepartment[department])}
                    </div>
                  ))}
                </div>
              )}

              <div className="admin-table-footer">
                <span className="admin-table-count">
                  Showing {filteredUsers.length} of {getCurrentList().length} {activeTab}
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
