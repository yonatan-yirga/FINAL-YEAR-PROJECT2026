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
import './ModernPremium.css';

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
      PENDING_ADVISOR: { label: 'Pending Advisor', icon: Clock, className: 'warning' },
      SUBMITTED_TO_DEPARTMENT: { label: 'Submitted', icon: Send, className: 'info' },
      COMPLETED: { label: 'Completed', icon: CheckCircle, className: 'purple' },
    };

    const config = statusConfig[status] || statusConfig.PENDING_ADVISOR;
    const IconComponent = config.icon;

    return (
      <span className={`premium-badge ${config.className}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  const getStats = () => {
    // Ensure reports is an array before filtering
    const reportsArray = Array.isArray(reports) ? reports : [];
    return {
      total: reportsArray.length,
      pending: reportsArray.filter((r) => r.status === 'PENDING_ADVISOR').length,
      submitted: reportsArray.filter((r) => r.status === 'SUBMITTED_TO_DEPARTMENT').length,
      completed: reportsArray.filter((r) => r.status === 'COMPLETED').length,
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
          className={`premium-btn ${!value ? 'premium-btn-secondary' : 'premium-btn-primary'}`}
          style={{ 
            padding: '8px 14px',
            fontSize: '12px',
            opacity: !value ? 0.5 : 1,
            cursor: !value ? 'not-allowed' : 'pointer'
          }}
        >
          <Download size={12} />
          Download
        </button>
      ),
    },
  ];

  return (
    <div className="premium-page">
      <Header
        title="Final Reports"
        subtitle="View and download internship completion reports"
      />

      <div className="premium-content">
        
        {/* Error Alert */}
        {error && (
          <div className="premium-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="premium-btn-primary"
              onClick={fetchReports}
              style={{ marginLeft: 'auto', padding: '8px 16px' }}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="premium-stats-grid">
          <div className="premium-stat-card primary">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <FileText size={20} />
              </div>
              <div className="premium-stat-trend">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.total}</div>
            <div className="premium-stat-label">Total Reports</div>
          </div>

          <div className="premium-stat-card warning">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Clock size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.pending}</div>
            <div className="premium-stat-label">Pending Advisor</div>
          </div>

          <div className="premium-stat-card success">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Send size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.submitted}</div>
            <div className="premium-stat-label">Submitted</div>
          </div>

          <div className="premium-stat-card purple">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.completed}</div>
            <div className="premium-stat-label">Completed</div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="premium-filter-container">
          <div className="premium-filter-header">
            <h3 className="premium-filter-title">
              <Filter size={18} />
              Filter Reports
            </h3>
            <div className="premium-filter-actions">
              <button 
                onClick={fetchReports} 
                className="premium-btn premium-btn-secondary"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="premium-filter-pills">
            <button
              className={`premium-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <FileText size={14} />
              All Reports
              <span className="premium-filter-count">{stats.total}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'pending_advisor' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending_advisor')}
            >
              <Clock size={14} />
              Pending Advisor
              <span className="premium-filter-count">{stats.pending}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'submitted_to_department' ? 'active' : ''}`}
              onClick={() => setStatusFilter('submitted_to_department')}
            >
              <Send size={14} />
              Submitted
              <span className="premium-filter-count">{stats.submitted}</span>
            </button>

            <button
              className={`premium-filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              <CheckCircle size={14} />
              Completed
              <span className="premium-filter-count">{stats.completed}</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="premium-table-container">
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
