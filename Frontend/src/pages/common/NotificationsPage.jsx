/**
 * Notifications Page
 * Centralized hub for system alerts and registration events.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, AlertCircle, Info, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import Header from '../../components/common/Header';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async (page = 1, filter = null) => {
    setLoading(true);
    setError('');
    const result = await notificationService.getNotifications(page, filter);
    if (result.success) {
      setNotifications(result.data.results || result.data);
      setTotalPages(Math.ceil((result.data.count || 0) / 20));
      setCurrentPage(page);
    } else {
      setError(result.error || 'Failed to load notifications.');
    }
    setLoading(false);
  };

  useEffect(() => {
    const filter = activeTab === 'unread' ? 'false' : activeTab === 'read' ? 'true' : null;
    fetchNotifications(1, filter);
  }, [activeTab]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      refreshNotifications();
    }
    if (notif.link) navigate(notif.link);
    else if (notif.absolute_url) navigate(notif.absolute_url);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this notification?')) return;
    const result = await notificationService.deleteNotification(id);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    const result = await notificationService.markAllAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    if (type.includes('APPROVED') || type.includes('ACCEPTED')) {
      return <CheckCircle size={20} color="#14a800" strokeWidth={2} />;
    } else if (type.includes('REJECTED')) {
      return <XCircle size={20} color="#e53e3e" strokeWidth={2} />;
    } else if (type.includes('WARNING')) {
      return <AlertCircle size={20} color="#d69e2e" strokeWidth={2} />;
    } else {
      return <Info size={20} color="#2563eb" strokeWidth={2} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8f9' }}>
      <Header title="Notifications" subtitle="System Alerts & Updates" />
      
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px 60px' }}>
        
        {/* Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 24 }}>
          <div style={{ display: 'flex', gap: 8, background: '#ffffff', padding: 4, borderRadius: 8, border: '1px solid #e4e5e7' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'read', label: 'Read' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: activeTab === t.id ? '#14a800' : 'transparent',
                  color: activeTab === t.id ? '#fff' : '#6b7177',
                  transition: 'all 0.2s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllRead} style={{ padding: '10px 18px', background: '#ffffff', border: '1px solid #d5e0d5', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#14a800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e8f5e9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
              <Check size={16} strokeWidth={2} /> Mark All Read
            </button>
          )}
        </div>

        {/* Content */}
        <div>
          {error && <div style={{ background: '#fee', border: '1px solid #fc8181', borderRadius: 8, padding: '14px 18px', color: '#c53030', fontSize: 14, marginBottom: 24 }}>{error}</div>}

          {loading ? (
            <div style={{ background: '#ffffff', borderRadius: 12, padding: 60, textAlign: 'center', border: '1px solid #e4e5e7' }}>
               <div style={{ width: 60, height: 60, margin: '0 auto 20px', border: '4px solid #e4e5e7', borderTopColor: '#14a800', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
               <p style={{ fontSize: 14, color: '#6b7177', fontWeight: 600 }}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: 12, padding: '80px 40px', textAlign: 'center', border: '1px solid #e4e5e7' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: '#f7f8f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={40} color="#6b7177" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2d3d', marginBottom: 8 }}>No Notifications</h3>
              <p style={{ fontSize: 14, color: '#6b7177', margin: 0 }}>You have no notifications at the moment. You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${!n.is_read ? '#14a800' : '#e4e5e7'}`,
                    borderLeft: !n.is_read ? '4px solid #14a800' : '1px solid #e4e5e7',
                    borderRadius: 8,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Icon */}
                  <div style={{ 
                    width: 40, height: 40, borderRadius: '50%', background: '#f7f8f9', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    border: '1px solid #e4e5e7'
                  }}>
                    {getNotificationIcon(n.notification_type)}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1f2d3d', margin: 0 }}>{n.title}</h3>
                      {!n.is_read && <span style={{ padding: '2px 8px', borderRadius: 12, background: '#14a800', color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>New</span>}
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7177', margin: '0 0 8px 0', lineHeight: 1.5 }}>{n.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7177' }}>{n.time_ago}</span>
                       {n.link && (
                         <>
                           <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#d5e0d5' }} />
                           <span style={{ fontSize: 11, fontWeight: 600, color: '#14a800' }}>View details →</span>
                         </>
                       )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(n.id, e)}
                    style={{ background: 'none', border: 'none', color: '#6b7177', cursor: 'pointer', padding: 6, opacity: 0.4, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#e53e3e'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.color = '#6b7177'; }}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 40 }}>
              <button
                onClick={() => fetchNotifications(currentPage - 1, activeTab === 'unread' ? 'false' : activeTab === 'read' ? 'true' : null)}
                disabled={currentPage === 1}
                style={{ padding: '10px 18px', background: '#ffffff', border: '1px solid #d5e0d5', borderRadius: 8, color: '#1f2d3d', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, transition: 'all 0.2s' }}
                onMouseEnter={(e) => currentPage !== 1 && (e.currentTarget.style.background = '#f7f8f9')}
                onMouseLeave={(e) => currentPage !== 1 && (e.currentTarget.style.background = '#ffffff')}
              >
                <ChevronLeft size={16} strokeWidth={2} /> Previous
              </button>
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7177', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Page</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2d3d' }}>{currentPage} <span style={{ opacity: 0.3 }}>/</span> {totalPages}</div>
              </div>
              <button
                onClick={() => fetchNotifications(currentPage + 1, activeTab === 'unread' ? 'false' : activeTab === 'read' ? 'true' : null)}
                disabled={currentPage === totalPages}
                style={{ padding: '10px 18px', background: '#ffffff', border: '1px solid #d5e0d5', borderRadius: 8, color: '#1f2d3d', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, transition: 'all 0.2s' }}
                onMouseEnter={(e) => currentPage !== totalPages && (e.currentTarget.style.background = '#f7f8f9')}
                onMouseLeave={(e) => currentPage !== totalPages && (e.currentTarget.style.background = '#ffffff')}
              >
                Next <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;