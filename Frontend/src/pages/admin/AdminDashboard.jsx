/**
 * Admin Dashboard - PREMIUM REDESIGN
 * System management and oversight with modern, premium styling
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, FileText, Bell, Lock, BarChart3, 
  Settings, ExternalLink, ArrowRight, Shield, Search,
  RefreshCw, AlertTriangle, Building2, UserCheck, Briefcase,
  TrendingUp, Activity, Eye, Trash2, Plus, X, Mail, Phone, User
} from 'lucide-react';
import Header from '../../components/common/Header';
import useAuth from '../../hooks/useAuth';
import departmentService from '../../services/departmentService';
import uilService from '../../services/uilService';
import './AdminDashboardPremium.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://internship-backend-0rcg.onrender.com';

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
  const [showUserList, setShowUserList] = useState(false); // Control user list visibility
  const [showDepartmentList, setShowDepartmentList] = useState(false); // Show departments first
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Selected department to show users
  const [showAddDeptModal, setShowAddDeptModal] = useState(false); // Show add department modal

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

  // Filter by selected department if one is selected
  const displayUsers = selectedDepartment 
    ? filteredUsers.filter(user => (user.department_name || 'No Department') === selectedDepartment)
    : filteredUsers;

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

  // Handle stat card click - show departments
  const handleStatCardClick = (tab) => {
    setActiveTab(tab);
    setShowDepartmentList(true);
    setShowUserList(false);
    setSelectedDepartment(null);
  };

  // Handle department click - show users in that department
  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setShowUserList(true);
    setShowDepartmentList(false);
  };

  // Handle back to departments
  const handleBackToDepartments = () => {
    setShowDepartmentList(true);
    setShowUserList(false);
    setSelectedDepartment(null);
  };

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
      icon: <Plus size={16} />,
      label: 'Add Department',
      action: () => setShowAddDeptModal(true),
      isButton: true
    },
    {
      icon: <FileText size={16} />,
      label: 'Audit Logs',
      path: `${BACKEND_URL}/admin/`
    }
  ];

  const handleQuickLinkClick = (link) => {
    if (link.isButton && link.action) {
      link.action();
    } else if (link.path.startsWith('http')) {
      window.open(link.path, '_blank');
    } else {
      navigate(link.path);
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
    <div className="admin-dashboard-premium">
      <Header 
        title="Admin Dashboard" 
        subtitle="System management and oversight with comprehensive analytics" 
      />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="admin-content-premium"
      >
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-welcome-premium"
        >
          <div className="welcome-header">
            <div className="welcome-info">
              <h2 className="welcome-title">
                Welcome back, {user?.full_name || 'Administrator'}
              </h2>
              <p className="welcome-subtitle">
                {user?.department_name && <span>{user.department_name} · </span>}
                System Administrator
              </p>
            </div>
            <div className="welcome-badge">
              <Shield size={16} />
              Root Access
            </div>
          </div>
          <p className="welcome-description">
            Manage the system, verify new users, and maintain data integrity across all departments.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`admin-stats-grid ${(showDepartmentList || showUserList) ? 'compact' : ''}`}
        >
          <motion.div 
            whileHover={{ scale: 1.02, y: -4 }}
            className="stat-card stat-students"
            onClick={() => handleStatCardClick('students')}
          >
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{students.length}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-trend">
              <TrendingUp size={16} />
              <span>View All</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -4 }}
            className="stat-card stat-advisors"
            onClick={() => handleStatCardClick('advisors')}
          >
            <div className="stat-icon">
              <UserCheck size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{advisors.length}</div>
              <div className="stat-label">Advisors</div>
            </div>
            <div className="stat-trend">
              <TrendingUp size={16} />
              <span>View All</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -4 }}
            className="stat-card stat-companies"
            onClick={() => handleStatCardClick('companies')}
          >
            <div className="stat-icon">
              <Briefcase size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{companies.length}</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-trend">
              <TrendingUp size={16} />
              <span>View All</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -4 }}
            className="stat-card stat-activity"
          >
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{students.length + advisors.length + companies.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-trend">
              <TrendingUp size={16} />
              <span>Active</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="admin-layout-premium">
          {/* Main Content */}
          <div className="admin-main-content">
            {/* System Links - Horizontal at top */}
            {!showDepartmentList && !showUserList && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="system-links-horizontal"
              >
                <h3 className="section-title">System Links</h3>
                <div className="system-links-grid">
                  {quickLinks.map((link, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`system-link-card ${link.isButton ? 'system-link-button' : ''}`}
                      onClick={() => handleQuickLinkClick(link)}
                    >
                      <div className="system-link-icon">{link.icon}</div>
                      <span className="system-link-label">{link.label}</span>
                      <ArrowRight size={16} className="system-link-arrow" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}


            {/* Department List (First Level) */}
            <AnimatePresence>
              {showDepartmentList && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="department-list-section"
                >
                  <div className="section-header">
                    <h3 className="section-title">Select Department - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                    <button 
                      className="close-list-btn"
                      onClick={() => setShowDepartmentList(false)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="department-cards-grid">
                    {sortedDepartments.map((department, index) => (
                      <motion.div
                        key={department}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className="department-card-item"
                        onClick={() => handleDepartmentClick(department)}
                      >
                        <div className="dept-card-icon">
                          <Building2 size={32} />
                        </div>
                        <h4 className="dept-card-name">{department}</h4>
                        <div className="dept-card-count">
                          {groupedByDepartment[department].length} {activeTab}
                        </div>
                        <div className="dept-card-arrow">
                          <ArrowRight size={20} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Directory (Second Level) */}
            <AnimatePresence>
              {showUserList && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="user-directory-section"
                >
                  <div className="section-header">
                    <div>
                      <button 
                        className="back-btn"
                        onClick={handleBackToDepartments}
                      >
                        <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        Back to Departments
                      </button>
                      <h3 className="section-title">{selectedDepartment} - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                    </div>
                    <button 
                      className="close-list-btn"
                      onClick={() => {
                        setShowUserList(false);
                        setShowDepartmentList(false);
                        setSelectedDepartment(null);
                      }}
                    >
                      Close All
                    </button>
                  </div>

                  {/* Search and Controls */}
                  <div className="table-controls">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={fetchAllUsers} 
                      className="refresh-btn"
                      disabled={loading}
                    >
                      <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                      Refresh
                    </button>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-alert"
                    >
                      <AlertTriangle size={18} />
                      <span>{error}</span>
                      <button onClick={fetchAllUsers} className="retry-btn">
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </motion.div>
                  )}

                  {/* Content */}
                  <div className="table-content">
                    {loading ? (
                      <div className="loading-state">
                        <div className="loader-glow"></div>
                        <p>Loading users...</p>
                      </div>
                    ) : displayUsers.length === 0 ? (
                      <div className="empty-state">
                        <Users size={60} strokeWidth={1} />
                        <h4>No users found</h4>
                        <p>Try adjusting your search criteria</p>
                      </div>
                    ) : (
                      <div className="table-wrapper">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="department-group"
                        >
                          <div className="department-header">
                            <Building2 size={20} />
                            <span className="department-name">{selectedDepartment}</span>
                            <span className="department-count">
                              {displayUsers.length} {activeTab}
                            </span>
                          </div>
                          
                          {renderUserTable(selectedDepartment, displayUsers)}
                        </motion.div>
                      </div>
                    )}

                    {!loading && displayUsers.length > 0 && (
                      <div className="table-footer">
                        <span>
                          Showing <strong>{displayUsers.length}</strong> {activeTab} in {selectedDepartment}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {showAddDeptModal && (
          <AddDepartmentModal 
            onClose={() => setShowAddDeptModal(false)} 
            onSuccess={() => {
              setShowAddDeptModal(false);
              fetchAllUsers(); // Refresh data
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Add Department Modal Component
const AddDepartmentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '', 
    head_name: '', 
    email: '', 
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await uilService.createDepartment(formData);
      
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="admin-modal-overlay"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="admin-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <h3>Add New Department</h3>
            <p>Register a new department in the system</p>
          </div>
          <button onClick={onClose} className="admin-modal-close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-modal-form">
          {error && <div className="admin-form-error">{error}</div>}
          
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Department Name *</label>
              <div className="admin-input-with-icon">
                <Building2 size={18} />
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Department Head *</label>
              <div className="admin-input-with-icon">
                <User size={18} />
                <input 
                  required
                  value={formData.head_name}
                  onChange={e => setFormData({...formData, head_name: e.target.value})}
                  placeholder="Full name of the head"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Contact Email *</label>
              <div className="admin-input-with-icon">
                <Mail size={18} />
                <input 
                  required 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="dept@university.edu"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Phone Number *</label>
              <div className="admin-input-with-icon">
                <Phone size={18} />
                <input 
                  required
                  value={formData.phone_number}
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+251..."
                />
              </div>
            </div>
          </div>

          <div className="admin-modal-actions">
            <button type="button" onClick={onClose} className="admin-btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="admin-btn-save">
              {loading ? (
                <>
                  <RefreshCw className="spinning" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Department
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
