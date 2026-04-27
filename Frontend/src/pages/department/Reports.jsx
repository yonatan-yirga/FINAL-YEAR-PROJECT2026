/**
 * Reports Page - Upwork-Inspired Design
 * View all final internship reports
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import {
  FileText, RefreshCw, AlertTriangle, Download, Clock,
  CheckCircle, Send, Filter, TrendingUp
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await departmentService.getReports(params);
      
      if (response.success) {
        setReports(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (report) => {
    if (report.pdf_file) {
      departmentService.downloadReport(report.pdf_file);
    } else {
      alert('PDF file not available yet');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_ADVISOR: { label: 'Pending Advisor', icon: Clock, className: 'rep-status-pending' },
      SUBMITTED_TO_DEPARTMENT: { label: 'Submitted', icon: Send, className: 'rep-status-submitted' },
      COMPLETED: { label: 'Completed', icon: CheckCircle, className: 'rep-status-completed' },
    };

    const config = statusConfig[status] || statusConfig.PENDING_ADVISOR;
    const IconComponent = config.icon;

    return (
      <span className={`rep-status-badge ${config.className}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  const getStats = () => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'PENDING_ADVISOR').length,
      submitted: reports.filter((r) => r.status === 'SUBMITTED_TO_DEPARTMENT').length,
      completed: reports.filter((r) => r.status === 'COMPLETED').length,
    };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'student_name',
      label: 'Student Name',
      sortable: true,
    },
    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'advisor_name',
      label: 'Advisor',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'company_submitted_at',
      label: 'Company Submitted',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      key: 'advisor_submitted_at',
      label: 'Advisor Submitted',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      key: 'pdf_file',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadReport(row);
          }}
          disabled={!value}
          className={`rep-download-btn ${!value ? 'disabled' : ''}`}
        >
          <Download size={12} />
          Download
        </button>
      ),
    },
  ];

  return (
    <div className="rep-page">
      <Header
        title="Final Reports"
        subtitle="View and download internship completion reports"
      />

      <div className="rep-content">
        
        {/* Error Alert */}
        {error && (
          <div className="rep-alert rep-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="rep-retry-btn"
              onClick={fetchReports}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="rep-stats-grid">
          <div className="rep-stat-card rep-stat-primary">
            <div className="rep-stat-icon rep-icon-green">
              <FileText size={18} />
            </div>
            <div className="rep-stat-body">
              <span className="rep-stat-label">Total Reports</span>
              <span className="rep-stat-value">{stats.total}</span>
            </div>
            <div className="rep-stat-trend">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="rep-stat-card">
            <div className="rep-stat-icon rep-icon-yellow">
              <Clock size={18} />
            </div>
            <div className="rep-stat-body">
              <span className="rep-stat-label">Pending Advisor</span>
              <span className="rep-stat-value">{stats.pending}</span>
            </div>
          </div>

          <div className="rep-stat-card">
            <div className="rep-stat-icon rep-icon-blue">
              <Send size={18} />
            </div>
            <div className="rep-stat-body">
              <span className="rep-stat-label">Submitted</span>
              <span className="rep-stat-value">{stats.submitted}</span>
            </div>
          </div>

          <div className="rep-stat-card">
            <div className="rep-stat-icon rep-icon-purple">
              <CheckCircle size={18} />
            </div>
            <div className="rep-stat-body">
              <span className="rep-stat-label">Completed</span>
              <span className="rep-stat-value">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="rep-filter-container">
          <div className="rep-filter-header">
            <h3 className="rep-filter-title">
              <Filter size={16} />
              Filter & Search
            </h3>
            <div className="rep-filter-actions">
              <button 
                onClick={fetchReports} 
                className="rep-refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="rep-filter-bar">
            <button
              className={`rep-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <FileText size={14} />
              <span className="rep-filter-label">All Reports</span>
              <span className="rep-filter-count">{stats.total}</span>
            </button>

            <button
              className={`rep-filter-btn ${statusFilter === 'pending_advisor' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending_advisor')}
            >
              <Clock size={14} />
              <span className="rep-filter-label">Pending Advisor</span>
              <span className="rep-filter-count">{stats.pending}</span>
            </button>

            <button
              className={`rep-filter-btn ${statusFilter === 'submitted_to_department' ? 'active' : ''}`}
              onClick={() => setStatusFilter('submitted_to_department')}
            >
              <Send size={14} />
              <span className="rep-filter-label">Submitted</span>
              <span className="rep-filter-count">{stats.submitted}</span>
            </button>

            <button
              className={`rep-filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              <CheckCircle size={14} />
              <span className="rep-filter-label">Completed</span>
              <span className="rep-filter-count">{stats.completed}</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="rep-table-container">
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
            emptyMessage="No reports found"
            searchPlaceholder="Search reports by student or company name..."
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
