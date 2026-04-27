/**
 * InternshipFilters Component
 * Reusable filter sidebar for internship search
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './InternshipFilters.css';

const InternshipFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    location: initialFilters.location || '',
    duration_months: initialFilters.duration_months || '',
    start_date_from: initialFilters.start_date_from || '',
    start_date_to: initialFilters.start_date_to || '',
    status: initialFilters.status || 'OPEN',
  });
  
  /**
   * Handle filter change
   */
  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  /**
   * Clear all filters
   */
  const handleClear = () => {
    const clearedFilters = {
      location: '',
      duration_months: '',
      start_date_from: '',
      start_date_to: '',
      status: 'OPEN',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };
  
  /**
   * Get today's date for min date
   */
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="filters-container">
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        <button 
          type="button"
          className="btn-clear"
          onClick={handleClear}
        >
          Clear All
        </button>
      </div>
      
      <div className="filters-body">
        {/* Status Filter */}
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="FILLED">Filled</option>
          </select>
        </div>
        
        {/* Location Filter */}
        <div className="filter-group">
          <label className="filter-label">Location</label>
          <input
            type="text"
            className="filter-input"
            placeholder="e.g., Addis Ababa"
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>
        
        {/* Duration Filter */}
        <div className="filter-group">
          <label className="filter-label">Duration (Months)</label>
          <select
            className="filter-select"
            value={filters.duration_months}
            onChange={(e) => handleChange('duration_months', e.target.value)}
          >
            <option value="">Any Duration</option>
            <option value="1">1 month</option>
            <option value="2">2 months</option>
            <option value="3">3 months</option>
            <option value="4">4 months</option>
            <option value="5">5 months</option>
            <option value="6">6 months</option>
            <option value="7">7 months</option>
            <option value="8">8 months</option>
            <option value="9">9 months</option>
            <option value="10">10 months</option>
            <option value="11">11 months</option>
            <option value="12">12 months</option>
          </select>
        </div>
        
        {/* Start Date Range */}
        <div className="filter-group">
          <label className="filter-label">Start Date From</label>
          <input
            type="date"
            className="filter-input"
            min={today}
            value={filters.start_date_from}
            onChange={(e) => handleChange('start_date_from', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Start Date To</label>
          <input
            type="date"
            className="filter-input"
            min={filters.start_date_from || today}
            value={filters.start_date_to}
            onChange={(e) => handleChange('start_date_to', e.target.value)}
          />
        </div>
      </div>
      
      {/* Active Filters Count */}
      {Object.values(filters).filter(v => v && v !== 'OPEN').length > 0 && (
        <div className="filters-footer">
          <span className="active-filters">
            {Object.values(filters).filter(v => v && v !== 'OPEN').length} active filters
          </span>
        </div>
      )}
    </div>
  );
};

InternshipFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
};

export default InternshipFilters;