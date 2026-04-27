/**
 * SearchInternships Page 
 * Student: search and browse internship opportunities
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import InternshipCard from '../../components/cards/InternshipCard';
import InternshipFilters from '../../components/filters/InternshipFilters';
import internshipService from '../../services/internshipService';
import recommendationService from '../../services/recommendationService';
import useAuth from '../../hooks/useAuth';
import './SearchInternships.css';

const SearchInternships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('recommended');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => { fetchInternships(); }, [filters, sortBy]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => fetchInternships(), 300);
    setSearchTimeout(t);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError('');
      let result;
      if (sortBy === 'recommended') {
        // Only show internships with a minimum match percentage
        result = await recommendationService.getRecommendations({ 
          limit: 50, 
          min_match: 30,  // Changed from 0 to 30 - only show 30%+ matches
          ...filters,  // Apply filters to recommendations too
          search: searchQuery  // Apply search query to recommendations
        });
      } else {
        result = await internshipService.search({ ...filters, search: searchQuery, ordering: sortBy });
      }
      if (result.success) {
        const data = result.data.recommendations || result.data.results || result.data;
        setInternships(data);
      } else {
        setError(result.error || 'Failed to fetch internships');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((newFilters) => setFilters(newFilters), []);

  return (
    <div className="si-page">
      <Header
        title="Search Internships"
        subtitle="Find the perfect internship match for your skills"
      />

      <div className="si-content">
        <div className="si-layout">

          {/* Filters Sidebar */}
          <aside className="si-sidebar">
            <InternshipFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </aside>

          {/* Main */}
          <main className="si-main">

            {/* Search Header */}
            <div className="si-search-card">
              <div className="si-search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="si-clear-btn" onClick={() => setSearchQuery('')}>×</button>
                )}
              </div>

              <div className="si-sort-row">
                <span className="si-sort-label">Sort by:</span>
                <div className="si-sort-group">
                  <button
                    className={`si-sort-btn ${sortBy === 'recommended' ? 'active' : ''}`}
                    onClick={() => setSortBy('recommended')}
                  >
                    ✨ Recommended
                  </button>
                  <button
                    className={`si-sort-btn ${sortBy === '-created_at' ? 'active' : ''}`}
                    onClick={() => setSortBy('-created_at')}
                  >
                    Newest
                  </button>
                  <button
                    className={`si-sort-btn ${sortBy === 'start_date' ? 'active' : ''}`}
                    onClick={() => setSortBy('start_date')}
                  >
                    Start Date
                  </button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            {!loading && internships.length > 0 && (
              <div className="si-results-info">
                <span className="si-results-count">
                  {internships.length} {internships.length === 1 ? 'internship' : 'internships'} found
                </span>
                {sortBy === 'recommended' && user?.skills && (
                  <span className="si-results-hint">✨ Showing internships with 30%+ skill match</span>
                )}
              </div>
            )}

            {/* No-skills tip */}
            {!loading && sortBy === 'recommended' && !user?.skills && (
              <div className="si-info-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>Add skills to get personalized recommendations!</strong>
                  <p>Update your profile with your skills to see which internships match best.</p>
                </div>
              </div>
            )}

            {/* Low matches info */}
            {!loading && sortBy === 'recommended' && user?.skills && internships.length === 0 && !error && (
              <div className="si-info-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>No strong matches found</strong>
                  <p>We couldn't find internships that match your skills well (30%+ match). Try viewing "Newest" or "Start Date" to see all available internships, or update your skills in your profile.</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="si-error-banner">{error}</div>
            )}

            {/* Loading */}
            {loading && (
              <div className="si-loading">
                <div className="si-spinner" />
                <p>Finding internships for you...</p>
              </div>
            )}

            {/* Grid */}
            {!loading && internships.length > 0 && (
              <div className="si-grid">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    showMatch={sortBy === 'recommended'}
                    userRole="STUDENT"
                    onApply={() => navigate(`/student/internships/${internship.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && internships.length === 0 && (
              <div className="si-empty">
                <div className="si-empty-icon">🔍</div>
                <h2>No internships found</h2>
                <p>
                  {searchQuery || Object.keys(filters).some(k => filters[k])
                    ? 'Try adjusting your search or filters.'
                    : 'Check back later for new opportunities.'}
                </p>
                {(searchQuery || Object.keys(filters).some(k => filters[k])) && (
                  <button
                    className="si-clear-all-btn"
                    onClick={() => { setSearchQuery(''); setFilters({}); }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchInternships;