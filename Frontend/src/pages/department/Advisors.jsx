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
  Users, UserCheck, RefreshCw, AlertTriangle, TrendingUp,
  BarChart3, CheckCircle, UserPlus, Search
} from 'lucide-react';
import './Advisors.css';

const Advisors = () => {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Filter advisors based on search term
  const filteredAdvisors = advisors.filter(advisor =>
    advisor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered advisors
  const sortedAdvisors = [...filteredAdvisors].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    // String comparison
    if (typeof aVal === 'string') {
      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Number comparison
    const comparison = aVal - bVal;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

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
      total: filteredAdvisors.length,
      activeStudents: filteredAdvisors.reduce((sum, a) => sum + (a.active_students || 0), 0),
      completed: filteredAdvisors.reduce((sum, a) => sum + (a.completed_students || 0), 0),
      avgWorkload: filteredAdvisors.length > 0
        ? Math.round(filteredAdvisors.reduce((sum, a) => sum + (a.active_students || 0), 0) / filteredAdvisors.length)
        : 0,
    };
  };

  const stats = getStats();

  const handleSortChange = (value) => {
    // Parse sort value (e.g., "-full_name" means descending)
    if (value.startsWith('-')) {
      setSortBy(value.substring(1));
      setSortDirection('desc');
    } else {
      setSortBy(value);
      setSortDirection('asc');
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Advisor Name',
      sortable: false, // Disable internal sorting
      render: (value, row) => (
        <button
          onClick={() => navigate(`/department/advisor/${row.id}/students`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#14a800',
            cursor: 'pointer',
            fontWeight: 600,
            textDecoration: 'underline',
            padding: 0,
            fontSize: 'inherit',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => e.target.style.color = '#108a00'}
          onMouseLeave={(e) => e.target.style.color = '#14a800'}
        >
          {value}
        </button>
      ),
    },
    {
      key: 'staff_id',
      label: 'Staff ID',
      sortable: false, // Disable internal sorting
    },
    {
      key: 'email',
      label: 'Email',
      sortable: false, // Disable internal sorting
    },
    {
      key: 'phone_number',
      label: 'Phone',
      sortable: false, // Disable internal sorting
      render: (value) => value || '-',
    },
    {
      key: 'active_students',
      label: 'Workload',
      sortable: false, // Disable internal sorting
      render: (value, row) => getWorkloadBar(value, row.total_assignments),
    },
    {
      key: 'total_assignments',
      label: 'Total Assigned',
      sortable: false, // Disable internal sorting
    },
    {
      key: 'completed_students',
      label: 'Completed',
      sortable: false, // Disable internal sorting
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

          <div className="adv-search-sort-row" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <div className="adv-search-wrapper" style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
              <input
                type="text"
                placeholder="Search advisors by name, staff ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 38px', borderRadius: 8,
                  border: '1px solid #E2E8F0', outline: 'none', fontSize: 14
                }}
              />
            </div>
            <select
              value={sortDirection === 'desc' ? `-${sortBy}` : sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
                outline: 'none', fontSize: 14, minWidth: 160, background: 'white'
              }}
            >
              <option value="full_name">Name (A-Z)</option>
              <option value="-full_name">Name (Z-A)</option>
              <option value="active_students">Workload (Low-High)</option>
              <option value="-active_students">Workload (High-Low)</option>
              <option value="-completed_students">Most Completed</option>
            </select>
          </div>
        </div>


        {/* Data Table */}
        <div className="adv-table-container">
          <DataTable
            columns={columns}
            data={sortedAdvisors}
            loading={loading}
            emptyMessage="No advisors found"
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Advisors;
