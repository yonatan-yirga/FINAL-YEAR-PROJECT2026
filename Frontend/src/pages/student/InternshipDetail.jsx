/**
 * InternshipDetail Page
 * Modern Upwork-inspired design with professional icons
 * Full detail view of an internship for students
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import SkillMatcher from '../../components/common/SkillMatcher';
import internshipService from '../../services/internshipService';
import applicationService from '../../services/applicationService';
import useAuth from '../../hooks/useAuth';
import ApplicationFormModal from '../../components/modals/ApplicationFormModal';
import { 
  MapPin, Calendar, Clock, Users, AlertCircle, 
  Rocket, Lock, XCircle, CheckCircle, Building2,
  Mail, Phone, Globe, Briefcase, TrendingUp,
  Award, Target, ArrowLeft, FileText, User, ChevronDown, ChevronUp
} from 'lucide-react';
import './InternshipDetail.css';

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompanyInfoOpen, setIsCompanyInfoOpen] = useState(false);

  // After AuthContext fix, profile is merged into user → user.skills is direct
  const studentSkills = user?.skills || '';

  useEffect(() => {
    fetchInternship();
  }, [id]);

  const fetchInternship = async () => {
    setLoading(true);
    const result = await internshipService.getById(id);
    if (result.success) {
      setInternship(result.data);
    } else {
      setError('Internship not found or you do not have access.');
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    if (status === 'OPEN') return { bg: '#c6f6d5', color: '#22543d' };
    if (status === 'CLOSED') return { bg: '#feebc8', color: '#7c2d12' };
    if (status === 'FILLED') return { bg: '#fed7d7', color: '#742a2a' };
    return { bg: '#e2e8f0', color: '#2d3748' };
  };

  /**
   * Check if student profile is complete
   */
  const isProfileComplete = () => {
    if (!user) return false;
    
    // Check required profile fields
    const requiredFields = [
      'first_name',
      'last_name', 
      'email',
      'phone',
      'skills',
      'about'
    ];
    
    return requiredFields.every(field => {
      const value = user[field];
      return value && value.toString().trim().length > 0;
    });
  };

  /**
   * Open application modal with profile validation
   */
  const handleApply = () => {
    // Check if profile is complete
    if (!isProfileComplete()) {
      setApplyError('Please complete your profile first before applying. Go to Profile → Edit Profile to fill in all required information.');
      return;
    }
    
    setApplyError(''); // Clear any previous errors
    setIsModalOpen(true);
  };

  /**
   * Actual submission handler — called from the modal
   */
  const submitApplication = async (applicationData) => {
    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    const payload = {
      internship: id,
      ...applicationData
    };

    const result = await applicationService.applyToInternship(payload);

    if (result.success) {
      setApplySuccess('Your application has been submitted! The company will review it soon.');
      setIsModalOpen(false);
    } else {
      setApplyError(result.error || 'Failed to submit application. Please try again.');
    }

    setApplying(false);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Header title="Internship Details" />
        <div className="detail-loading">
          <div className="loading-spinner-lg" />
          <p>Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <Header title="Internship Details" />
        <div className="detail-error">
          <p>{error}</p>
          <button onClick={() => navigate('/student/search-internships')} className="back-btn">
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusColor(internship.status);

  return (
    <div className="detail-page">
      <Header title="Internship Details" subtitle={internship.title} />

      <div className="detail-content">
        {/* Breadcrumb */}
        <button className="breadcrumb-back" onClick={() => navigate('/student/search-internships')}>
          <ArrowLeft size={14} />
          Back to Search
        </button>

        <div className="detail-layout">
          {/* LEFT: Main Info */}
          <div className="detail-main">
            {/* Hero Card */}
            <div className="hero-card">
              <div className="hero-header">
                <div className="hero-icon">
                  <Briefcase size={32} />
                </div>
                <div className="hero-content">
                  <h1 className="hero-title">{internship.title}</h1>
                  <div className="hero-company-row">
                    <Building2 size={14} />
                    <span className="hero-company">{internship.company_name}</span>
                  </div>
                </div>
                <span className="status-badge" style={statusStyle}>
                  {internship.status}
                </span>
              </div>

              <div className="hero-meta">
                <MetaItem icon={MapPin} label={internship.location} />
                <MetaItem icon={Calendar} label={`Starts ${formatDate(internship.start_date)}`} />
                <MetaItem icon={Clock} label={`${internship.duration_months} month${internship.duration_months > 1 ? 's' : ''}`} />
                <MetaItem icon={Users} label={`${internship.available_slots} slot${internship.available_slots !== 1 ? 's' : ''} available`} />
                {internship.application_deadline && (
                  <MetaItem
                    icon={AlertCircle}
                    label={`Deadline: ${formatDate(internship.application_deadline)}`}
                    warn={internship.is_deadline_passed}
                  />
                )}
              </div>

              {/* Apply section */}
              {user?.role === 'STUDENT' && (
                <div className="apply-section">
                  {applySuccess ? (
                    <div className="apply-success">
                      <CheckCircle size={20} />
                      {applySuccess}
                    </div>
                  ) : (
                    <>
                      {applyError && (
                        <div className="apply-error">
                          <AlertCircle size={18} />
                          {applyError}
                        </div>
                      )}
                      {internship.is_accepting_applications ? (
                        <button
                          className="apply-btn"
                          onClick={handleApply}
                          disabled={applying}
                        >
                          {applying ? (
                            <><span className="btn-spinner" /> Submitting...</>
                          ) : (
                            <>
                              <Rocket size={16} />
                              Apply for this Position
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="not-accepting">
                          {internship.status === 'FILLED'
                            ? <><Lock size={18} /> All positions are filled</>
                            : internship.is_deadline_passed
                              ? <><AlertCircle size={18} /> Application deadline has passed</>
                              : <><XCircle size={18} /> This internship is not accepting applications</>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="detail-card">
              <div className="card-header">
                <FileText size={16} />
                <h2 className="card-section-title">About This Internship</h2>
              </div>
              <p className="description-text">{internship.description}</p>
            </div>

            {/* Skills Required */}
            <div className="detail-card">
              <div className="card-header">
                <Target size={16} />
                <h2 className="card-section-title">Required Skills</h2>
              </div>
              <div className="skills-list">
                {(internship.skills_list || internship.required_skills?.split(',') || []).map((skill, i) => (
                  <span key={i} className="skill-tag">
                    <CheckCircle size={14} />
                    <span>{typeof skill === 'string' ? skill.trim() : skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="detail-card">
              <div className="card-header">
                <TrendingUp size={16} />
                <h2 className="card-section-title">Application Statistics</h2>
              </div>
              <div className="stats-row">
                <StatBox icon={Users} label="Total Applications" value={internship.application_count ?? '—'} />
                <StatBox icon={CheckCircle} label="Accepted" value={internship.accepted_count ?? '—'} color="#10b981" />
                <StatBox icon={Clock} label="Pending" value={internship.pending_count ?? '—'} color="#f59e0b" />
                <StatBox icon={Briefcase} label="Slots Left" value={internship.available_slots ?? '—'} color="#C9A84C" />
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="detail-sidebar">
            {/* Skill Match — only for students with skills */}
            {user?.role === 'STUDENT' && internship.required_skills && (
              <div className="detail-card sidebar-card">
                <div className="card-header">
                  <Award size={16} />
                  <h2 className="card-section-title">Your Match</h2>
                </div>
                <SkillMatcher
                  studentSkills={studentSkills}
                  requiredSkills={internship.required_skills}
                  matchPercentage={internship.match_percentage ?? null}
                  showExplain={true}
                  internshipId={internship.id}
                />
              </div>
            )}

            {/* Company Info */}
            <div className="detail-card sidebar-card">
              <div 
                className="card-header card-header-clickable" 
                onClick={() => setIsCompanyInfoOpen(!isCompanyInfoOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <Building2 size={16} />
                <h2 className="card-section-title">Company Information</h2>
                {isCompanyInfoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {isCompanyInfoOpen && (
                <div className="company-info">
                  <InfoRow icon={Building2} label="Company" value={internship.company_name} />
                  <InfoRow icon={Briefcase} label="Department" value={internship.department_name} />
                  {internship.contact_person_name && (
                    <InfoRow icon={User} label="Contact" value={`${internship.contact_person_name}${internship.contact_person_title ? ` (${internship.contact_person_title})` : ''}`} />
                  )}
                  {internship.company_email && (
                    <InfoRow icon={Mail} label="Email" value={internship.company_email} />
                  )}
                  {internship.company_phone && (
                    <InfoRow icon={Phone} label="Phone" value={internship.company_phone} />
                  )}
                  {internship.company_city && (
                    <InfoRow icon={MapPin} label="City" value={internship.company_city} />
                  )}
                  {internship.company_address && (
                    <InfoRow icon={Globe} label="Address" value={internship.company_address} />
                  )}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="detail-card sidebar-card">
              <div className="card-header">
                <Calendar size={16} />
                <h2 className="card-section-title">Timeline</h2>
              </div>
              <div className="timeline-info">
                <TimelineItem icon={Calendar} label="Start Date" value={formatDate(internship.start_date)} />
                {internship.end_date && (
                  <TimelineItem icon={Calendar} label="End Date" value={formatDate(internship.end_date)} />
                )}
                <TimelineItem icon={Clock} label="Duration" value={`${internship.duration_months} months`} />
                {internship.application_deadline && (
                  <TimelineItem
                    icon={AlertCircle}
                    label="Apply By"
                    value={formatDate(internship.application_deadline)}
                    warn={internship.is_deadline_passed}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitApplication}
        internship={internship}
        userProfile={user} // 'user' in useAuth now contains profile info
        applying={applying}
      />
    </div>
  );
};

// ─── Small helper components ──────────────────────────────────────────────────
const MetaItem = ({ icon: IconComponent, label, warn }) => (
  <div className={`meta-item ${warn ? 'meta-warn' : ''}`}>
    <IconComponent size={14} />
    <span>{label}</span>
  </div>
);

const StatBox = ({ icon: IconComponent, label, value, color = '#2D3142' }) => (
  <div className="stat-box">
    <div className="stat-icon" style={{ color }}>
      <IconComponent size={20} />
    </div>
    <span className="stat-box-value" style={{ color }}>{value}</span>
    <span className="stat-box-label">{label}</span>
  </div>
);

const InfoRow = ({ icon: IconComponent, label, value, warn }) => (
  <div className={`info-row ${warn ? 'info-warn' : ''}`}>
    <div className="info-row-header">
      <IconComponent size={14} />
      <span className="info-label">{label}</span>
    </div>
    <span className="info-value">{value}</span>
  </div>
);

const TimelineItem = ({ icon: IconComponent, label, value, warn }) => (
  <div className={`timeline-item ${warn ? 'timeline-warn' : ''}`}>
    <div className="timeline-icon">
      <IconComponent size={16} />
    </div>
    <div className="timeline-content">
      <span className="timeline-label">{label}</span>
      <span className="timeline-value">{value}</span>
    </div>
  </div>
);

export default InternshipDetail;