/**
 * Students Page - Modern Premium UI/UX Design
 * List and manage all students in department
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import {
  Users, UserCheck, UserX, Award, Building2, UserCog,
  Calendar, Mail, Phone, MapPin, Search, Filter, RefreshCw,
  Download, Eye, AlertTriangle, CheckCircle, Clock, TrendingUp
} from 'lucide-react';
import './Students.css';
import './ModernPremium.css';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  useEffect(() => {
    fetchStudents();
  }, [statusFilter, ordering, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        ordering,
        search
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await departmentService.getStudents(params);

      
      if (response.success) {
        setStudents(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      NOT_APPLIED: { label: 'Not Assigned', icon: Clock, className: 'premium-badge info' },
      APPLIED: { label: 'Assigned', icon: UserCheck, className: 'premium-badge warning' },
      ACTIVE: { label: 'Active', icon: CheckCircle, className: 'premium-badge success' },
      COMPLETED: { label: 'Completed', icon: Award, className: 'premium-badge purple' },
    };

    const config = statusConfig[status] || statusConfig.NOT_APPLIED;
    const IconComponent = config.icon;

    return (
      <span className={config.className}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  const getStats = () => {
    // Ensure students is an array before filtering
    const studentsArray = Array.isArray(students) ? students : [];
    return {
      total: studentsArray.length,
      notAssigned: studentsArray.filter((s) => s.internship_status === 'NOT_APPLIED').length,
      assigned: studentsArray.filter((s) => s.internship_status === 'APPLIED').length,
      active: studentsArray.filter((s) => s.internship_status === 'ACTIVE').length,
      completed: studentsArray.filter((s) => s.internship_status === 'COMPLETED').length,
    };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'full_name',
      label: 'Student Name',
      sortable: true,
    },
    {
      key: 'university_id',
      label: 'University ID',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'internship_status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'company_name',
      label: 'Company',
      render: (value) => value || '-',
    },
    {
      key: 'advisor_name',
      label: 'Advisor',
      render: (value) => value || '-',
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (value) => value || '-',
    },
  ];

  const handleRowClick = (student) => {
    // Navigate to student detail page
    navigate(`/department/students/${student.id}`);
  };

  const handleExport = () => {
    if (students.length === 0) return;

    // Define CSV headers
    const headers = ['Full Name', 'University ID', 'Email', 'Status', 'Company', 'Advisor', 'Start Date'];
    
    // Map student data to rows
    const rows = students.map(s => [
      s.full_name || '',
      s.university_id || '',
      s.email || '',
      s.internship_status || '',
      s.company_name || '-',
      s.advisor_name || '-',
      s.start_date || '-'
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="premium-page">
      <Header
        title="Student Management"
        subtitle="Comprehensive oversight of all department students"
      />

      <div className="premium-content">
        
        {/* Error Alert */}
        {error && (
          <div className="premium-alert error">
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button 
              className="premium-btn premium-btn-secondary"
              onClick={fetchStudents}
              style={{ marginLeft: 'auto' }}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="premium-stats-grid">
          <div className="premium-stat-card primary" onClick={() => navigate('/department/students')}>
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Users size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.total}</div>
            <div className="premium-stat-label">Total Students</div>
            <div className="premium-stat-trend">
              <TrendingUp size={14} />
              <span>View all</span>
            </div>
          </div>

          <div className="premium-stat-card">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Clock size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.notAssigned}</div>
            <div className="premium-stat-label">Not Assigned</div>
            <div className="premium-stat-trend">
              <span>Pending action</span>
            </div>
          </div>

          <div className="premium-stat-card warning">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <UserCheck size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.assigned}</div>
            <div className="premium-stat-label">Assigned</div>
            <div className="premium-stat-trend">
              <span>In progress</span>
            </div>
          </div>

          <div className="premium-stat-card success">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.active}</div>
            <div className="premium-stat-label">Active</div>
            <div className="premium-stat-trend">
              <span>Currently working</span>
            </div>
          </div>

          <div className="premium-stat-card purple">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Award size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.completed}</div>
            <div className="premium-stat-label">Completed</div>
            <div className="premium-stat-trend">
              <span>Finished</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="premium-filter-container">
          <div className="premium-filter-header">
            <h3 className="premium-filter-title">
              <Filter size={16} />
              Filter & Search
            </h3>
            <div className="premium-filter-actions">
              <button 
                onClick={fetchStudents} 
                className="premium-btn premium-btn-secondary"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
              <button 
                onClick={handleExport} 
                className="premium-btn premium-btn-primary"
                disabled={loading || students.length === 0}
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          <div className="premium-filter-pills">
            <button
              className={`premium-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <Users size={14} />
              <span>All Students</span>
              <span className="premium-filter-count">{stats.total}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'not_applied' ? 'active' : ''}`}
              onClick={() => setStatusFilter('not_applied')}
            >
              <Clock size={14} />
              <span>Not Assigned</span>
              <span className="premium-filter-count">{stats.notAssigned}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'applied' ? 'active' : ''}`}
              onClick={() => setStatusFilter('applied')}
            >
              <UserCheck size={14} />
              <span>Assigned</span>
              <span className="premium-filter-count">{stats.assigned}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              <CheckCircle size={14} />
              <span>Active</span>
              <span className="premium-filter-count">{stats.active}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              <Award size={14} />
              <span>Completed</span>
              <span className="premium-filter-count">{stats.completed}</span>
            </button>
          </div>

          <div className="premium-search-row">
            <div className="premium-search-wrapper">
              <Search className="premium-search-icon" size={16} />
              <input
                type="text"
                className="premium-search-input"
                placeholder="Search students by name, ID, or email..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (window.stTimeout) clearTimeout(window.stTimeout);
                  window.stTimeout = setTimeout(() => setSearch(e.target.value), 400);
                }}
              />
            </div>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="premium-select"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="full_name">Name (A-Z)</option>
              <option value="-full_name">Name (Z-A)</option>
              <option value="university_id">ID (Asc)</option>
              <option value="-university_id">ID (Desc)</option>
            </select>
          </div>
        </div>


        {/* Data Table */}
        <div className="premium-table-container">
          <DataTable
            columns={columns}
            data={students}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No students found"
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Students;