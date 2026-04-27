/**
 * Department Cycles Page - Modern UI/UX Design
 * Comprehensive cycle and deadline management system
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  Calendar, Plus, Edit, Trash2, Power, PowerOff, Clock,
  CheckCircle, AlertTriangle, RefreshCw, X, Save, TrendingUp,
  CalendarDays, CalendarCheck, CalendarX, Info, AlertCircle
} from 'lucide-react';
import './DepartmentCycles.css';

const DepartmentCycles = () => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    semester: 1,
    start_date: '',
    end_date: '',
    is_active: false,
  });

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getCycles();
      
      if (response.success) {
        setCycles(response.data);
        setError('');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cycle = null) => {
    if (cycle) {
      setEditingCycle(cycle);
      setFormData({
        year: cycle.year,
        semester: cycle.semester,
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        is_active: cycle.is_active,
      });
    } else {
      setEditingCycle(null);
      setFormData({
        year: new Date().getFullYear(),
        semester: 1,
        start_date: '',
        end_date: '',
        is_active: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCycle(null);
    setFormData({
      year: new Date().getFullYear(),
      semester: 1,
      start_date: '',
      end_date: '',
      is_active: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.year) {
      setError('Year is required');
      return;
    }
    if (!formData.semester) {
      setError('Semester is required');
      return;
    }
    if (!formData.start_date || formData.start_date.trim() === '') {
      setError('Start date is required');
      return;
    }
    if (!formData.end_date || formData.end_date.trim() === '') {
      setError('End date is required');
      return;
    }
    
    // Validate date logic
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (startDate >= endDate) {
      setError('Start date must be before end date');
      return;
    }
    
    try {
      let response;
      if (editingCycle) {
        response = await departmentService.updateCycle(editingCycle.id, formData);
      } else {
        response = await departmentService.createCycle(formData);
      }
      
      if (response.success) {
        setSuccess(editingCycle ? 'Cycle updated successfully' : 'Cycle created successfully');
        handleCloseModal();
        fetchCycles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to save cycle');
    }
  };

  const handleActivate = async (cycleId) => {
    if (!window.confirm('Activate this cycle? This will deactivate all other cycles.')) {
      return;
    }
    
    try {
      const response = await departmentService.activateCycle(cycleId);
      if (response.success) {
        setSuccess('Cycle activated successfully');
        fetchCycles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to activate cycle');
    }
  };

  const handleClose = async (cycleId) => {
    if (!window.confirm('Close this cycle? Students will not be able to apply during this period.')) {
      return;
    }
    
    try {
      const response = await departmentService.closeCycle(cycleId);
      if (response.success) {
        setSuccess('Cycle closed successfully');
        fetchCycles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to close cycle');
    }
  };

  const handleDelete = async (cycleId) => {
    if (!window.confirm('Delete this cycle? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await departmentService.deleteCycle(cycleId);
      if (response.success) {
        setSuccess('Cycle deleted successfully');
        fetchCycles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to delete cycle');
    }
  };

  const getStats = () => {
    return {
      total: cycles.length,
      active: cycles.filter(c => c.is_active).length,
      closed: cycles.filter(c => !c.is_active).length,
    };
  };

  const stats = getStats();
  const activeCycle = cycles.find(c => c.is_active);

  return (
    <div className="dc-page">
      <Header 
        title="Cycle Management" 
        subtitle="Manage internship seasons, deadlines, and operational windows" 
      />
      
      <div className="dc-content">
        
        {/* Success Alert */}
        {success && (
          <div className="dc-alert dc-alert-success">
            <CheckCircle size={16} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="dc-alert dc-alert-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
            <button 
              className="dc-retry-btn"
              onClick={fetchCycles}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="dc-stats-grid">
          <div className="dc-stat-card dc-stat-primary">
            <div className="dc-stat-icon dc-icon-blue">
              <Calendar size={18} />
            </div>
            <div className="dc-stat-body">
              <span className="dc-stat-label">Total Cycles</span>
              <span className="dc-stat-value">{stats.total}</span>
            </div>
            <div className="dc-stat-trend">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="dc-stat-card">
            <div className="dc-stat-icon dc-icon-green">
              <CheckCircle size={18} />
            </div>
            <div className="dc-stat-body">
              <span className="dc-stat-label">Active Cycle</span>
              <span className="dc-stat-value">{stats.active}</span>
            </div>
            {stats.active > 0 && <div className="dc-stat-pulse" />}
          </div>

          <div className="dc-stat-card">
            <div className="dc-stat-icon dc-icon-gray">
              <CalendarX size={18} />
            </div>
            <div className="dc-stat-body">
              <span className="dc-stat-label">Closed Cycles</span>
              <span className="dc-stat-value">{stats.closed}</span>
            </div>
          </div>
        </div>

        {/* Active Cycle Banner */}
        {activeCycle && (
          <div className="dc-active-banner">
            <div className="dc-active-content">
              <div className="dc-active-icon">
                <CalendarCheck size={24} />
              </div>
              <div className="dc-active-info">
                <div className="dc-active-badge">Currently Active</div>
                <h3 className="dc-active-title">
                  {activeCycle.year} - Semester {activeCycle.semester}
                </h3>
                <p className="dc-active-dates">
                  <Clock size={14} />
                  {new Date(activeCycle.start_date).toLocaleDateString()} - {new Date(activeCycle.end_date).toLocaleDateString()}
                  <span className="dc-active-duration">({activeCycle.duration_days} days)</span>
                </p>
              </div>
            </div>
            <button 
              className="dc-close-active-btn"
              onClick={() => handleClose(activeCycle.id)}
            >
              <PowerOff size={16} />
              Close Cycle
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="dc-action-bar">
          <div className="dc-action-left">
            <h3 className="dc-section-title">
              <CalendarDays size={16} />
              All Cycles
            </h3>
            <p className="dc-section-subtitle">
              Manage internship seasons and deadlines
            </p>
          </div>
          <div className="dc-action-right">
            <button 
              onClick={fetchCycles} 
              className="dc-refresh-btn"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="dc-create-btn"
            >
              <Plus size={16} />
              Create New Cycle
            </button>
          </div>
        </div>

        {/* Cycles Grid */}
        {loading ? (
          <div className="dc-loading">
            <div className="dc-spinner" />
            <p>Loading cycles...</p>
          </div>
        ) : cycles.length === 0 ? (
          <div className="dc-empty">
            <div className="dc-empty-icon">
              <Calendar size={48} />
            </div>
            <h3>No Cycles Found</h3>
            <p>Create your first internship cycle to start managing deadlines</p>
            <button 
              onClick={() => handleOpenModal()}
              className="dc-empty-btn"
            >
              <Plus size={16} />
              Create First Cycle
            </button>
          </div>
        ) : (
          <div className="dc-grid">
            {cycles.map(cycle => (
              <div 
                key={cycle.id} 
                className={`dc-card ${cycle.is_active ? 'dc-card-active' : ''}`}
              >
                {cycle.is_active && (
                  <div className="dc-active-badge-card">
                    <Power size={12} />
                    Active
                  </div>
                )}
                
                <div className="dc-card-header">
                  <div className="dc-card-icon">
                    <Calendar size={18} />
                  </div>
                  <h3 className="dc-card-title">
                    {cycle.year} - Semester {cycle.semester}
                  </h3>
                </div>

                <div className="dc-card-body">
                  <div className="dc-date-row">
                    <div className="dc-date-box">
                      <span className="dc-date-label">
                        <CalendarCheck size={12} />
                        Start Date
                      </span>
                      <span className="dc-date-value">
                        {new Date(cycle.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="dc-date-box">
                      <span className="dc-date-label">
                        <CalendarX size={12} />
                        End Date
                      </span>
                      <span className="dc-date-value">
                        {new Date(cycle.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="dc-duration">
                    <Clock size={12} />
                    <span>{cycle.duration_days} days duration</span>
                  </div>

                  <div className="dc-status">
                    {cycle.is_active ? (
                      <span className="dc-status-badge dc-status-active">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="dc-status-badge dc-status-closed">
                        <PowerOff size={12} />
                        Closed
                      </span>
                    )}
                  </div>
                </div>

                <div className="dc-card-footer">
                  <button 
                    onClick={() => handleOpenModal(cycle)}
                    className="dc-btn dc-btn-edit"
                    title="Edit Cycle"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  
                  {cycle.is_active ? (
                    <button 
                      onClick={() => handleClose(cycle.id)}
                      className="dc-btn dc-btn-close"
                      title="Close Cycle"
                    >
                      <PowerOff size={14} />
                      Close
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleActivate(cycle.id)}
                      className="dc-btn dc-btn-activate"
                      title="Activate Cycle"
                    >
                      <Power size={14} />
                      Activate
                    </button>
                  )}
                  
                  {!cycle.is_active && (
                    <button 
                      onClick={() => handleDelete(cycle.id)}
                      className="dc-btn dc-btn-delete"
                      title="Delete Cycle"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="dc-modal-overlay" onClick={handleCloseModal}>
          <div className="dc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dc-modal-header">
              <h3 className="dc-modal-title">
                <Calendar size={18} />
                {editingCycle ? 'Edit Cycle' : 'Create New Cycle'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="dc-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dc-modal-body">
              <div className="dc-form-row">
                <div className="dc-form-group">
                  <label className="dc-form-label">
                    Year <span className="dc-required">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="dc-form-input"
                    min="2020"
                    max="2050"
                    required
                  />
                </div>

                <div className="dc-form-group">
                  <label className="dc-form-label">
                    Semester <span className="dc-required">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="dc-form-input"
                    required
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="dc-form-row">
                <div className="dc-form-group">
                  <label className="dc-form-label">
                    Start Date <span className="dc-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="dc-form-input"
                    required
                  />
                </div>

                <div className="dc-form-group">
                  <label className="dc-form-label">
                    End Date <span className="dc-required">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="dc-form-input"
                    required
                  />
                </div>
              </div>

              <div className="dc-form-group">
                <label className="dc-form-checkbox">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                  />
                  <span>Set as active cycle (will deactivate other cycles)</span>
                </label>
              </div>

              <div className="dc-info-box">
                <Info size={16} />
                <p>
                  Active cycles allow students to apply for internships. 
                  Only one cycle can be active at a time.
                </p>
              </div>

              <div className="dc-modal-footer">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="dc-btn dc-btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="dc-btn dc-btn-save"
                >
                  <Save size={16} />
                  {editingCycle ? 'Update Cycle' : 'Create Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentCycles;
