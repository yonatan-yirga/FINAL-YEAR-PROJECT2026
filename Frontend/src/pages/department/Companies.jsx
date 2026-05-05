/**
 * Companies Page - Upwork-Inspired Design
 * List all companies with activity statistics
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import {
  Building2, RefreshCw, AlertTriangle, TrendingUp, Briefcase,
  Users, CheckCircle, AlertCircle, Shield, Search
} from 'lucide-react';
import './Companies.css';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ordering, setOrdering] = useState('company_name');

  useEffect(() => {
    fetchCompanies();
  }, [search, ordering]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getCompanies({ search, ordering });

      
      if (response.success) {
        setCompanies(response.data);
        setError(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlacklist = async (company) => {
    const reason = !company.is_blacklisted ? window.prompt("Reason for blacklisting this company?") : "";
    if (!company.is_blacklisted && reason === null) return;
    
    try {
      setLoading(true);
      const res = await departmentService.blacklistCompany(company.id, {
        is_blacklisted: !company.is_blacklisted,
        reason: reason || ""
      });
      if (res.success) {
        fetchCompanies();
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Failed to update company status');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    return {
      total: companies.length,
      totalInternships: companies.reduce((sum, c) => sum + c.posted_internships, 0),
      activeInterns: companies.reduce((sum, c) => sum + c.active_interns, 0),
      completed: companies.reduce((sum, c) => sum + c.completed_interns, 0),
    };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'company_name',
      label: 'Company Name',
      sortable: true,
    },
    {
      key: 'contact_person',
      label: 'Contact Person',
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
      key: 'city',
      label: 'City',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      key: 'posted_internships',
      label: 'Posted',
      sortable: true,
    },
    {
      key: 'is_blacklisted',
      label: 'Authority Status',
      sortable: true,
      render: (val) => (
        <span className={`comp-status-badge ${val ? 'blacklisted' : 'compliant'}`}>
          {val ? (
            <>
              <AlertCircle size={12} />
              Blacklisted
            </>
          ) : (
            <>
              <CheckCircle size={12} />
              Compliant
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Authority Actions',
      render: (_, row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleToggleBlacklist(row); }}
          className={`comp-action-btn ${row.is_blacklisted ? 'remove' : 'blacklist'}`}
        >
          {row.is_blacklisted ? (
            <>
              <Shield size={12} />
              Remove Blacklist
            </>
          ) : (
            <>
              <AlertCircle size={12} />
              Blacklist
            </>
          )}
        </button>
      )
    }
  ];

  return (
    <div className="comp-page">
      <Header
        title="Company Management"
        subtitle="View all registered companies and their activity"
      />

      <div className="comp-content">
        
        {/* Error Alert */}
        {error && (
          <div className="comp-alert comp-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="comp-retry-btn"
              onClick={fetchCompanies}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="comp-stats-grid">
          <div className="comp-stat-card comp-stat-primary">
            <div className="comp-stat-icon comp-icon-green">
              <Building2 size={18} />
            </div>
            <div className="comp-stat-body">
              <span className="comp-stat-label">Total Companies</span>
              <span className="comp-stat-value">{stats.total}</span>
            </div>
            <div className="comp-stat-trend">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="comp-stat-card">
            <div className="comp-stat-icon comp-icon-blue">
              <Briefcase size={18} />
            </div>
            <div className="comp-stat-body">
              <span className="comp-stat-label">Total Internships</span>
              <span className="comp-stat-value">{stats.totalInternships}</span>
            </div>
          </div>

          <div className="comp-stat-card">
            <div className="comp-stat-icon comp-icon-yellow">
              <Users size={18} />
            </div>
            <div className="comp-stat-body">
              <span className="comp-stat-label">Active Interns</span>
              <span className="comp-stat-value">{stats.activeInterns}</span>
            </div>
          </div>

          <div className="comp-stat-card">
            <div className="comp-stat-icon comp-icon-purple">
              <CheckCircle size={18} />
            </div>
            <div className="comp-stat-body">
              <span className="comp-stat-label">Completed</span>
              <span className="comp-stat-value">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* Filter and Actions Bar */}
        <div className="comp-filter-container">
          <div className="comp-filter-header">
            <h3 className="comp-filter-title">
              <Building2 size={16} />
              Company Directory
            </h3>
            <div className="comp-filter-actions">
              <button 
                onClick={fetchCompanies} 
                className="comp-refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="comp-search-sort-row" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <div className="comp-search-wrapper" style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
              <input
                type="text"
                placeholder="Search companies by name or contact person..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (window.compTimeout) clearTimeout(window.compTimeout);
                  window.compTimeout = setTimeout(() => setSearch(e.target.value), 400);
                }}
                style={{
                  width: '100%', padding: '10px 12px 10px 38px', borderRadius: 8,
                  border: '1px solid #E2E8F0', outline: 'none', fontSize: 14
                }}
              />
            </div>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              style={{
                padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
                outline: 'none', fontSize: 14, minWidth: 160, background: 'white'
              }}
            >
              <option value="company_name">Name (A-Z)</option>
              <option value="-company_name">Name (Z-A)</option>
              <option value="-posted_internships">Most Posted</option>
              <option value="-active_interns">Most Active Interns</option>
              <option value="city">City (A-Z)</option>
            </select>
          </div>
        </div>


        {/* Data Table */}
        <div className="comp-table-container">
          <DataTable
            columns={columns}
            data={companies}
            loading={loading}
            emptyMessage="No companies found"
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Companies;
