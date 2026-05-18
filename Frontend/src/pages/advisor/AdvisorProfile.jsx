/**
 * Advisor Profile Page
 * Allows advisors to set their preferred advising location, view department, and manage profile
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { 
  User, Phone, MapPin, Lock, 
  Save, RefreshCw, Edit, CheckCircle, AlertCircle
} from 'lucide-react';
import './AdvisorProfile.css';

const AdvisorProfile = () => {
  const { user, getProfile: refreshUserContext } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    advising_location: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isProfileComplete, setIsProfileComplete] = useState(false);

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
        advising_location: p.advising_location || '',
      });
      
      // Check if profile has been completed (advising_location is filled)
      // Once saved, the profile cannot be edited again
      if (p.advising_location && p.advising_location.trim() !== '') {
        setIsProfileComplete(true);
      }
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to load profile' });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if profile is already complete
    if (isProfileComplete) {
      setFeedback({ 
        type: 'error', 
        message: 'Profile has been submitted and cannot be modified. Contact administration if changes are needed.' 
      });
      return;
    }
    
    setUpdating(true);
    setFeedback({ type: '', message: '' });

    const result = await authService.updateProfile({
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      advising_location: formData.advising_location,
    });

    if (result.success) {
      setFeedback({ type: 'success', message: 'Profile saved successfully! Your profile is now locked and cannot be edited.' });
      
      // Refresh the profile data
      await fetchProfile();
      
      // Refresh the user context to update the header
      if (refreshUserContext) {
        await refreshUserContext();
      }
      
      // Lock the profile after successful save
      setIsProfileComplete(true);
    } else {
      setFeedback({ type: 'error', message: result.error || 'Failed to update profile' });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="advisor-profile-page">
        <Header title="Advisor Profile" subtitle="Manage your professional identity" />
        <div className="advisor-profile-container">
          <div className="loading-spinner">
            <RefreshCw size={40} className="spin" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="advisor-profile-page">
      <Header title="Advisor Profile" subtitle="Manage your professional identity" />
      <div className="advisor-profile-container">
        
        {/* Page Header */}
        <div className="advisor-profile-header">
          <div className="header-content">
            <div className="header-icon">
              <User size={32} />
            </div>
            <div>
              <h1 className="page-title">Advisor Profile</h1>
              <p className="page-subtitle">Manage your profile information and advising preferences</p>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {feedback.message && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{feedback.message}</span>
          </div>
        )}
        
        {/* Profile Locked Warning */}
        {isProfileComplete && (
          <div className="feedback-message warning" style={{
            backgroundColor: '#fff3cd',
            borderColor: '#ffc107',
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffc107'
          }}>
            <Lock size={20} />
            <span>
              <strong>Profile Locked:</strong> Your profile has been submitted and cannot be modified. 
              If you need to make changes, please contact the administration.
            </span>
          </div>
        )}

        <div className="advisor-profile-grid">
          
          {/* Main Profile Form */}
          <div className="profile-card">
            <div className="card-header">
              <h2 className="card-title">
                <Edit size={20} />
                Profile Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="profile-form">
              
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="full_name">
                  <User size={16} />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  disabled={isProfileComplete}
                  readOnly={isProfileComplete}
                  style={isProfileComplete ? { 
                    backgroundColor: '#f5f5f5', 
                    cursor: 'not-allowed',
                    opacity: 0.7 
                  } : {}}
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone_number">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+251-XXX-XXXXXX"
                  disabled={isProfileComplete}
                  readOnly={isProfileComplete}
                  style={isProfileComplete ? { 
                    backgroundColor: '#f5f5f5', 
                    cursor: 'not-allowed',
                    opacity: 0.7 
                  } : {}}
                />
              </div>

              {/* Advising Location */}
              <div className="form-group">
                <label htmlFor="advising_location">
                  <MapPin size={16} />
                  Preferred Advising Location *
                </label>
                <textarea
                  id="advising_location"
                  name="advising_location"
                  className="profile-textarea"
                  value={formData.advising_location}
                  onChange={handleInputChange}
                  placeholder="Enter your preferred location for advising students (e.g., Office Building A, Room 205)"
                  rows="3"
                  required
                  disabled={isProfileComplete}
                  readOnly={isProfileComplete}
                  style={isProfileComplete ? { 
                    backgroundColor: '#f5f5f5', 
                    cursor: 'not-allowed',
                    opacity: 0.7 
                  } : {}}
                />
                <small className="input-hint">
                  Specify where students can find you for in-person advising sessions
                </small>
              </div>

              {/* Submit Button - Hidden when profile is complete */}
              {!isProfileComplete && (
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={updating || !formData.full_name || !formData.advising_location}
                >
                  {updating ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="sidebar-cards">
            
            {/* Change Password Card */}
            <div className="quick-action-card">
              <div className="card-header">
                <h3 className="card-title">
                  <Lock size={18} />
                  Security
                </h3>
              </div>
              <div className="card-content">
                <p className="card-description">
                  Update your password to keep your account secure
                </p>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/settings/change-password')}
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="info-card">
              <div className="card-header">
                <h3 className="card-title">
                  <User size={18} />
                  Account Information
                </h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="info-label">Role:</span>
                  <span className="info-value">Academic Advisor</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{formData.full_name || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{formData.advising_location || 'Not set'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorProfile;
