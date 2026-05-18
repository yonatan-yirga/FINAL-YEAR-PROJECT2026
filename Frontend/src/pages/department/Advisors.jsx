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
import './ModernPremium.css';

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
    // Ensure filteredAdvisors is an array before filtering/reducing
    const advisorsArray = Array.isArray(filteredAdvisors) ? filteredAdvisors : [];
    return {
      total: advisorsArray.length,
      activeStudents: advisorsArray.reduce((sum, a) => sum + (a.active_students || 0), 0),
      completed: advisorsArray.reduce((sum, a) => sum + (a.completed_students || 0), 0),
      avgWorkload: advisorsArray.length > 0
        ? Math.round(advisorsArray.reduce((sum, a) => sum + (a.active_students || 0), 0) / advisorsArray.length)
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
    <div className="premium-page">
      <Header
        title="Advisor Management"
        subtitle="Monitor advisor workload and assignments"
      />

      <div className="premium-content">
        
        {/* Error Alert */}
        {error && (
          <div className="premium-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="premium-btn-primary"
              onClick={fetchAdvisors}
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
                <Users size={20} />
              </div>
              <div className="premium-stat-trend">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.total}</div>
            <div className="premium-stat-label">Total Advisors</div>
          </div>

          <div className="premium-stat-card success">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <UserCheck size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.activeStudents}</div>
            <div className="premium-stat-label">Active Students</div>
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

          <div className="premium-stat-card warning">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.avgWorkload}</div>
            <div className="premium-stat-label">Avg. Workload</div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="premium-filter-container">
          <div className="premium-filter-header">
            <h3 className="premium-filter-title">
              <Users size={18} />
              Advisor Directory
            </h3>
            <div className="premium-filter-actions">
              <button 
                onClick={() => navigate('/department/advisor-overload')}
                className="premium-btn premium-btn-secondary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <AlertTriangle size={14} />
                Resolve Overload
              </button>
              <button 
                onClick={() => navigate('/department/add-advisor')}
                className="premium-btn premium-btn-primary"
              >
                <UserPlus size={14} />
                Add Advisor
              </button>
              <button 
                onClick={fetchAdvisors} 
                className="premium-btn premium-btn-secondary"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="premium-search-row">
            <div className="premium-search-wrapper">
              <Search size={18} className="premium-search-icon" />
              <input
                type="text"
                placeholder="Search advisors by name, staff ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-search-input"
              />
            </div>
            <select
              value={sortDirection === 'desc' ? `-${sortBy}` : sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="premium-select"
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
        <div className="premium-table-container">
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
