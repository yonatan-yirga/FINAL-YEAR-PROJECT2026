/**
 * Settings Page - Upwork-Inspired Design
 * Comprehensive settings management for user profile, security, and preferences
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import authService from '../../services/authService';
import {
  User, Lock, Bell, Globe, Moon, Sun, Shield, Mail,
  Phone, MapPin, Building2, Save, AlertTriangle, CheckCircle,
  Eye, EyeOff, RefreshCw, FileText, UserCog, ShieldCheck, 
  BellRing, Palette, Sparkles, CreditCard, Headphones
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isProfileHidden, setIsProfileHidden] = useState(false);
  
  // Get user info from localStorage
  const user = authService.getUser();
  const isCompany = user?.role === 'COMPANY';
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    city: '',
    address: '',
    website: '',
    description: '',
    supervisor_name: '',
    supervisor_email: '',
    supervisor_phone: '',
    supervisor_title: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    application_updates: true,
    internship_reminders: true,
    system_announcements: true,
  });

  // Theme preference
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    // Fetch profile on mount
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await authService.getProfile();
        if (res.success && res.data) {
          const { user: userData, profile } = res.data;
          const isComp = userData?.role === 'COMPANY';
          const p = profile || {};
          setProfileForm({
            full_name: isComp ? (p.contact_person_name || '') : (userData?.full_name || ''),
            email: userData?.email || '',
            phone_number: p.phone_number || '',
            city: p.city || '',
            address: p.address || '',
            website: p.website || '',
            description: p.description || '',
            contact_person_title: p.contact_person_title || '',
            supervisor_name: p.supervisor_name || '',
            supervisor_email: p.supervisor_email || '',
            supervisor_phone: p.supervisor_phone || '',
            supervisor_title: p.supervisor_title || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const dataToSave = { ...profileForm };
      
      // Validate supervisor fields for company users
      if (isCompany) {
        const missingFields = [];
        if (!dataToSave.supervisor_name?.trim()) missingFields.push('Supervisor Full Name');
        if (!dataToSave.supervisor_title?.trim()) missingFields.push('Supervisor Title/Position');
        if (!dataToSave.supervisor_email?.trim()) missingFields.push('Supervisor Email');
        if (!dataToSave.supervisor_phone?.trim()) missingFields.push('Supervisor Phone');
        
        if (missingFields.length > 0) {
          setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dataToSave.supervisor_email)) {
          setError('Please enter a valid supervisor email address');
          setLoading(false);
          return;
        }
      }
      
      // Always remove email - it's read-only in the backend
      delete dataToSave.email;
      
      if (isCompany) {
        // For companies, map full_name to contact_person_name
        dataToSave.contact_person_name = profileForm.full_name;
        delete dataToSave.full_name;
      }

      console.log('Sending profile update:', dataToSave);
      const res = await authService.updateProfile(dataToSave);
      console.log('Profile update response:', res);
      
      if (res.success) {
        setSuccess('Profile updated successfully!');
        // Update local user info
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...existingUser, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Display detailed error message
        const errorMsg = typeof res.error === 'object' 
          ? JSON.stringify(res.error) 
          : (res.error || 'Failed to update profile.');
        console.error('Profile update error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Profile update exception:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setError('All password fields are required.');
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    
    if (passwordForm.old_password === passwordForm.new_password) {
      setError('New password must be different from current password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.changePassword(
        passwordForm.old_password,
        passwordForm.new_password,
        passwordForm.confirm_password
      );
      
      if (res.success) {
        if (res.data?.token) {
          localStorage.setItem('authToken', res.data.token);
        }
        setSuccess('Password changed successfully!');
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Failed to change password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('notifications', JSON.stringify(notifications));
      setSuccess('Notification preferences updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  };

  const profileTabLabel = isCompany ? 'Company Information' : 'Profile Information';

  const tabs = [
    { id: 'profile', label: profileTabLabel, icon: UserCog, color: '#14a800' },
    { id: 'security', label: 'Security', icon: ShieldCheck, color: '#3b82f6' },
    { id: 'notifications', label: 'Notifications', icon: BellRing, color: '#f59e0b' },
    { id: 'preferences', label: 'Appearance', icon: Palette, color: '#8b5cf6' },
  ];

  return (
    <div className="settings-page">
      <Header
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />

      <div className="settings-content">
        
        {/* Success Alert */}
        {success && (
          <div className="settings-alert settings-alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="settings-alert settings-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="settings-container">
          
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            <div className="settings-tabs">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ '--tab-color': tab.color }}
                  >
                    <div className="settings-tab-icon">
                      <IconComponent size={18} />
                    </div>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="settings-main">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="settings-section-header premium">
                  <div className="settings-header-icon-wrapper" style={{ background: 'rgba(20, 168, 0, 0.1)', color: '#14a800' }}>
                    <UserCog size={24} />
                  </div>
                  <div>
                    <h2>{profileTabLabel}</h2>
                    <p>{isCompany ? 'Manage company and supervisor information' : 'Update your personal information'}</p>
                  </div>
                  <Sparkles className="premium-sparkle" size={20} color="#f59e0b" />
                </div>

                <form onSubmit={handleProfileUpdate} className="settings-form">
                  {!isCompany && (
                    <>
                      <div className="settings-form-row">
                        <div className="settings-form-group">
                          <label>
                            <User size={14} />
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="settings-form-group">
                          <label>
                            <Mail size={14} />
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      <div className="settings-form-row">
                        <div className="settings-form-group">
                          <label>
                            <Phone size={14} />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone_number}
                            onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>

                        <div className="settings-form-group">
                          <label>
                            <MapPin size={14} />
                            City
                          </label>
                          <input
                            type="text"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            placeholder="Your city"
                          />
                        </div>
                      </div>

                      <div className="settings-form-group">
                        <label>
                          <Building2 size={14} />
                          Address
                        </label>
                        <textarea
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          placeholder="Enter your full address"
                          rows="3"
                        />
                      </div>
                    </>
                  )}

                  {isCompany && (
                    <>
                      <div style={{ marginTop: '32px', borderTop: '2px solid var(--border-subtle)', paddingTop: '32px' }}>
                        <div className="settings-section-header">
                          <Building2 size={20} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div>
                              <h2>Company Contact Information</h2>
                              <p>Manage how students and advisors contact your organization</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsProfileHidden(!isProfileHidden)}
                              style={{
                                padding: '8px 16px',
                                background: isProfileHidden ? 'var(--bg-root)' : '#14a800',
                                color: isProfileHidden ? 'var(--text-bright)' : '#ffffff',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {isProfileHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                              {isProfileHidden ? 'View Profile' : 'Hide Profile'}
                            </button>
                          </div>
                        </div>

                        <div className="settings-form">
                          <div className="settings-form-row">
                            <div className="settings-form-group">
                              <label>
                                <Mail size={14} />
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                placeholder="two306702@gmail.com"
                              />
                            </div>

                            <div className="settings-form-group">
                              <label>
                                <Globe size={14} />
                                Website URL
                              </label>
                              <input
                                type="url"
                                value={profileForm.website}
                                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                                placeholder="https://www.company.com"
                              />
                            </div>
                          </div>

                          <div className="settings-form-row">
                            <div className="settings-form-group">
                              <label>
                                <Phone size={14} />
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={profileForm.phone_number}
                                onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                                placeholder="0987654359"
                              />
                            </div>

                            <div className="settings-form-group">
                              <label>
                                <MapPin size={14} />
                                Office Address
                              </label>
                              <input
                                type="text"
                                value={profileForm.address}
                                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                placeholder="Enter office address"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Supervisor Information Section */}
                      <div style={{ marginTop: '32px', borderTop: '2px solid var(--border-subtle)', paddingTop: '32px' }}>
                        <div className="settings-section-header premium">
                          <div className="settings-header-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                            <UserCog size={24} />
                          </div>
                          <div>
                            <h2>Internship Supervisor Information</h2>
                            <p>Supervisor details for student-advisor communication and monthly reports</p>
                          </div>
                          <Sparkles className="premium-sparkle" size={20} color="#8b5cf6" />
                        </div>

                        <div className="settings-info-box" style={{ marginBottom: '24px', background: 'rgba(139, 92, 246, 0.05)', borderColor: '#8b5cf6' }}>
                          <Shield size={16} color="#8b5cf6" />
                          <div>
                            <strong>Why provide supervisor information? <span style={{ color: '#ef4444' }}>(Required)</span></strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                              <li>Enables direct communication between supervisor and student's academic advisor</li>
                              <li>Allows supervisor to send monthly progress reports to advisors</li>
                              <li>Facilitates better coordination for student internship oversight</li>
                              <li>Advisors will be notified when supervisor updates are made</li>
                            </ul>
                            <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                              <strong>Note:</strong> All supervisor fields are required to ensure proper communication channels.
                            </p>
                          </div>
                        </div>

                        <div className="settings-form">
                          <div className="settings-form-row">
                            <div className="settings-form-group">
                              <label>
                                <User size={14} />
                                Supervisor Full Name <span style={{ color: '#ef4444' }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={profileForm.supervisor_name}
                                onChange={(e) => setProfileForm({ ...profileForm, supervisor_name: e.target.value })}
                                placeholder="Enter supervisor's full name"
                                required
                              />
                            </div>

                            <div className="settings-form-group">
                              <label>
                                <Building2 size={14} />
                                Supervisor Title/Position <span style={{ color: '#ef4444' }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={profileForm.supervisor_title}
                                onChange={(e) => setProfileForm({ ...profileForm, supervisor_title: e.target.value })}
                                placeholder="e.g., Senior Developer, HR Manager"
                                required
                              />
                            </div>
                          </div>

                          <div className="settings-form-row">
                            <div className="settings-form-group">
                              <label>
                                <Mail size={14} />
                                Supervisor Email <span style={{ color: '#ef4444' }}>*</span>
                              </label>
                              <input
                                type="email"
                                value={profileForm.supervisor_email}
                                onChange={(e) => setProfileForm({ ...profileForm, supervisor_email: e.target.value })}
                                placeholder="supervisor@company.com"
                                required
                              />
                            </div>

                            <div className="settings-form-group">
                              <label>
                                <Phone size={14} />
                                Supervisor Phone <span style={{ color: '#ef4444' }}>*</span>
                              </label>
                              <input
                                type="tel"
                                value={profileForm.supervisor_phone}
                                onChange={(e) => setProfileForm({ ...profileForm, supervisor_phone: e.target.value })}
                                placeholder="+251 912 345 678"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="settings-form-actions" style={{ marginTop: '32px', borderTop: '2px solid var(--border-subtle)', paddingTop: '24px' }}>
                    <button type="submit" className="settings-btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <RefreshCw size={14} className="spinning" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="settings-section-header premium">
                  <div className="settings-header-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2>Security Settings</h2>
                    <p>Manage your password and account security</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="settings-form">
                  <div className="settings-form-group">
                    <label>
                      <Lock size={14} />
                      Current Password
                    </label>
                    <div className="settings-password-input">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        className="settings-password-toggle"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label>
                      <Shield size={14} />
                      New Password
                    </label>
                    <div className="settings-password-input">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        placeholder="Enter new password (min. 8 characters)"
                      />
                      <button
                        type="button"
                        className="settings-password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label>
                      <Shield size={14} />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="settings-info-box">
                    <Shield size={16} />
                    <div>
                      <strong>Password Requirements:</strong>
                      <ul>
                        <li>At least 8 characters long</li>
                        <li>Mix of uppercase and lowercase letters</li>
                        <li>Include numbers and special characters</li>
                      </ul>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button type="submit" className="settings-btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <RefreshCw size={14} className="spinning" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="settings-section-header premium">
                  <div className="settings-header-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <BellRing size={24} />
                  </div>
                  <div>
                    <h2>Notification Preferences</h2>
                    <p>Choose what notifications you want to receive</p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-toggle-list">
                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <Mail size={16} />
                        <div>
                          <h4>Email Notifications</h4>
                          <p>Receive important updates via email</p>
                        </div>
                      </div>
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          checked={notifications.email_notifications}
                          onChange={(e) => setNotifications({ ...notifications, email_notifications: e.target.checked })}
                        />
                        <span className="settings-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <Bell size={16} />
                        <div>
                          <h4>Application Updates</h4>
                          <p>Get notified about application status changes</p>
                        </div>
                      </div>
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          checked={notifications.application_updates}
                          onChange={(e) => setNotifications({ ...notifications, application_updates: e.target.checked })}
                        />
                        <span className="settings-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <AlertTriangle size={16} />
                        <div>
                          <h4>Internship Reminders</h4>
                          <p>Receive reminders about deadlines and tasks</p>
                        </div>
                      </div>
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          checked={notifications.internship_reminders}
                          onChange={(e) => setNotifications({ ...notifications, internship_reminders: e.target.checked })}
                        />
                        <span className="settings-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-toggle-item">
                      <div className="settings-toggle-info">
                        <Globe size={16} />
                        <div>
                          <h4>System Announcements</h4>
                          <p>Stay informed about system updates and news</p>
                        </div>
                      </div>
                      <label className="settings-toggle">
                        <input
                          type="checkbox"
                          checked={notifications.system_announcements}
                          onChange={(e) => setNotifications({ ...notifications, system_announcements: e.target.checked })}
                        />
                        <span className="settings-toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button
                      type="button"
                      className="settings-btn-primary"
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={14} className="spinning" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Save Preferences
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="settings-section">
                <div className="settings-section-header premium">
                  <div className="settings-header-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Palette size={24} />
                  </div>
                  <div>
                    <h2>Display Preferences</h2>
                    <p>Customize your experience</p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-preference-item">
                    <div className="settings-preference-info">
                      <div className="settings-preference-icon">
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                      </div>
                      <div>
                        <h4>Theme</h4>
                        <p>Choose your preferred color scheme</p>
                      </div>
                    </div>
                    <div className="settings-theme-buttons">
                      <button
                        className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                      >
                        <Sun size={16} />
                        Light
                      </button>
                      <button
                        className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                      >
                        <Moon size={16} />
                        Dark
                      </button>
                    </div>
                  </div>

                  <div className="settings-info-box">
                    <CheckCircle size={16} />
                    <div>
                      <strong>Theme Applied!</strong>
                      <p>Your theme preference has been saved and will persist across sessions.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
