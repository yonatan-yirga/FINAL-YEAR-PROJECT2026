/**
 * Company Internships Page - Public View
 * Shows all internships for a specific company
 * Modern redesign with real API integration and search/filters
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, MapPin, Briefcase, Clock, 
  Calendar, Users, ChevronRight, AlertCircle, CheckCircle,
  Search, Filter, X
} from 'lucide-react';
import apiService from '../../services/api';
import './CompanyInternships.css';

const CompanyInternships = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCompanyAndInternships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Apply filters whenever search or filter values change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, locationFilter, durationFilter, statusFilter, internships]);

  const fetchCompanyAndInternships = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching internships for company ID:', companyId);
      
      // Fetch all public internships
      const response = await apiService.get('/internships/public/');
      const allInternships = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      
      console.log('✅ All internships received:', allInternships.length, 'internships');
      
      // Filter internships for this specific company
      const companyInternships = allInternships.filter(internship => {
        const matches = String(internship.company) === String(companyId);
        if (matches) {
          console.log(`✅ Match found: Internship "${internship.title}" belongs to company ${companyId}`);
        }
        return matches;
      });
      
      console.log(`📊 Found ${companyInternships.length} internships for company ${companyId}`);
      
      if (companyInternships.length > 0) {
        // Get company info from first internship
        const firstInternship = companyInternships[0];
        console.log('📋 Company info from internship:', {
          name: firstInternship.company_name,
          location: firstInternship.company_city,
          department: firstInternship.department_name
        });
        
        setCompany({
          id: companyId,
          name: firstInternship.company_name || 'Company',
          description: firstInternship.company_description || 'Leading organization providing quality internship opportunities.',
          location: firstInternship.company_city || firstInternship.location || 'Ethiopia',
          email: firstInternship.company_email,
          phone: firstInternship.company_phone,
          address: firstInternship.company_address,
          department: firstInternship.department_name
        });
        setInternships(companyInternships);
        setFilteredInternships(companyInternships);
      } else {
        // No internships found for this company
        console.log('⚠️ No internships found for company ID:', companyId);
        console.log('💡 Available company IDs:', [...new Set(allInternships.map(i => i.company))]);
        
        // Try to find company name from any internship with this company ID (even if not in filtered results)
        const anyCompanyInternship = allInternships.find(i => String(i.company) === String(companyId));
        
        setCompany({
          id: companyId,
          name: anyCompanyInternship?.company_name || 'Company',
          description: 'This company has not posted any internship opportunities yet.',
          location: anyCompanyInternship?.company_city || 'Ethiopia'
        });
        setInternships([]);
        setFilteredInternships([]);
      }
    } catch (error) {
      console.error('❌ Error fetching company internships:', error);
      console.error('❌ Error details:', error.response || error.message);
      setError('Failed to load company internships. Please try again.');
    }
    
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...internships];

    // Search filter (title, description, skills, location)
    // NOTE: We don't search by company_name because we're already on a specific company's page
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(internship => 
        internship.title?.toLowerCase().includes(query) ||
        internship.description?.toLowerCase().includes(query) ||
        internship.required_skills?.toLowerCase().includes(query) ||
        internship.location?.toLowerCase().includes(query)
      );
    }

    // Location filter (separate from search)
    if (locationFilter) {
      filtered = filtered.filter(internship => 
        internship.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Duration filter
    if (durationFilter) {
      const duration = parseInt(durationFilter);
      filtered = filtered.filter(internship => 
        internship.duration_months === duration
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(internship => 
        internship.status === statusFilter
      );
    }

    console.log(`🔍 Filtered ${filtered.length} internships from ${internships.length} total (Company ID: ${companyId})`);
    setFilteredInternships(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('');
    setDurationFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchQuery || locationFilter || durationFilter || statusFilter;

  // Get unique values for filter dropdowns
  const uniqueLocations = [...new Set(internships.map(i => i.location).filter(Boolean))];
  const uniqueDurations = [...new Set(internships.map(i => i.duration_months).filter(Boolean))].sort((a, b) => a - b);
  const uniqueStatuses = [...new Set(internships.map(i => i.status).filter(Boolean))];

  const handleInternshipClick = (internshipId) => {
    navigate(`/internship/${internshipId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    if (status === 'OPEN') return { bg: '#c6f6d5', color: '#22543d', text: 'Open' };
    if (status === 'CLOSED') return { bg: '#feebc8', color: '#7c2d12', text: 'Closed' };
    if (status === 'FILLED') return { bg: '#fed7d7', color: '#742a2a', text: 'Filled' };
    return { bg: '#e2e8f0', color: '#2d3748', text: status };
  };

  if (loading) {
    return (
      <div className="company-internships-page">
        <div className="company-internships-loading">
          <div className="loading-spinner"></div>
          <p>Loading company internships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-internships-page">
        <div className="company-internships-error">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Error Loading Internships</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-internships-page">
      {/* Header with Company Info */}
      <div className="company-internships-header">
        <div className="container">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span>Back to Home</span>
          </button>

          <motion.div 
            className="company-info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="company-logo-large">
              <Building2 size={48} strokeWidth={2} />
            </div>
            <div className="company-details">
              <h1>{company.name}</h1>
              <p className="company-description">{company.description}</p>
              <div className="company-meta">
                {company.location && (
                  <div className="meta-item">
                    <MapPin size={16} strokeWidth={2.5} />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.department && (
                  <div className="meta-item">
                    <Briefcase size={16} strokeWidth={2.5} />
                    <span>{company.department}</span>
                  </div>
                )}
                <div className="meta-item">
                  <Users size={16} strokeWidth={2.5} />
                  <span>{internships.length} Position{internships.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Internships List */}
      <div className="company-internships-content">
        <div className="container">
          {internships.length > 0 ? (
            <>
              <div className="section-title-wrapper">
                <h2>Available Internship Positions</h2>
                <p>{filteredInternships.length} of {internships.length} position{internships.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Search and Filters */}
              <div className="search-filter-section">
                {/* Search Bar */}
                <div className="search-bar-wrapper">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by title, location, skills, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button */}
                <button 
                  className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                  <span>Filters</span>
                  {hasActiveFilters && <span className="filter-badge">{
                    [locationFilter, durationFilter, statusFilter].filter(Boolean).length
                  }</span>}
                </button>

                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <button 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                  >
                    <X size={16} />
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              {showFilters && (
                <motion.div 
                  className="filters-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="filters-grid">
                    {/* Location Filter */}
                    <div className="filter-group">
                      <label htmlFor="location-filter">
                        <MapPin size={16} />
                        Location
                      </label>
                      <select
                        id="location-filter"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Locations</option>
                        {uniqueLocations.map((location, index) => (
                          <option key={index} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration Filter */}
                    <div className="filter-group">
                      <label htmlFor="duration-filter">
                        <Clock size={16} />
                        Duration
                      </label>
                      <select
                        id="duration-filter"
                        value={durationFilter}
                        onChange={(e) => setDurationFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Durations</option>
                        {uniqueDurations.map((duration, index) => (
                          <option key={index} value={duration}>
                            {duration} month{duration > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="filter-group">
                      <label htmlFor="status-filter">
                        <CheckCircle size={16} />
                        Status
                      </label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Statuses</option>
                        {uniqueStatuses.map((status, index) => (
                          <option key={index} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {filteredInternships.length > 0 ? (
                <div className="internships-grid">
                  {filteredInternships.map((internship, index) => {
                    const statusStyle = getStatusColor(internship.status);
                    
                    return (
                      <motion.div
                        key={internship.id}
                        className="internship-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        onClick={() => handleInternshipClick(internship.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="internship-card-header">
                          <div>
                            <h3>{internship.title}</h3>
                            <span className="company-name-small">{internship.company_name}</span>
                          </div>
                          <span 
                            className="status-badge-small" 
                            style={{ 
                              background: statusStyle.bg, 
                              color: statusStyle.color 
                            }}
                          >
                            {statusStyle.text}
                          </span>
                        </div>

                        <p className="internship-description">
                          {internship.description?.length > 150 
                            ? `${internship.description.substring(0, 150)}...` 
                            : internship.description}
                        </p>

                        <div className="internship-details">
                          <div className="detail-item">
                            <MapPin size={16} strokeWidth={2.5} />
                            <span>{internship.location}</span>
                          </div>
                          <div className="detail-item">
                            <Clock size={16} strokeWidth={2.5} />
                            <span>{internship.duration_months} month{internship.duration_months > 1 ? 's' : ''}</span>
                          </div>
                          <div className="detail-item">
                            <Users size={16} strokeWidth={2.5} />
                            <span>{internship.available_slots} slot{internship.available_slots !== 1 ? 's' : ''}</span>
                          </div>
                          {internship.application_deadline && (
                            <div className="detail-item">
                              <Calendar size={16} strokeWidth={2.5} />
                              <span>Deadline: {formatDate(internship.application_deadline)}</span>
                            </div>
                          )}
                        </div>

                        {/* Skills Preview */}
                        {internship.required_skills && (
                          <div className="skills-preview">
                            {internship.required_skills.split(',').slice(0, 3).map((skill, i) => (
                              <span key={i} className="skill-tag-small">
                                {skill.trim()}
                              </span>
                            ))}
                            {internship.required_skills.split(',').length > 3 && (
                              <span className="skill-tag-small more">
                                +{internship.required_skills.split(',').length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="internship-footer">
                          <div className="applicants-count">
                            <Users size={16} strokeWidth={2.5} />
                            <span>{internship.application_count || 0} applicant{internship.application_count !== 1 ? 's' : ''}</span>
                          </div>
                          <button 
                            className="view-details-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInternshipClick(internship.id);
                            }}
                          >
                            <span>View Details</span>
                            <ChevronRight size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div 
                  className="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Search size={64} color="#cbd5e1" />
                  <h3>No Internships Match Your Filters</h3>
                  <p>Try adjusting your search or filters to find more opportunities.</p>
                  <button onClick={clearFilters} className="clear-filters-btn-large">
                    <X size={16} />
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div 
              className="no-internships"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Briefcase size={64} color="#cbd5e1" />
              <h2>No Internships Available</h2>
              <p>This company hasn't posted any internship opportunities yet. Check back soon!</p>
              <button onClick={() => navigate('/')} className="back-home-btn">
                <ArrowLeft size={16} />
                Browse Other Companies
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInternships;
