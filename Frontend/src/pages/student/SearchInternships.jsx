/**
 * SearchInternships Page 
 * Student: search and browse internship opportunities — Ultra-Premium Redesign
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import InternshipCard from '../../components/cards/InternshipCard';
import InternshipFilters from '../../components/filters/InternshipFilters';
import internshipService from '../../services/internshipService';
import recommendationService from '../../services/recommendationService';
import useAuth from '../../hooks/useAuth';
import { Search, Sparkles, Clock, TrendingUp, X, AlertCircle, Info } from 'lucide-react';
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
        result = await recommendationService.getRecommendations({
          limit: 50,
          min_match: 0,
          ...filters,
          search: searchQuery
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

  const sortOptions = [
    { key: 'recommended', label: 'Recommended', icon: <Sparkles size={13} /> },
    { key: '-created_at',  label: 'Newest',      icon: <Clock size={13} /> },
    { key: 'start_date',  label: 'Start Date',   icon: <TrendingUp size={13} /> },
  ];

  return (
    <div className="si-page">
      <Header
        title="Search Internships"
        subtitle="Find the perfect internship match for your skills"
      />

      <div className="si-content">

        {/* ── Premium Hero Bar ───────────────────────────── */}
        <div className="si-hero-bar">
          <div className="si-hero-text">
            <span className="si-hero-label">🎯 Opportunities</span>
            <h2 className="si-hero-title">Find Your Perfect Internship</h2>
            <p className="si-hero-sub">
              {user?.full_name
                ? `Welcome back, ${user.full_name.split(' ')[0]}! Let's find your next opportunity.`
                : 'Discover internships matched to your skills and career goals.'}
            </p>
          </div>
          <div className="si-hero-stats">
            <div className="si-hero-stat">
              <span className="si-hero-stat-value">{loading ? '…' : internships.length}</span>
              <span className="si-hero-stat-label">Matches Found</span>
            </div>
            <div className="si-hero-stat-divider" />
            <div className="si-hero-stat">
              <span className="si-hero-stat-value">0%+</span>
              <span className="si-hero-stat-label">Min Match</span>
            </div>
            <div className="si-hero-stat-divider" />
            <div className="si-hero-stat">
              <span className="si-hero-stat-value">AI</span>
              <span className="si-hero-stat-label">Powered</span>
            </div>
          </div>
        </div>

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

            {/* Search & Sort Card */}
            <div className="si-search-card">
              <div className="si-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by title, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="si-clear-btn" onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="si-sort-row">
                <span className="si-sort-label">Sort by</span>
                <div className="si-sort-group">
                  {sortOptions.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      className={`si-sort-btn ${sortBy === key ? 'active' : ''}`}
                      onClick={() => setSortBy(key)}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  ))}
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
                  <span className="si-results-hint">✦ Showing ranked skill matches</span>
                )}
              </div>
            )}

            {/* No-skills tip */}
            {!loading && sortBy === 'recommended' && !user?.skills && (
              <div className="si-info-banner">
                <Info size={18} />
                <div>
                  <strong>Add skills to get personalized recommendations!</strong>
                  <p>Update your profile with your skills to see which internships match best.</p>
                </div>
              </div>
            )}

            {/* Low matches */}
            {!loading && sortBy === 'recommended' && user?.skills && internships.length === 0 && !error && (
              <div className="si-info-banner">
                <Info size={18} />
                <div>
                  <strong>No recommendations found</strong>
                  <p>We couldn't find any internships for your department. Try adjusting your search query or check back later.</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="si-error-banner">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="si-loading">
                <div className="si-spinner" />
                <p>Finding internships for you...</p>
              </div>
            )}

            {/* Results Grid */}
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

            {/* Empty State */}
            {!loading && internships.length === 0 && (
              <div className="si-empty">
                <div className="si-empty-icon">🔍</div>
                <h2>No internships found</h2>
                <p>
                  {searchQuery || Object.keys(filters).some(k => filters[k])
                    ? 'Try adjusting your search or filters to find more opportunities.'
                    : 'Check back later — new opportunities are added regularly.'}
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