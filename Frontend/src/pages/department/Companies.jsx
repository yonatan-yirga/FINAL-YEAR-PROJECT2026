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
import './ModernPremium.css';

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
    // Ensure companies is an array before filtering/reducing
    const companiesArray = Array.isArray(companies) ? companies : [];
    return {
      total: companiesArray.length,
      totalInternships: companiesArray.reduce((sum, c) => sum + (c.posted_internships || 0), 0),
      activeInterns: companiesArray.reduce((sum, c) => sum + (c.active_interns || 0), 0),
      completed: companiesArray.reduce((sum, c) => sum + (c.completed_interns || 0), 0),
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
        <span className={`premium-badge ${val ? 'error' : 'success'}`}>
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
          className={`premium-btn ${row.is_blacklisted ? 'premium-btn-primary' : 'premium-btn-secondary'}`}
          style={{ 
            padding: '8px 14px',
            fontSize: '12px',
            background: row.is_blacklisted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none'
          }}
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
    <div className="premium-page">
      <Header
        title="Company Management"
        subtitle="View all registered companies and their activity"
      />

      <div className="premium-content">
        
        {/* Error Alert */}
        {error && (
          <div className="premium-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="premium-btn-primary"
              onClick={fetchCompanies}
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
                <Building2 size={20} />
              </div>
              <div className="premium-stat-trend">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.total}</div>
            <div className="premium-stat-label">Total Companies</div>
          </div>

          <div className="premium-stat-card success">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Briefcase size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.totalInternships}</div>
            <div className="premium-stat-label">Total Internships</div>
          </div>

          <div className="premium-stat-card warning">
            <div className="premium-stat-header">
              <div className="premium-stat-icon">
                <Users size={20} />
              </div>
            </div>
            <div className="premium-stat-value">{stats.activeInterns}</div>
            <div className="premium-stat-label">Active Interns</div>
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
              <Building2 size={18} />
              Company Directory
            </h3>
            <div className="premium-filter-actions">
              <button 
                onClick={fetchCompanies} 
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
                placeholder="Search companies by name or contact person..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (window.compTimeout) clearTimeout(window.compTimeout);
                  window.compTimeout = setTimeout(() => setSearch(e.target.value), 400);
                }}
                className="premium-search-input"
              />
            </div>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="premium-select"
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
        <div className="premium-table-container">
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
