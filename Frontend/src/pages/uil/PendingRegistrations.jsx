/**
 * Pending Registrations Page - PREMIUM REDESIGN
 * Lists all pending registrations with card layout, animations, and high-end styling
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Building2, GraduationCap, School, 
  Search, Eye, Check, X, Calendar, Mail, 
  Inbox, Loader2, Filter
} from 'lucide-react';
import uilService from '../../services/uilService';
import Header from '../../components/common/Header';
import RegistrationDetailModal from '../../components/uil/RegistrationDetailModal';
import ApprovalConfirmation from '../../components/uil/ApprovalConfirmation';
import RejectionForm from '../../components/uil/RejectionForm';
import './PendingRegistrationsPremium.css';

const PendingRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Fetch pending registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    
    const result = await uilService.getPendingRegistrations();
    
    if (result.success) {
      setRegistrations(result.data);
      setFilteredRegistrations(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Filter logic
  useEffect(() => {
    const registrationsArray = Array.isArray(registrations) ? registrations : [];
    let filtered = registrationsArray;
    
    if (activeTab !== 'ALL') {
      filtered = registrationsArray.filter(reg => reg.request_type === activeTab);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.email?.toLowerCase().includes(term) ||
        reg.student_full_name?.toLowerCase().includes(term) ||
        reg.company_name?.toLowerCase().includes(term) ||
        reg.advisor_full_name?.toLowerCase().includes(term) ||
        reg.department_name?.toLowerCase().includes(term)
      );
    }
    
    setFilteredRegistrations(filtered);
  }, [activeTab, searchTerm, registrations]);

  const handleView = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleApproveClick = (registration) => {
    setSelectedRegistration(registration);
    setShowApprovalModal(true);
  };

  const handleRejectClick = (registration) => {
    setSelectedRegistration(registration);
    setShowRejectionModal(true);
  };

  const handleApprovalSuccess = () => {
    setShowApprovalModal(false);
    setShowDetailModal(false);
    fetchRegistrations();
  };

  const handleRejectionSuccess = () => {
    setShowRejectionModal(false);
    setShowDetailModal(false);
    fetchRegistrations();
  };

  const tabs = [
    { key: 'ALL', label: 'All', icon: <Users size={18} /> },
    { key: 'STUDENT', label: 'Students', icon: <GraduationCap size={18} /> },
    { key: 'COMPANY', label: 'Companies', icon: <Building2 size={18} /> },
    { key: 'ADVISOR', label: 'Advisors', icon: <Users size={18} /> },
    { key: 'DEPARTMENT', label: 'Departments', icon: <School size={18} /> },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'STUDENT': return <GraduationCap size={20} />;
      case 'COMPANY': return <Building2 size={20} />;
      case 'ADVISOR': return <Users size={20} />;
      case 'DEPARTMENT': return <School size={20} />;
      default: return <Users size={20} />;
    }
  };

  return (
    <div className="pending-registrations-premium">
      <Header 
        title="Pending Registrations" 
        subtitle="Awaiting review and approval. Ensure all documents are valid before granting system access." 
      />

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-controls"
      >
        <div className="premium-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`premium-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              <span className="tab-badge">
                {tab.key === 'ALL' 
                  ? registrations.length 
                  : registrations.filter(r => r.request_type === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        <div className="premium-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-content"
      >
        {loading ? (
          <div className="premium-loading">
            <div className="loader-glow"></div>
            <p>Scanning registry for pending nodes...</p>
          </div>
        ) : error ? (
          <div className="premium-error-state">
            <X size={48} color="var(--uil-accent-danger)" />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button onClick={fetchRegistrations} className="premium-btn btn-approve">Retry Connection</button>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="premium-empty">
            <Inbox size={80} strokeWidth={1} />
            <h3>Queue is Clear</h3>
            <p>All registration requests have been processed.</p>
          </div>
        ) : (
          <div className="registrations-table">
            {/* Table Header */}
            <div className="table-header">
              <div>Type</div>
              <div>Name / Email</div>
              <div>Department</div>
              <div>Submitted</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            <AnimatePresence mode="popLayout">
              {filteredRegistrations.map((reg, idx) => (
                <motion.div
                  key={reg.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.02 }}
                  className="table-row"
                >
                  {/* Type Badge */}
                  <div>
                    <span className={`type-badge type-${reg.request_type.toLowerCase()}`}>
                      {getTypeIcon(reg.request_type)}
                      <span>{reg.request_type}</span>
                    </span>
                  </div>

                  {/* Name & Email */}
                  <div className="registration-info">
                    <div className="registration-avatar">
                      {(reg.student_full_name ||
                        reg.company_name ||
                        reg.advisor_full_name ||
                        reg.department_name ||
                        'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="registration-name">
                        {reg.student_full_name ||
                         reg.company_name ||
                         reg.advisor_full_name ||
                         reg.department_name ||
                         'Anonymous Node'}
                      </div>
                      <div className="registration-email">{reg.email}</div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="registration-department">
                    {reg.request_type === 'COMPANY' && reg.target_department_names?.length > 0
                      ? reg.target_department_names.join(', ')
                      : reg.department_name || 'General Access'}
                  </div>

                  {/* Submitted Date */}
                  <div className="registration-date">
                    <Calendar size={14} />
                    {new Date(reg.submitted_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>

                  {/* Actions */}
                  <div className="registration-actions">
                    <button 
                      onClick={() => handleView(reg)}
                      className="action-btn btn-view"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleApproveClick(reg)}
                      className="action-btn btn-approve"
                      title="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleRejectClick(reg)}
                      className="action-btn btn-reject"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Modals - These remain the same but will benefit from the premium background */}
      <AnimatePresence>
        {showDetailModal && selectedRegistration && (
          <RegistrationDetailModal
            registration={selectedRegistration}
            onClose={() => setShowDetailModal(false)}
            onApprove={() => {
              setShowDetailModal(false);
              handleApproveClick(selectedRegistration);
            }}
            onReject={() => {
              setShowDetailModal(false);
              handleRejectClick(selectedRegistration);
            }}
          />
        )}

        {showApprovalModal && selectedRegistration && (
          <ApprovalConfirmation
            registration={selectedRegistration}
            onConfirm={handleApprovalSuccess}
            onCancel={() => setShowApprovalModal(false)}
          />
        )}

        {showRejectionModal && selectedRegistration && (
          <RejectionForm
            registration={selectedRegistration}
            onSubmit={handleRejectionSuccess}
            onCancel={() => setShowRejectionModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingRegistrations;