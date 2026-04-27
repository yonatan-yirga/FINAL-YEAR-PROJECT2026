/**
 * MyInternships Page 
 * Company: manage posted internships
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Users, CheckCircle, FileCheck, Search, Plus, Edit, Trash2, Eye, Lock, Unlock } from 'lucide-react';
import Header from '../../components/common/Header';
import InternshipCard from '../../components/cards/InternshipCard';
import internshipService from '../../services/internshipService';
import './MyInternships.css';

const MyInternships = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, internship: null });
  const [stats, setStats] = useState({ total: 0, active: 0, applications: 0, filled: 0 });

  useEffect(() => {
    fetchInternships();
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await internshipService.getMyInternships();
      if (result.success) {
        const data = result.data.results || result.data;
        setInternships(data);
        setStats({
          total: data.length,
          active: data.filter(i => i.status === 'OPEN').length,
          filled: data.filter(i => i.status === 'FILLED').length,
          applications: data.reduce((sum, i) => sum + (i.application_count || 0), 0),
        });
      } else {
        setError(result.error || 'Failed to fetch internships');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFiltered = () => {
    let d = internships;
    if (filterStatus !== 'ALL') d = d.filter(i => i.status === filterStatus);
    if (searchQuery) d = d.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return d;
  };

  const handleEdit = (internship) =>
    navigate('/company/post-internship', { state: { internship, isEdit: true } });

  const confirmDelete = async () => {
    try {
      const result = await internshipService.delete(deleteModal.internship.id);
      if (result.success) {
        setSuccessMessage('Internship deleted successfully');
        fetchInternships();
      } else {
        setError(result.error || 'Failed to delete');
      }
    } catch { setError('Failed to delete internship'); }
    setDeleteModal({ show: false, internship: null });
  };

  const handleToggleStatus = async (internship) => {
    try {
      const result = internship.status === 'OPEN'
        ? await internshipService.close(internship.id)
        : await internshipService.reopen(internship.id);
      if (result.success) {
        setSuccessMessage(`Internship ${internship.status === 'OPEN' ? 'closed' : 'reopened'} successfully`);
        fetchInternships();
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch { setError('Failed to update status'); }
  };

  const filtered = getFiltered();

  return (
    <div className="mi-page">
      <Header title="My Internships" subtitle="Manage your posted internship opportunities" />

      <div className="mi-content">

        {successMessage && (
          <div className="mi-alert mi-alert-success">
            <span>✓ {successMessage}</span>
            <button className="mi-alert-close" onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}
        {error && (
          <div className="mi-alert mi-alert-error">
            <span>{error}</span>
            <button className="mi-alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="mi-stats">
          <div className="mi-stat-card">
            <div className="mi-stat-icon mi-icon-green">
              <Briefcase size={20} strokeWidth={2} />
            </div>
            <div className="mi-stat-body">
              <span className="mi-stat-label">Total Internships</span>
              <span className="mi-stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="mi-stat-card">
            <div className="mi-stat-icon mi-icon-green">
              <CheckCircle size={20} strokeWidth={2} />
            </div>
            <div className="mi-stat-body">
              <span className="mi-stat-label">Active / Open</span>
              <span className="mi-stat-value mi-val-green">{stats.active}</span>
            </div>
          </div>
          <div className="mi-stat-card">
            <div className="mi-stat-icon mi-icon-blue">
              <Users size={20} strokeWidth={2} />
            </div>
            <div className="mi-stat-body">
              <span className="mi-stat-label">Total Applications</span>
              <span className="mi-stat-value mi-val-blue">{stats.applications}</span>
            </div>
          </div>
          <div className="mi-stat-card">
            <div className="mi-stat-icon mi-icon-gray">
              <FileCheck size={20} strokeWidth={2} />
            </div>
            <div className="mi-stat-body">
              <span className="mi-stat-label">Filled Positions</span>
              <span className="mi-stat-value mi-val-gray">{stats.filled}</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mi-toolbar">
          <div className="mi-search">
            <Search size={18} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search internships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mi-filter-group">
            {['ALL', 'OPEN', 'CLOSED', 'FILLED'].map(s => (
              <button
                key={s}
                className={`mi-filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button className="mi-cta-btn" onClick={() => navigate('/company/post-internship')}>
            <Plus size={18} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Post New
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mi-loading">
            <div className="mi-spinner" />
            <p>Loading internships...</p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="mi-grid">
            {filtered.map((internship) => (
              <div key={internship.id} className="mi-card-wrap">
                <InternshipCard
                  internship={internship}
                  userRole="COMPANY"
                  onEdit={handleEdit}
                  onDelete={(i) => setDeleteModal({ show: true, internship: i })}
                />
                <div className="mi-quick-actions">
                  <button
                    className={`mi-qa-btn ${internship.status === 'OPEN' ? 'qa-close' : 'qa-reopen'}`}
                    onClick={() => handleToggleStatus(internship)}
                  >
                    {internship.status === 'OPEN' ? (
                      <>
                        <Lock size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Close Listing
                      </>
                    ) : (
                      <>
                        <Unlock size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Reopen Listing
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="mi-empty">
            <div className="mi-empty-icon-circle">
              <Briefcase size={40} strokeWidth={1.5} color="#6b7177" />
            </div>
            <h2>No internships found</h2>
            <p>
              {searchQuery || filterStatus !== 'ALL'
                ? 'Try adjusting your filters or search.'
                : 'Post your first internship to start receiving applications.'}
            </p>
            {!searchQuery && filterStatus === 'ALL' && (
              <button className="mi-cta-btn" onClick={() => navigate('/company/post-internship')}>
                <Plus size={18} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Post Your First Internship
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="mi-overlay" onClick={() => setDeleteModal({ show: false, internship: null })}>
          <div className="mi-modal" onClick={e => e.stopPropagation()}>
            <div className="mi-modal-header">
              <h2>Delete Internship</h2>
              <button onClick={() => setDeleteModal({ show: false, internship: null })}>×</button>
            </div>
            <div className="mi-modal-body">
              <p>Are you sure you want to delete <strong>{deleteModal.internship?.title}</strong>?</p>
              <p className="mi-modal-warn">⚠️ This action cannot be undone.</p>
            </div>
            <div className="mi-modal-footer">
              <button className="mi-btn-ghost" onClick={() => setDeleteModal({ show: false, internship: null })}>Cancel</button>
              <button className="mi-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInternships;