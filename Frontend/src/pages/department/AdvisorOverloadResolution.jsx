/**
 * Advisor Overload Resolution Page
 * Tool for redistributing students from overloaded advisors
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import {
  AlertTriangle, Users, ArrowRight, CheckCircle, RefreshCw,
  UserCheck, TrendingDown, Info, X, TrendingUp
} from 'lucide-react';
import './AdvisorOverloadResolution.css';
import './ModernPremium.css';

const AdvisorOverloadResolution = () => {
  const navigate = useNavigate();
  const [overloadedAdvisors, setOverloadedAdvisors] = useState([]);
  const [availableAdvisors, setAvailableAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFromAdvisor, setSelectedFromAdvisor] = useState(null);
  const [selectedToAdvisor, setSelectedToAdvisor] = useState(null);
  const [reassigning, setReassigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overloadedRes, availableRes] = await Promise.all([
        departmentService.getOverloadedAdvisors(),
        departmentService.getAvailableAdvisors()
      ]);

      if (overloadedRes.success) {
        setOverloadedAdvisors(overloadedRes.data.advisors || []);
      } else {
        setError(overloadedRes.error);
      }

      if (availableRes.success) {
        setAvailableAdvisors(availableRes.data.advisors || []);
      }
    } catch (err) {
      setError('Failed to load advisor data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAdvisor = (advisor) => {
    setSelectedFromAdvisor(advisor);
    setSelectedStudents([]);
    setSelectedToAdvisor(null);
  };

  // Filter available advisors by location when an overloaded advisor is selected
  const filteredAvailableAdvisors = selectedFromAdvisor
    ? availableAdvisors.filter(advisor => 
        advisor.advising_location && 
        selectedFromAdvisor.advising_location &&
        advisor.advising_location.toLowerCase().trim() === selectedFromAdvisor.advising_location.toLowerCase().trim()
      )
    : availableAdvisors;

  const handleToggleStudent = (assignmentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(assignmentId)) {
        return prev.filter(id => id !== assignmentId);
      } else {
        return [...prev, assignmentId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    if (!selectedFromAdvisor) return;
    
    const allIds = selectedFromAdvisor.students.map(s => s.assignment_id);
    if (selectedStudents.length === allIds.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allIds);
    }
  };

  const handleReassign = async () => {
    if (!selectedFromAdvisor || !selectedToAdvisor || selectedStudents.length === 0) {
      return;
    }

    // Check capacity
    if (selectedToAdvisor.available_capacity < selectedStudents.length) {
      setError(`Target advisor only has capacity for ${selectedToAdvisor.available_capacity} students, but you selected ${selectedStudents.length}`);
      return;
    }

    try {
      setReassigning(true);
      setError(null);

      const response = await departmentService.reassignStudents({
        from_advisor_id: selectedFromAdvisor.advisor_id,
        to_advisor_id: selectedToAdvisor.advisor_id,
        assignment_ids: selectedStudents
      });

      if (response.success) {
        setSuccessMessage(`Successfully reassigned ${response.data.reassigned_count} students!`);
        setSelectedStudents([]);
        setSelectedFromAdvisor(null);
        setSelectedToAdvisor(null);
        
        // Refresh data
        setTimeout(() => {
          fetchData();
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to reassign students');
    } finally {
      setReassigning(false);
    }
  };

  const getWorkloadColor = (percentage) => {
    if (percentage >= 100) return '#dc2626';
    if (percentage >= 80) return '#d97706';
    return '#14a800';
  };

  if (loading) {
    return (
      <div className="premium-page">
        <Header
          title="Advisor Overload Resolution"
          subtitle="Redistribute students to balance workload"
        />
        <div className="premium-loading">
          <div className="premium-loading-spinner"></div>
          <p>Loading advisor data...</p>
        </div>
      </div>
    );
  }

  // Table columns for Overloaded Advisors
  const overloadedAdvisorsColumns = [
    {
      key: 'advisor_name',
      label: 'Advisor Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{value}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{row.advisor_email}</div>
        </div>
      )
    },
    {
      key: 'advising_location',
      label: 'Location',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          {value || 'Not specified'}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '13px' }}>{value}</span>
      )
    },
    {
      key: 'current_load',
      label: 'Current Load',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
            {value} / {row.max_students}
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: '#f1f5f9', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(row.percentage, 100)}%`,
              height: '100%',
              background: getWorkloadColor(row.percentage),
              borderRadius: '3px',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )
    },
    {
      key: 'percentage',
      label: 'Capacity',
      sortable: true,
      render: (value) => (
        <span className="premium-badge" style={{ 
          fontSize: '11px',
          background: value >= 100 ? '#fee2e2' : '#fef3c7',
          color: value >= 100 ? '#991b1b' : '#92400e'
        }}>
          {value}%
        </span>
      )
    },
    {
      key: 'excess',
      label: 'Over Limit',
      sortable: true,
      render: (value) => (
        <span className="premium-badge" style={{ 
          fontSize: '12px', 
          fontWeight: 700,
          background: '#fee2e2',
          color: '#991b1b'
        }}>
          +{value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAdvisor(row);
          }}
          className={`premium-btn ${selectedFromAdvisor?.advisor_id === row.advisor_id ? 'premium-btn-primary' : 'premium-btn-secondary'}`}
          style={{ 
            padding: '8px 14px',
            fontSize: '12px'
          }}
        >
          {selectedFromAdvisor?.advisor_id === row.advisor_id ? (
            <>
              <CheckCircle size={12} />
              Selected
            </>
          ) : (
            <>
              <UserCheck size={12} />
              Select
            </>
          )}
        </button>
      )
    }
  ];

  // Table columns for Students
  const studentsColumns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedFromAdvisor && selectedStudents.length === selectedFromAdvisor.students.length && selectedFromAdvisor.students.length > 0}
          onChange={handleSelectAllStudents}
          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
        />
      ),
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedStudents.includes(row.assignment_id)}
          onChange={() => handleToggleStudent(row.assignment_id)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }}
        />
      )
    },
    {
      key: 'student_name',
      label: 'Student Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{value}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{row.university_id}</div>
        </div>
      )
    },
    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{value}</span>
      )
    },
    {
      key: 'internship_title',
      label: 'Internship',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>
      )
    },
    {
      key: 'assigned_date',
      label: 'Assigned Date',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Table columns for Available Advisors
  const availableAdvisorsColumns = [
    {
      key: 'advisor_name',
      label: 'Advisor Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{row.advisor_email}</div>
        </div>
      )
    },
    {
      key: 'advising_location',
      label: 'Location',
      sortable: true,
      render: (value) => (
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          {value || 'Not specified'}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'current_load',
      label: 'Current Load',
      sortable: true,
      render: (value, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            {value} / {row.max_students}
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: '#f1f5f9', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${row.percentage}%`,
              height: '100%',
              background: getWorkloadColor(row.percentage),
              borderRadius: '3px',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )
    },
    {
      key: 'percentage',
      label: 'Capacity',
      sortable: true,
      render: (value) => (
        <span className="premium-badge info" style={{ fontSize: '11px' }}>
          {value}%
        </span>
      )
    },
    {
      key: 'available_capacity',
      label: 'Available Slots',
      sortable: true,
      render: (value) => (
        <span className="premium-badge success" style={{ fontSize: '12px', fontWeight: 700 }}>
          {value} slots
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (selectedStudents.length <= row.available_capacity) {
              setSelectedToAdvisor(row);
            }
          }}
          disabled={selectedStudents.length > row.available_capacity || selectedStudents.length === 0}
          className={`premium-btn ${selectedToAdvisor?.advisor_id === row.advisor_id ? 'premium-btn-primary' : 'premium-btn-secondary'}`}
          style={{ 
            padding: '8px 14px',
            fontSize: '12px',
            opacity: (selectedStudents.length > row.available_capacity || selectedStudents.length === 0) ? 0.5 : 1,
            cursor: (selectedStudents.length > row.available_capacity || selectedStudents.length === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          {selectedToAdvisor?.advisor_id === row.advisor_id ? (
            <>
              <CheckCircle size={12} />
              Selected
            </>
          ) : (
            <>
              <UserCheck size={12} />
              Select
            </>
          )}
        </button>
      )
    }
  ];

  return (
    <div className="premium-page aor-modern-page">
      <Header
        title="Advisor Overload Resolution"
        subtitle="Redistribute students to balance workload"
      />

      <div className="premium-content">
        {/* Statistics Dashboard */}
        <div className="aor-stats-grid">
          <div className="aor-stat-card danger">
            <div className="aor-stat-icon-wrapper">
              <AlertTriangle size={24} />
            </div>
            <div className="aor-stat-content">
              <div className="aor-stat-value">{overloadedAdvisors.length}</div>
              <div className="aor-stat-label">Overloaded Advisors</div>
            </div>
          </div>

          <div className="aor-stat-card success">
            <div className="aor-stat-icon-wrapper">
              <UserCheck size={24} />
            </div>
            <div className="aor-stat-content">
              <div className="aor-stat-value">{availableAdvisors.length}</div>
              <div className="aor-stat-label">Available Advisors</div>
            </div>
          </div>

          <div className="aor-stat-card primary">
            <div className="aor-stat-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="aor-stat-content">
              <div className="aor-stat-value">{selectedStudents.length}</div>
              <div className="aor-stat-label">Students Selected</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="aor-alert aor-alert-success">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="aor-alert aor-alert-error">
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button 
              className="aor-alert-close"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Info Banner */}
        {overloadedAdvisors.length === 0 ? (
          <div className="aor-alert aor-alert-success">
            <CheckCircle size={20} />
            <span>✅ No overloaded advisors found! All advisors are within their capacity limits.</span>
          </div>
        ) : (
          <div className="aor-alert aor-alert-warning">
            <AlertTriangle size={20} />
            <span>
              ⚠️ {overloadedAdvisors.length} advisor{overloadedAdvisors.length > 1 ? 's are' : ' is'} overloaded. 
              Select an advisor below to redistribute their students.
            </span>
          </div>
        )}

        {/* Main Grid */}
        <div className="aor-modern-grid">
          {/* Left Panel: Overloaded Advisors - TABLE FORMAT */}
          <div className="aor-modern-panel aor-table-panel">
            <div className="aor-modern-panel-header danger">
              <div className="aor-panel-title">
                <AlertTriangle size={18} />
                <h3>Overloaded Advisors ({overloadedAdvisors.length})</h3>
              </div>
              <button 
                onClick={fetchData} 
                className="aor-icon-btn"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              </button>
            </div>

            <div className="aor-modern-table-wrapper">
              {overloadedAdvisors.length === 0 ? (
                <div className="aor-modern-empty">
                  <CheckCircle size={48} />
                  <p>No overloaded advisors</p>
                </div>
              ) : (
                <DataTable
                  columns={overloadedAdvisorsColumns}
                  data={overloadedAdvisors}
                  loading={false}
                  emptyMessage="No overloaded advisors"
                  searchable={false}
                  onRowClick={handleSelectAdvisor}
                  selectedRowId={selectedFromAdvisor?.advisor_id}
                  rowIdKey="advisor_id"
                />
              )}
            </div>
          </div>

          {/* Middle Panel: Students to Reassign - TABLE FORMAT */}
          <div className="aor-modern-panel aor-table-panel">
            <div className="aor-modern-panel-header primary">
              <div className="aor-panel-title">
                <Users size={18} />
                <h3>Students to Reassign</h3>
              </div>
              {selectedFromAdvisor && (
                <span className="aor-select-all-info" style={{ fontSize: '13px', color: '#64748b' }}>
                  {selectedStudents.length} of {selectedFromAdvisor.students.length} selected
                </span>
              )}
            </div>

            <div className="aor-modern-table-wrapper">
              {!selectedFromAdvisor ? (
                <div className="aor-modern-empty">
                  <Info size={48} />
                  <p>Select an overloaded advisor to see their students</p>
                </div>
              ) : (
                <DataTable
                  columns={studentsColumns}
                  data={selectedFromAdvisor.students}
                  loading={false}
                  emptyMessage="No students assigned"
                  searchable={false}
                />
              )}
            </div>

            {selectedStudents.length > 0 && (
              <div className="aor-modern-selection-summary">
                <CheckCircle size={18} />
                <span>{selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected</span>
              </div>
            )}
          </div>

          {/* Right Panel: Available Advisors - TABLE FORMAT */}
          <div className="aor-modern-panel aor-table-panel">
            <div className="aor-modern-panel-header success">
              <div className="aor-panel-title">
                <UserCheck size={18} />
                <h3>Available Advisors ({filteredAvailableAdvisors.length})</h3>
              </div>
              <button 
                onClick={fetchData} 
                className="aor-icon-btn"
              >
                <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              </button>
            </div>

            {selectedFromAdvisor && (
              <div style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderBottom: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#166534',
                fontWeight: 500
              }}>
                <Info size={16} />
                <span>Showing advisors from: <strong>{selectedFromAdvisor.advising_location || 'Same location'}</strong></span>
              </div>
            )}

            <div className="aor-modern-table-wrapper">
              {filteredAvailableAdvisors.length === 0 ? (
                <div className="aor-modern-empty">
                  <AlertTriangle size={48} />
                  {selectedFromAdvisor ? (
                    <>
                      <p>No available advisors at this location</p>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                        Location: {selectedFromAdvisor.advising_location || 'Not specified'}
                      </p>
                    </>
                  ) : (
                    <p>No advisors with available capacity</p>
                  )}
                </div>
              ) : (
                <DataTable
                  columns={availableAdvisorsColumns}
                  data={filteredAvailableAdvisors}
                  loading={false}
                  emptyMessage="No available advisors"
                  searchable={false}
                  selectedRowId={selectedToAdvisor?.advisor_id}
                  rowIdKey="advisor_id"
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {selectedFromAdvisor && selectedToAdvisor && selectedStudents.length > 0 && (
          <div className="aor-modern-action-bar">
            <div className="aor-modern-action-content">
              <div className="aor-modern-action-item">
                <span className="aor-modern-action-label">From</span>
                <span className="aor-modern-action-value">{selectedFromAdvisor.advisor_name}</span>
              </div>
              <div className="aor-modern-action-arrow">
                <ArrowRight size={24} />
              </div>
              <div className="aor-modern-action-item">
                <span className="aor-modern-action-label">To</span>
                <span className="aor-modern-action-value">{selectedToAdvisor.advisor_name}</span>
              </div>
              <div className="aor-modern-action-divider"></div>
              <div className="aor-modern-action-item">
                <span className="aor-modern-action-label">Students</span>
                <span className="aor-modern-action-value">{selectedStudents.length}</span>
              </div>
            </div>
            <button
              onClick={handleReassign}
              disabled={reassigning}
              className="aor-modern-action-btn"
            >
              {reassigning ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  Reassigning...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Confirm Reassignment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorOverloadResolution;
