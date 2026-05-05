/**
 * Advisor Students Page
 * Shows all students assigned to a specific advisor with their internship details
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import {
  Users, ArrowLeft, RefreshCw, AlertTriangle, Building2,
  Calendar, CheckCircle, Clock, XCircle, User
} from 'lucide-react';
import './AdvisorStudents.css';

const AdvisorStudents = () => {
  const { advisorId } = useParams();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdvisorStudents();
  }, [advisorId]);

  const fetchAdvisorStudents = async () => {
    try {
      setLoading(true);
      // Fetch advisor details and their students
      const response = await departmentService.getAdvisorStudents(advisorId);
      
      if (response.success) {
        setAdvisor(response.data.advisor);
        setStudents(response.data.students || []);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load advisor students');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: '#14a800', bg: '#e8f5e9', icon: Clock, label: 'Active' },
      COMPLETED: { color: '#0284c7', bg: '#e0f2fe', icon: CheckCircle, label: 'Completed' },
      PENDING: { color: '#d97706', bg: '#fef3c7', icon: Clock, label: 'Pending' },
      INACTIVE: { color: '#6b7280', bg: '#f3f4f6', icon: XCircle, label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;
    const Icon = config.icon;

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '12px',
          backgroundColor: config.bg,
          color: config.color,
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <Icon size={14} />
        {config.label}
      </div>
    );
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Student Name',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14a800 0%, #16c200 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {value?.charAt(0) || 'S'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.student_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{value}</span>
        </div>
      ) : '-',
    },
    {
      key: 'internship_status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-',
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (value) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ) : '-',
    },
    {
      key: 'batch',
      label: 'Batch',
      sortable: true,
      render: (value) => value || '-',
    },
  ];

  const getStats = () => {
    return {
      total: filteredStudents.length,
      active: filteredStudents.filter(s => s.internship_status === 'ACTIVE').length,
      completed: filteredStudents.filter(s => s.internship_status === 'COMPLETED').length,
      pending: filteredStudents.filter(s => s.internship_status === 'PENDING').length,
    };
  };

  const stats = getStats();

  return (
    <div className="advisor-students-page">
      <Header
        title={advisor ? `${advisor.full_name}'s Students` : 'Advisor Students'}
        subtitle="View all students assigned to this advisor"
      />

      <div className="advisor-students-content">
        {/* Back Button */}
        <button
          onClick={() => navigate('/department/advisors')}
          className="back-button"
        >
          <ArrowLeft size={16} />
          Back to Advisors
        </button>

        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={fetchAdvisorStudents} className="retry-button">
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Advisor Info Card */}
        {advisor && (
          <div className="advisor-info-card">
            <div className="advisor-avatar-large">
              {advisor.full_name?.charAt(0) || 'A'}
            </div>
            <div className="advisor-details">
              <h2 className="advisor-name">{advisor.full_name}</h2>
              <div className="advisor-meta">
                <span><User size={14} /> {advisor.staff_id}</span>
                <span>•</span>
                <span>{advisor.email}</span>
                {advisor.phone_number && (
                  <>
                    <span>•</span>
                    <span>{advisor.phone_number}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon stat-icon-blue">
              <Users size={18} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Total Students</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <Clock size={18} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Active</span>
              <span className="stat-value">{stats.active}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <CheckCircle size={18} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{stats.completed}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow">
              <Clock size={18} />
            </div>
            <div className="stat-body">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="students-table-container">
          <div className="table-header">
            <h3 className="table-title">
              <Users size={16} />
              Students List
            </h3>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button
                onClick={fetchAdvisorStudents}
                className="refresh-button"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredStudents}
            loading={loading}
            emptyMessage="No students assigned to this advisor"
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvisorStudents;
