/**
 * Advisors Page - Upwork-Inspired Design
 * List all advisors with workload information
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import {
  Users, UserCheck, Award, RefreshCw, AlertTriangle, TrendingUp,
  BarChart3, CheckCircle, UserPlus
} from 'lucide-react';
import './Advisors.css';

const Advisors = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAdvisors();
      
      if (response.success) {
        setAdvisors(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load advisors');
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadBar = (active, max) => {
    const limit = max || 15;
    const percentage = (active / limit) * 100;
    const isOverloaded = active > limit;
    const color = isOverloaded ? '#dc2626' : percentage > 80 ? '#d97706' : '#14a800';

    return (
      <div className="adv-workload-wrapper">
        <div className={`adv-workload-container ${isOverloaded ? 'overloaded' : ''}`}>
          <div className="adv-workload-bar" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }} />
          <span className="adv-workload-text">{active} / {limit}</span>
        </div>
        {isOverloaded && <span className="adv-overload-badge">⚠️ POLICY OVERLOAD</span>}
      </div>
    );
  };

  const getStats = () => {
    return {
      total: advisors.length,
      activeStudents: advisors.reduce((sum, a) => sum + a.active_students, 0),
      completed: advisors.reduce((sum, a) => sum + a.completed_students, 0),
      avgWorkload: advisors.length > 0
        ? Math.round(advisors.reduce((sum, a) => sum + a.active_students, 0) / advisors.length)
        : 0,
    };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'full_name',
      label: 'Advisor Name',
      sortable: true,
    },
    {
      key: 'staff_id',
      label: 'Staff ID',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone_number',
      label: 'Phone',
      render: (value) => value || '-',
    },
    {
      key: 'active_students',
      label: 'Workload',
      sortable: true,
      render: (value, row) => getWorkloadBar(value, row.total_assignments),
    },
    {
      key: 'total_assignments',
      label: 'Total Assigned',
      sortable: true,
    },
    {
      key: 'completed_students',
      label: 'Completed',
      sortable: true,
    },
  ];

  return (
    <div className="adv-page">
      <Header
        title="Advisor Management"
        subtitle="Monitor advisor workload and assignments"
      />

      <div className="adv-content">
        
        {/* Error Alert */}
        {error && (
          <div className="adv-alert adv-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="adv-retry-btn"
              onClick={fetchAdvisors}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="adv-stats-grid">
          <div className="adv-stat-card adv-stat-primary">
            <div className="adv-stat-icon adv-icon-green">
              <Users size={18} />
            </div>
            <div className="adv-stat-body">
              <span className="adv-stat-label">Total Advisors</span>
              <span className="adv-stat-value">{stats.total}</span>
            </div>
            <div className="adv-stat-trend">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="adv-stat-card">
            <div className="adv-stat-icon adv-icon-blue">
              <UserCheck size={18} />
            </div>
            <div className="adv-stat-body">
              <span className="adv-stat-label">Active Students</span>
              <span className="adv-stat-value">{stats.activeStudents}</span>
            </div>
          </div>

          <div className="adv-stat-card">
            <div className="adv-stat-icon adv-icon-purple">
              <CheckCircle size={18} />
            </div>
            <div className="adv-stat-body">
              <span className="adv-stat-label">Completed</span>
              <span className="adv-stat-value">{stats.completed}</span>
            </div>
          </div>

          <div className="adv-stat-card">
            <div className="adv-stat-icon adv-icon-yellow">
              <BarChart3 size={18} />
            </div>
            <div className="adv-stat-body">
              <span className="adv-stat-label">Avg. Workload</span>
              <span className="adv-stat-value">{stats.avgWorkload}</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="adv-filter-container">
          <div className="adv-filter-header">
            <h3 className="adv-filter-title">
              <Users size={16} />
              Advisor Directory
            </h3>
            <div className="adv-filter-actions">
              <button 
                onClick={() => navigate('/department/add-advisor')}
                className="adv-add-btn"
              >
                <UserPlus size={14} />
                Add Advisor
              </button>
              <button 
                onClick={fetchAdvisors} 
                className="adv-refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="adv-table-container">
          <DataTable
            columns={columns}
            data={advisors}
            loading={loading}
            emptyMessage="No advisors found"
            searchPlaceholder="Search advisors by name or staff ID..."
          />
        </div>
      </div>
    </div>
  );
};

export default Advisors;
