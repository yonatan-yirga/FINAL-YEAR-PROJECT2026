          /**
 * InternshipDetail Page
 * Modern Upwork-inspired design with professional icons
 * Full detail view of an internship for students
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import SkillMatcher from '../../components/common/SkillMatcher';
import applicationService from '../../services/applicationService';
import apiService from '../../services/api';
import useAuth from '../../hooks/useAuth';
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
  const { user } = useAuth() || {}; // Handle case where useAuth might return null

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [isCompanyInfoOpen, setIsCompanyInfoOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isMatchOpen, setIsMatchOpen] = useState(false);

  // After AuthContext fix, profile is merged into user → user.skills is direct
  const studentSkills = user?.skills || '';

  useEffect(() => {
    fetchInternship();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInternship = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching internship ID:', id);
      
      // Use the new public detail endpoint
      const response = await apiService.get(`/internships/public/${id}/`);
      const data = response.data || response;
      
      console.log('✅ Internship data received:', data);
      
      if (data) {
        setInternship(data);
      } else {
        setError('Internship not found.');
      }
    } catch (error) {
      console.error('❌ Error fetching internship:', error);
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
   * Returns object with completion status and missing fields
   */
  const checkProfileCompletion = () => {
    if (!user) {
      return { 
        isComplete: false, 
        missingFields: ['User not logged in'],
        message: 'Please log in to apply for internships.'
      };
    }
    
    // Helper function to get field value from user or user.profile
    const getFieldValue = (fieldName) => {
      return user[fieldName] || user.profile?.[fieldName] || '';
    };
    
    // Check ESSENTIAL fields for application
    const email = getFieldValue('email');
    const fullName = getFieldValue('full_name') || (getFieldValue('first_name') && getFieldValue('last_name'));
    const skills = getFieldValue('skills');
    const phoneNumber = getFieldValue('phone_number');
    const city = getFieldValue('city');
    
    const requiredFields = [
      { name: 'Email', value: email, field: 'email' },
      { name: 'Full Name', value: fullName, field: 'full_name' },
      { name: 'Skills', value: skills, field: 'skills' },
      { name: 'Phone Number', value: phoneNumber, field: 'phone_number' },
      { name: 'City', value: city, field: 'city' }
    ];
    
    // Find missing fields
    const missingFields = requiredFields
      .filter(field => !field.value || field.value.toString().trim().length === 0)
      .map(field => field.name);
    
    const isComplete = missingFields.length === 0;
    
    console.log(`📋 Profile Completion Check:`);
    requiredFields.forEach(field => {
      const isValid = field.value && field.value.toString().trim().length > 0;
      console.log(`  ${isValid ? '✅' : '❌'} ${field.name}: ${isValid ? 'OK' : 'MISSING'}`);
    });
    console.log(`\n${isComplete ? '✅' : '❌'} Profile is ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
    
    return {
      isComplete,
      missingFields,
      message: isComplete 
        ? 'Profile is complete' 
        : `Please complete your profile first. Missing: ${missingFields.join(', ')}`
    };
  };

  /**
   * Apply directly with profile data - NO MODAL
   */
  const handleApply = async () => {
    // Check if user is authenticated
    if (!user) {
      // Navigate to register page instead of showing modal
      navigate('/register');
      return;
    }
    
    // Check if user is a student
    if (user.role !== 'STUDENT') {
      setApplyError('Only students can apply to internships. Please log in with a student account.');
      return;
    }
    
    // Check if profile is complete
    const profileCheck = checkProfileCompletion();
    if (!profileCheck.isComplete) {
      setApplyError(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <strong>Profile Incomplete</strong>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
            {profileCheck.message}
          </p>
          <button
            onClick={() => navigate('/settings')}
            style={{
              padding: '10px 20px',
              background: '#14a800',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'flex-start',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#0d7a00'}
            onMouseLeave={(e) => e.target.style.background = '#14a800'}
          >
            <User size={16} />
            Complete Profile Now
          </button>
        </div>
      );
      return;
    }
    
    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    // Prepare application data from user profile
    const payload = {
      internship: id,
      // Auto-populate from profile - backend will handle this
      // We send empty strings and let backend fill from profile
      about_me: '',
      experience: '',
      education_level: '',
      projects: '',
      certificate: '',
      cover_letter: 'Application submitted via profile'
    };

    const result = await applicationService.applyToInternship(payload);

    if (result.success) {
      setApplySuccess('✅ Your application has been submitted successfully! Your profile information has been sent to the company.');
      // Refresh internship data to update application count
      fetchInternship();
    } else {
      setApplyError(result.error || 'Failed to submit application. Please try again.');
    }

    setApplying(false);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div style={{
          background: '#fff',
          borderBottom: '2px solid #e2e8f0',
          padding: '16px 24px'
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Internship Details
          </h1>
        </div>
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
        <div style={{
          background: '#fff',
          borderBottom: '2px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Internship Details
          </h1>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 20px',
              background: '#14a800',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
        <div className="detail-content" style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 60, 
            border: '1px solid #e4e5e7',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Briefcase size={64} color="#cbd5e1" style={{ marginBottom: 24 }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              No Internships Available Yet
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              There are currently no internship opportunities posted. Check back soon or browse other companies!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/student/search-internships')} 
                style={{
                  padding: '12px 24px',
                  background: '#14a800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <ArrowLeft size={16} />
                Browse All Internships
              </button>
              <button 
                onClick={() => navigate('/')} 
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#14a800',
                  border: '1px solid #14a800',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                View Partner Companies
              </button>
            </div>
            
            {/* Sample Data Preview */}
            <div style={{ 
              marginTop: 48, 
              paddingTop: 48, 
              borderTop: '1px solid #e4e5e7',
              textAlign: 'left'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
                💡 What to Expect
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                When internships are posted, you'll see details like:
              </p>
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: 12, 
                padding: 24,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                    Software Development Intern
                  </div>
                  <div style={{ fontSize: 14, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>📍 Addis Ababa</span>
                    <span>⏱️ 3-6 months</span>
                    <span>👥 5 positions</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                  Work on real-world projects, learn from experienced developers, and build your professional portfolio.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: 6, 
                    fontSize: 12, 
                    fontWeight: 500 
                  }}>
                    JavaScript
                  </span>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: 6, 
                    fontSize: 12, 
                    fontWeight: 500 
                  }}>
                    React
                  </span>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: 6, 
                    fontSize: 12, 
                    fontWeight: 500 
                  }}>
                    Python
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusColor(internship.status);

  return (
    <div className="detail-page">
      {/* Conditional Header - only show if user exists, otherwise show simple navigation */}
      {user ? (
        <Header title="Internship Details" subtitle={internship?.title} />
      ) : (
        <div style={{
          background: '#fff',
          borderBottom: '2px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Internship Details
          </h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '8px 20px',
                background: '#fff',
                color: '#14a800',
                border: '2px solid #14a800',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '8px 20px',
                background: '#14a800',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

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
                    <span 
                      className="hero-company" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/company/${internship.company}/internships`);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        color: '#14a800'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#0d7a00'}
                      onMouseLeave={(e) => e.target.style.color = '#14a800'}
                    >
                      {internship.company_name}
                    </span>
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
                        ) : user ? (
                          user.role === 'STUDENT' ? (
                            <>
                              <Rocket size={16} />
                              Apply for this Position
                            </>
                          ) : (
                            <>
                              <Lock size={16} />
                              Only Students Can Apply
                            </>
                          )
                        ) : (
                          <>
                            <Rocket size={16} />
                            Sign Up to Apply
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
            </div>

            {/* Statistics */}
            <div className="detail-card">
              <div className="card-header">
                <TrendingUp size={16} />
                <h2 className="card-section-title">Application Statistics</h2>
              </div>
              <div className="stats-row">
                <StatBox icon={Users} label="Total Applications" value={internship.application_count ?? '—'} color="#0ea5e9" />
                <StatBox icon={CheckCircle} label="Accepted" value={internship.accepted_count ?? '—'} color="#10b981" />
                <StatBox icon={Clock} label="Pending" value={internship.pending_count ?? '—'} color="#f59e0b" />
                <StatBox icon={Briefcase} label="Slots Left" value={internship.available_slots ?? '—'} color="#8b5cf6" />
              </div>
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
          </div>

          {/* RIGHT: Sidebar */}
          <div className="detail-sidebar">
            {/* Skill Match — only for students with skills */}
            {user?.role === 'STUDENT' && internship.required_skills && (
              <div className="detail-card sidebar-card">
                <div 
                  className="card-header card-header-clickable"
                  onClick={() => setIsMatchOpen(!isMatchOpen)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Award size={16} />
                  <h2 className="card-section-title">Your Match</h2>
                  {isMatchOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {isMatchOpen && (
                  <SkillMatcher
                    studentSkills={studentSkills}
                    requiredSkills={internship.required_skills}
                    matchPercentage={internship.match_percentage ?? null}
                    showExplain={true}
                    internshipId={internship.id}
                  />
                )}
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
              <div 
                className="card-header card-header-clickable"
                onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <Calendar size={16} />
                <h2 className="card-section-title">Timeline</h2>
                {isTimelineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {isTimelineOpen && (
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
              )}
            </div>
          </div>
        </div>
      </div>
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
    <div className="info-icon">
      <IconComponent size={16} />
    </div>
    <div className="info-content">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
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