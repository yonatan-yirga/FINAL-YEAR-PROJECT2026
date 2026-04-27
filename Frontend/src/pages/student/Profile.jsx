/**
 * Profile Page - Modern Student Portfolio
 * Beautiful UI/UX with Platinum/French Gray/Gunmetal Color Scheme
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { API_URL } from '../../services/api';
import { 
  User, Mail, Phone, MapPin, Calendar, GraduationCap, 
  Briefcase, FileText, Camera, Upload, Download, Edit,
  Save, RefreshCw, Award, Star, Target, Zap, Eye,
  CheckCircle, AlertCircle, Plus, ArrowRight
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    skills: '',
    experience: '',
    headline: '',
    about: '',
    location: '',
    education: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await authService.getProfile();
    if (result.success) {
      const p = result.data.profile;
      setProfile(p);
      setFormData({
        full_name: p.full_name || '',
        phone_number: p.phone_number || '',
        date_of_birth: p.date_of_birth || '',
        gender: p.gender || '',
        skills: p.skills || '',
        experience: p.experience || '',
        headline: p.headline || '',
        about: p.about || '',
        location: p.location || '',
        education: p.education || '',
      });
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'pdf' && file.type !== 'application/pdf') {
      setFeedback({ type: 'error', message: 'Please upload a PDF file.' });
      return;
    }
    if (type === 'image' && !file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please upload an image file (JPG/PNG).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'File size must be less than 5MB.' });
      return;
    }
    
    setter(file);
    
    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (setter === setAvatar) {
          setAvatarPreview(reader.result);
        } else if (setter === setBanner) {
          setBannerPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setFeedback({ type: '', message: '' });

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (cvFile) data.append('document', cvFile);
    if (avatar) data.append('avatar', avatar);
    if (banner) data.append('banner', banner);

    const result = await authService.updateProfile(data);
    if (result.success) {
      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setProfile(result.data.profile);
      setCvFile(null);
      setAvatar(null);
      setBanner(null);
      setAvatarPreview(null);
      setBannerPreview(null);
    } else {
      let displayError = result.error;
      if (typeof result.error === 'object') {
        const firstField = Object.keys(result.error)[0];
        const fieldError = result.error[firstField];
        displayError = `${firstField}: ${Array.isArray(fieldError) ? fieldError[0] : fieldError}`;
      }
      setFeedback({ type: 'error', message: displayError });
    }
    setUpdating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-page">
        <Header title="Student Profile" subtitle="Loading your profile..." />
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading profile details...</p>
        </div>
      </div>
    );
  }

  const BACKEND = API_URL.replace('/api', '');
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const cleanBackend = BACKEND.endsWith('/') ? BACKEND.slice(0, -1) : BACKEND;
    return `${cleanBackend}${cleanUrl}`;
  };

  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || '?';
  const completionPercentage = calculateProfileCompletion();

  function calculateProfileCompletion() {
    const fields = [
      { key: 'full_name', weight: 1 },
      { key: 'phone_number', weight: 1 },
      { key: 'skills', weight: 1 },
      { key: 'about', weight: 1 },
      { key: 'location', weight: 1 },
      { key: 'headline', weight: 1 },
      { key: 'education', weight: 1 }
    ];
    
    let completed = 0;
    let total = fields.length;
    
    // Check text fields
    fields.forEach(field => {
      if (formData[field.key] && formData[field.key].trim()) {
        completed += field.weight;
      }
    });
    
    // Check avatar
    if (profile?.avatar) {
      completed += 1;
      total += 1;
    } else {
      total += 1;
    }
    
    // Check document/CV
    if (profile?.document) {
      completed += 1;
      total += 1;
    } else {
      total += 1;
    }
    
    return Math.round((completed / total) * 100);
  }

  return (
    <div className="profile-page">
      <Header title="Student Profile" subtitle="Manage your professional portfolio" />

      <div className="profile-content">
        
        {/* Alert Messages */}
        {feedback.message && (
          <div className={`profile-alert ${feedback.type === 'success' ? 'profile-alert-success' : 'profile-alert-error'}`}>
            <span>{feedback.type === 'success' ? '✓' : '⚠'} {feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })}>×</button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="profile-header-card">
          {/* Banner Section */}
          <div className={`profile-banner ${bannerPreview ? 'has-preview' : ''}`}>
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner Preview" className="profile-banner-img" />
            ) : profile?.banner ? (
              <img src={getMediaUrl(profile.banner)} alt="Profile Banner" className="profile-banner-img" />
            ) : (
              <div className="profile-banner-placeholder" />
            )}
            <button 
              type="button" 
              className="profile-banner-edit-btn"
              onClick={() => bannerInputRef.current.click()}
              title="Change Banner"
            >
              <Camera size={20} />
            </button>
            <input 
              ref={bannerInputRef} 
              type="file" 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, setBanner, 'image')} 
            />
          </div>

          {/* Profile Info Section */}
          <div className="profile-info-section">
            {/* Avatar */}
            <div className="profile-avatar-container">
              <div className={`profile-avatar ${avatarPreview ? 'has-preview' : ''}`}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" />
                ) : profile?.avatar ? (
                  <img src={getMediaUrl(profile.avatar)} alt="Profile Avatar" />
                ) : (
                  <span className="profile-avatar-initial">{initial}</span>
                )}
                <button 
                  type="button" 
                  className="profile-avatar-edit-btn"
                  onClick={() => avatarInputRef.current.click()}
                  title="Change Avatar"
                >
                  <Camera size={16} />
                </button>
              </div>
              <input 
                ref={avatarInputRef} 
                type="file" 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, setAvatar, 'image')} 
              />
            </div>

            {/* Basic Info */}
            <div className="profile-basic-info">
              <h1 className="profile-name">{profile?.full_name || 'Complete Your Profile'}</h1>
              <p className="profile-headline">{profile?.headline || 'Add your professional headline'}</p>
              
              <div className="profile-meta">
                <div className="profile-meta-item">
                  <MapPin size={16} />
                  <span>{profile?.location || 'Add location'}</span>
                </div>
                <div className="profile-meta-item">
                  <GraduationCap size={16} />
                  <span>{user?.department_name || 'Student'}</span>
                </div>
              </div>

              {/* Completion Progress */}
              <div className="profile-completion">
                <div className="profile-completion-header">
                  <span className="profile-completion-label">Profile Completion</span>
                  <span className="profile-completion-percentage">{completionPercentage}%</span>
                </div>
                <div className="profile-completion-bar">
                  <div 
                    className="profile-completion-fill" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-grid">
            
            {/* Left Column - Main Content */}
            <div className="profile-left-column">
              
              {/* Personal Information */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <User size={20} />
                    Personal Information
                  </h2>
                </div>
                
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-form-label">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="profile-form-input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">Professional Headline</label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      className="profile-form-input"
                      placeholder="e.g. Computer Science Student"
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="profile-form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="profile-form-input"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="profile-form-input"
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-form-label">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="profile-form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <FileText size={20} />
                    About Me
                  </h2>
                </div>
                
                <div className="profile-form-group">
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    className="profile-form-textarea"
                    placeholder="Write a brief description about yourself, your interests, and career goals..."
                    rows={6}
                  />
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <Zap size={20} />
                    Skills & Experience
                  </h2>
                </div>
                
                <div className="profile-form-group">
                  <label className="profile-form-label">Technical Skills *</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="profile-form-input"
                    placeholder="e.g. React, Python, SQL, Project Management..."
                    required
                  />
                  <span className="profile-form-hint">Separate skills with commas</span>
                </div>
                
                <div className="profile-form-group">
                  <label className="profile-form-label">Experience</label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="profile-form-textarea"
                    placeholder="Describe your work experience, internships, projects, and achievements..."
                    rows={5}
                  />
                </div>
              </div>

              {/* Education */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <GraduationCap size={20} />
                    Education
                  </h2>
                </div>
                
                <div className="profile-form-group">
                  <textarea
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="profile-form-textarea"
                    placeholder="List your educational background, degrees, certifications, and relevant coursework..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="profile-right-column">
              
              {/* Quick Actions */}
              <div className="profile-card profile-card-highlight">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <Target size={20} />
                    Quick Actions
                  </h2>
                </div>
                
                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-action-btn primary"
                    onClick={() => navigate('/student/applications')}
                  >
                    <Eye size={18} />
                    <span>View Applications</span>
                  </button>
                  
                  <button
                    type="button"
                    className="profile-action-btn secondary"
                    onClick={() => navigate('/student/search-internships')}
                  >
                    <Briefcase size={18} />
                    <span>Find Internships</span>
                  </button>
                </div>
              </div>

              {/* CV Upload */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <FileText size={20} />
                    Resume/CV
                  </h2>
                </div>
                
                <div className="profile-cv-section">
                  {profile?.document ? (
                    <div className="profile-cv-current">
                      <div className="profile-cv-info">
                        <FileText size={24} />
                        <div>
                          <span className="profile-cv-label">Current CV</span>
                          <a 
                            href={getMediaUrl(profile.document)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="profile-cv-link"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-cv-empty">
                      <Upload size={32} />
                      <p>No CV uploaded yet</p>
                    </div>
                  )}
                  
                  <div className="profile-cv-upload">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, setCvFile, 'pdf')}
                      style={{ display: 'none' }}
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" className="profile-cv-upload-btn">
                      <Upload size={18} />
                      <span>{cvFile ? `Selected: ${cvFile.name}` : 'Upload New CV (PDF)'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">
                    <Award size={20} />
                    Profile Stats
                  </h2>
                </div>
                
                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="profile-stat-value">{completionPercentage}%</span>
                    <span className="profile-stat-label">Complete</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-value">{profile?.skills?.split(',').length || 0}</span>
                    <span className="profile-stat-label">Skills</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-value">{profile?.document ? '1' : '0'}</span>
                    <span className="profile-stat-label">Documents</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={updating}
                className="profile-save-btn"
              >
                {updating ? (
                  <>
                    <RefreshCw size={18} className="spinning" />
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;