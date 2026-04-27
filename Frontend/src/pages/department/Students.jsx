/**
 * Students Page - Modern UI/UX Design
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

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
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
      NOT_APPLIED: { label: 'Not Applied', icon: Clock, className: 'st-status-pending' },
      APPLIED: { label: 'Applied', icon: UserCheck, className: 'st-status-applied' },
      ACTIVE: { label: 'Active', icon: CheckCircle, className: 'st-status-active' },
      COMPLETED: { label: 'Completed', icon: Award, className: 'st-status-completed' },
    };

    const config = statusConfig[status] || statusConfig.NOT_APPLIED;
    const IconComponent = config.icon;

    return (
      <span className={`st-status-badge ${config.className}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  const getStats = () => {
    return {
      total: students.length,
      notApplied: students.filter((s) => s.internship_status === 'NOT_APPLIED').length,
      applied: students.filter((s) => s.internship_status === 'APPLIED').length,
      active: students.filter((s) => s.internship_status === 'ACTIVE').length,
      completed: students.filter((s) => s.internship_status === 'COMPLETED').length,
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
    // Could open a modal with student details
    console.log('Student clicked:', student);
  };

  return (
    <div className="st-page">
      <Header
        title="Student Management"
        subtitle="Comprehensive oversight of all department students"
      />

      <div className="st-content">
        
        {/* Error Alert */}
        {error && (
          <div className="st-alert st-alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button 
              className="st-retry-btn"
              onClick={fetchStudents}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="st-stats-grid">
          <div className="st-stat-card st-stat-primary">
            <div className="st-stat-icon st-icon-blue">
              <Users size={18} />
            </div>
            <div className="st-stat-body">
              <span className="st-stat-label">Total Students</span>
              <span className="st-stat-value">{stats.total}</span>
            </div>
            <div className="st-stat-trend">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="st-stat-card">
            <div className="st-stat-icon st-icon-gray">
              <Clock size={18} />
            </div>
            <div className="st-stat-body">
              <span className="st-stat-label">Not Applied</span>
              <span className="st-stat-value">{stats.notApplied}</span>
            </div>
          </div>

          <div className="st-stat-card">
            <div className="st-stat-icon st-icon-yellow">
              <UserCheck size={18} />
            </div>
            <div className="st-stat-body">
              <span className="st-stat-label">Applied</span>
              <span className="st-stat-value">{stats.applied}</span>
            </div>
          </div>

          <div className="st-stat-card">
            <div className="st-stat-icon st-icon-green">
              <CheckCircle size={18} />
            </div>
            <div className="st-stat-body">
              <span className="st-stat-label">Active</span>
              <span className="st-stat-value">{stats.active}</span>
            </div>
          </div>

          <div className="st-stat-card">
            <div className="st-stat-icon st-icon-purple">
              <Award size={18} />
            </div>
            <div className="st-stat-body">
              <span className="st-stat-label">Completed</span>
              <span className="st-stat-value">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="st-filter-container">
          <div className="st-filter-header">
            <h3 className="st-filter-title">
              <Filter size={16} />
              Filter & Search
            </h3>
            <div className="st-filter-actions">
              <button 
                onClick={fetchStudents} 
                className="st-refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
              <button className="st-export-btn">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          <div className="st-filter-bar">
            <button
              className={`st-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <Users size={14} />
              <span className="st-filter-label">All Students</span>
              <span className="st-filter-count">{stats.total}</span>
            </button>

            <button
              className={`st-filter-btn ${statusFilter === 'not_applied' ? 'active' : ''}`}
              onClick={() => setStatusFilter('not_applied')}
            >
              <Clock size={14} />
              <span className="st-filter-label">Not Applied</span>
              <span className="st-filter-count">{stats.notApplied}</span>
            </button>

            <button
              className={`st-filter-btn ${statusFilter === 'applied' ? 'active' : ''}`}
              onClick={() => setStatusFilter('applied')}
            >
              <UserCheck size={14} />
              <span className="st-filter-label">Applied</span>
              <span className="st-filter-count">{stats.applied}</span>
            </button>

            <button
              className={`st-filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              <CheckCircle size={14} />
              <span className="st-filter-label">Active</span>
              <span className="st-filter-count">{stats.active}</span>
            </button>

            <button
              className={`st-filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              <Award size={14} />
              <span className="st-filter-label">Completed</span>
              <span className="st-filter-count">{stats.completed}</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="st-table-container">
          <DataTable
            columns={columns}
            data={students}
            onRowClick={handleRowClick}
            loading={loading}
            emptyMessage="No students found"
            searchPlaceholder="Search students by name, ID, or email..."
          />
        </div>
      </div>
    </div>
  );
};

export default Students;