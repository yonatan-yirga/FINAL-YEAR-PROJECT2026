/**
 * Notification Context
 * Manages global notification state
*/
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import notificationService from '../services/notificationService';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Watch the auth context so we know who is logged in
  const auth = useContext(AuthContext);
  const currentUserId = auth?.user?.id ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;

  // ─── Reset state immediately when user logs out or switches ───────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setRecentNotifications([]);
    }
  }, [isAuthenticated]);

  // ─── Core fetchers ────────────────────────────────────────────────────────

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    // Extra guard: don't fire if token was cleared (prevents 401 during logout/init)
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) setUnreadCount(result.data);
    } catch (err) {
      // Silently ignore — avoids console noise on login page
    }
  }, [isAuthenticated]);

  const fetchRecentNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const result = await notificationService.getRecentNotifications();
      if (result.success) setRecentNotifications(result.data);
    } catch (err) {
      console.error('Failed to fetch recent notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchUnreadCount(), fetchRecentNotifications()]);
  }, [fetchUnreadCount, fetchRecentNotifications]);

  // ─── Reload whenever the logged-in user changes ───────────────────────────
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      // Clear stale data first, then fetch for the new user
      setUnreadCount(0);
      setRecentNotifications([]);
      refreshNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]); // intentionally only on userId change

  // ─── Poll every 30 s while authenticated ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setRecentNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        await fetchUnreadCount();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: 'Failed to mark as read' };
    }
  }, [fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setRecentNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: 'Failed to mark all as read' };
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        setRecentNotifications(prev => prev.filter(n => n.id !== notificationId));
        await fetchUnreadCount();
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: 'Failed to delete notification' };
    }
  }, [fetchUnreadCount]);

  // ─── Context value ────────────────────────────────────────────────────────

  const value = {
    unreadCount,
    recentNotifications,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export default NotificationContext;