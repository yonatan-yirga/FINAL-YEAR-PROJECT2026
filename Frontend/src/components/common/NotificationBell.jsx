/**
 * Notification Bell Component
 * Displays notification icon with badge and dropdown
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    unreadCount,
    recentNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate to link
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.absolute_url) {
      navigate(notification.absolute_url);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        className="notification-bell-button"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="mark-all-read-btn"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="notification-dropdown-content">
            {isLoading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="notification-empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="notification-list">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="notification-unread-dot"></div>
                    )}

                    {/* Content */}
                    <div className="notification-item-content">
                      <h4 className="notification-item-title">
                        {notification.title}
                      </h4>
                      <p className="notification-item-message">
                        {notification.message.length > 80
                          ? `${notification.message.substring(0, 80)}...`
                          : notification.message}
                      </p>
                      <span className="notification-item-time">
                        {notification.time_ago}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="notification-dropdown-footer">
              <button onClick={handleViewAll} className="view-all-btn">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;