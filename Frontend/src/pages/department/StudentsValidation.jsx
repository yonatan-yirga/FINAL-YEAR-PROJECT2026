/**
 * Students Validation Page - Upwork-Inspired Design
 * Specialized authority view for bulk eligibility validation
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import DataTable from '../../components/common/DataTable';
import departmentService from '../../services/departmentService';
import { CheckCircle, XCircle, Users, UserCheck, Info } from 'lucide-react';
import './StudentsValidation.css';

const StudentsValidation = () => {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getStudents();
      if (response.success) {
        setStudents(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkValidate = async (isEligible) => {
    if (selectedIds.length === 0) return;
    
    try {
      setSubmitting(true);
      const response = await departmentService.validateStudents({
        student_ids: selectedIds,
        is_eligible: isEligible
      });

      if (response.success) {
        setSuccess(`Successfully ${isEligible ? 'validated' : 'invalidated'} ${selectedIds.length} students.`);
        fetchStudents();
        setSelectedIds([]);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Validation action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const getStats = () => {
    return {
      total: students.length,
      validated: students.filter(s => s.is_eligible).length,
      pending: students.filter(s => !s.is_eligible).length,
    };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'select',
      label: (
        <input 
          type="checkbox" 
          className="sv-checkbox"
          onChange={toggleAll} 
          checked={selectedIds.length === students.length && students.length > 0} 
        />
      ),
      render: (_, row) => (
        <input 
          type="checkbox" 
          className="sv-checkbox"
          checked={selectedIds.includes(row.id)} 
          onChange={() => toggleSelect(row.id)} 
        />
      )
    },
    { key: 'full_name', label: 'Student Name', sortable: true },
    { key: 'university_id', label: 'University ID', sortable: true },
    { 
       key: 'is_eligible', 
       label: 'Validation Status',
       render: (val, row) => (
         <span className={`sv-status-badge ${row.is_eligible ? 'sv-status-validated' : 'sv-status-pending'}`}>
           {row.is_eligible ? 'Validated' : 'Pending Action'}
         </span>
       )
    },
    {
      key: 'year_of_study',
      label: 'Year',
      render: (val) => val ? `Year ${val}` : 'N/A'
    }
  ];

  return (
    <div className="sv-page">
      <Header 
        title="Eligibility Validation" 
        subtitle="Strategic Oversight: Confirm student status for current internship cycle" 
      />
      
      <div className="sv-content">
        {/* Info Banner */}
        <div className="sv-info-banner">
          <Info className="sv-info-icon" size={20} />
          <div className="sv-info-content">
            <h4 className="sv-info-title">Validation Authority</h4>
            <p className="sv-info-text">
              Select students and use the action buttons to confirm their eligibility for the current internship cycle. 
              This action will update their status in the system.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="sv-stats-bar">
          <div className="sv-stat-card">
            <div className="sv-stat-icon sv-stat-icon-blue">
              <Users size={18} />
            </div>
            <div className="sv-stat-body">
              <span className="sv-stat-label">Total Students</span>
              <span className="sv-stat-value">{stats.total}</span>
            </div>
          </div>

          <div className="sv-stat-card">
            <div className="sv-stat-icon sv-stat-icon-green">
              <UserCheck size={18} />
            </div>
            <div className="sv-stat-body">
              <span className="sv-stat-label">Validated</span>
              <span className="sv-stat-value">{stats.validated}</span>
            </div>
          </div>

          <div className="sv-stat-card">
            <div className="sv-stat-icon sv-stat-icon-gray">
              <XCircle size={18} />
            </div>
            <div className="sv-stat-body">
              <span className="sv-stat-label">Pending Action</span>
              <span className="sv-stat-value">{stats.pending}</span>
            </div>
          </div>
        </div>

        {/* Authority Control Bar */}
        <div className="sv-control-bar">
          <div className="sv-selection-info">
            <span className="sv-selection-count">{selectedIds.length}</span>
            <span className="sv-selection-label">Students Selected</span>
          </div>
          
          <div className="sv-actions">
            <button 
              onClick={() => handleBulkValidate(true)}
              disabled={selectedIds.length === 0 || submitting}
              className="sv-btn sv-btn-validate"
            >
              <CheckCircle size={16} />
              {submitting ? 'Processing...' : 'Set Eligible'}
            </button>
            <button 
              onClick={() => handleBulkValidate(false)}
              disabled={selectedIds.length === 0 || submitting}
              className="sv-btn sv-btn-invalidate"
            >
              <XCircle size={16} />
              Remove Eligibility
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="sv-alert sv-alert-success">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className="sv-alert sv-alert-error">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="sv-table-card">
          <DataTable 
            columns={columns}
            data={students}
            loading={loading}
            emptyMessage="No students found in your department."
            searchPlaceholder="Search by ID or Name..."
          />
        </div>
      </div>
    </div>
  );
};

export default StudentsValidation;
