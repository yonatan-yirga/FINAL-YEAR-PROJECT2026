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
  Eye, EyeOff, RefreshCw
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
  
  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: userInfo.full_name || '',
    email: userInfo.email || '',
    phone_number: userInfo.phone_number || '',
    city: userInfo.city || '',
    address: userInfo.address || '',
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
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      const updatedUser = { ...userInfo, ...profileForm };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
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
                  >
                    <IconComponent size={18} />
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
                <div className="settings-section-header">
                  <User size={20} />
                  <div>
                    <h2>Profile Information</h2>
                    <p>Update your personal information and contact details</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="settings-form">
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

                  <div className="settings-form-actions">
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
                <div className="settings-section-header">
                  <Lock size={20} />
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
                <div className="settings-section-header">
                  <Bell size={20} />
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
                <div className="settings-section-header">
                  <Globe size={20} />
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
