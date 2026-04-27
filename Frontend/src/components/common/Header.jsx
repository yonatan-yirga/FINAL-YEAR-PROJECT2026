/**
 * Header Component
 * Premium navigation with theme switching and professional identity
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun } from 'lucide-react';
import NotificationBell from './NotificationBell';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '../../services/api';
import './Header.css';

const Header = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  const BACKEND = API_URL.replace('/api', '');
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const cleanBackend = BACKEND.endsWith('/') ? BACKEND.slice(0, -1) : BACKEND;
    return `${cleanBackend}${cleanUrl}`;
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {/* University Logo */}
        <div className="university-logo">
          <div className="logo-image-wrapper">
            <img 
              src="/dmu-logo.png" 
              alt="Debre Markos University" 
              className="logo-image"
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-circle">DMU</div>
            </div>
          </div>
          <div className="logo-text">
            <div className="logo-title">Debre Markos University</div>
            <div className="logo-subtitle">Internship Management System</div>
          </div>
        </div>

        {/* Title Section */}
        <div className="header-title-section">
          <h1 className="header-title">{title || 'Dashboard'}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>

        {/* Right Section */}
        <div className="header-actions">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Identity / Profile Link */}
          <div className="header-identity">
            {user?.role === 'STUDENT' ? (
              <button 
                onClick={() => window.location.href = '/student/profile'} 
                className="profile-preview-btn"
              >
                {user?.avatar ? (
                  <img 
                    src={getMediaUrl(user.avatar)} 
                    alt="Profile" 
                    className="header-avatar"
                  />
                ) : (
                  <div className="header-avatar-placeholder">
                    {(user?.full_name || 'U').charAt(0)}
                  </div>
                )}
                <div className="header-user-meta">
                  <span className="header-username">{user?.full_name?.split(' ')[0]}</span>
                  <span className="header-role">Student</span>
                </div>
              </button>
            ) : (
              <div className="header-user-info">
                <span className="header-username">{user?.full_name || user?.email}</span>
                <span className="header-role">{user?.role?.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} className="header-logout-btn" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default Header;