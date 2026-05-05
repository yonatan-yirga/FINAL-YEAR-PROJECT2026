/**
 * Messages Page
 * Shared by Student and Advisor — real-time-style chat interface with edit/delete.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/common/Header';
import messageService from '../../services/messageService';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherName, setOtherName] = useState('');
  const [internshipTitle, setInternshipTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    const res = await messageService.getConversations();
    if (res.success) setConversations(res.data);
    setLoading(false);
  };

  // Open a conversation
  const openConversation = useCallback(async (assignmentId) => {
    setActiveAssignment(assignmentId);
    const res = await messageService.getMessages(assignmentId);
    if (res.success) {
      setMessages(res.data.messages);
      setOtherName(res.data.other_name);
      setInternshipTitle(res.data.internship_title);
      // Update unread count in sidebar
      setConversations(prev =>
        prev.map(c => c.assignment_id === assignmentId ? { ...c, unread_count: 0 } : c)
      );
    }
  }, []);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeAssignment) return;
    pollRef.current = setInterval(async () => {
      const res = await messageService.getMessages(activeAssignment);
      if (res.success) setMessages(res.data.messages);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeAssignment]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeAssignment || sending) return;
    setSending(true);
    const res = await messageService.sendMessage(activeAssignment, newMessage.trim());
    if (res.success) {
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    }
    setSending(false);
  };

  // Start editing a message
  const startEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  // Save edited message
  const saveEdit = async (messageId) => {
    if (!editContent.trim()) return;
    const res = await messageService.editMessage(messageId, editContent.trim());
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === messageId ? res.data : m));
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    setDeleteConfirmId(messageId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const res = await messageService.deleteMessage(deleteConfirmId);
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } else {
      alert(res.error || 'Failed to delete message');
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const formatTime = (dt) => {
    const d = new Date(dt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // ── Styles ──
  const S = {
    root: {
      minHeight: '100vh', backgroundColor: '#060B18',
      color: '#cbd5e1', fontFamily: "'Inter', sans-serif",
    },
    container: {
      maxWidth: '1200px', margin: '0 auto', padding: '24px',
      display: 'flex', gap: '24px', height: 'calc(100vh - 140px)',
    },
    sidebar: {
      width: '320px', flexShrink: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    },
    sidebarHeader: {
      padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontSize: '14px', fontWeight: '900', textTransform: 'uppercase',
      letterSpacing: '0.05em', color: '#94a3b8',
      display: 'flex', alignItems: 'center', gap: '10px',
    },
    convList: {
      flex: 1, overflowY: 'auto', padding: '8px',
    },
    convItem: (active) => ({
      padding: '16px',
      borderRadius: '16px',
      cursor: 'pointer',
      marginBottom: '4px',
      backgroundColor: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
      border: active ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid transparent',
      transition: 'all 0.2s ease',
    }),
    chatArea: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    },
    chatHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', alignItems: 'center', gap: '16px',
    },
    messagesArea: {
      flex: 1, overflowY: 'auto', padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '12px',
    },
    bubble: (mine) => ({
      maxWidth: '70%',
      padding: mine ? '40px 20px 14px 20px' : '14px 20px',
      borderRadius: mine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
      backgroundColor: mine ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
      border: mine ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255,255,255,0.05)',
      alignSelf: mine ? 'flex-end' : 'flex-start',
      wordBreak: 'break-word',
      position: 'relative',
    }),
    messageActions: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      display: 'flex',
      gap: '6px',
      transition: 'all 0.2s ease',
      zIndex: 10,
    },
    actionBtn: {
      padding: '6px 12px',
      background: 'rgba(245, 158, 11, 0.2)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      color: '#fff',
      fontSize: '11px',
      fontWeight: '700',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    },
    editInput: {
      width: '100%',
      padding: '10px',
      backgroundColor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      outline: 'none',
      fontFamily: "'Inter', sans-serif",
      marginBottom: '8px',
    },
    editActions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
    },
    deleteConfirmOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      backdropFilter: 'blur(4px)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    },
    deleteConfirmBox: {
      padding: '20px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      maxWidth: '280px',
    },
    inputBar: {
      padding: '16px 24px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', gap: '12px', alignItems: 'center',
    },
    input: {
      flex: 1, padding: '14px 20px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', color: '#fff', fontSize: '14px',
      outline: 'none', fontFamily: "'Inter', sans-serif",
    },
    sendBtn: {
      padding: '14px 28px',
      backgroundColor: '#f59e0b', color: '#060B18',
      border: 'none', borderRadius: '16px',
      fontSize: '14px', fontWeight: '800',
      cursor: 'pointer', textTransform: 'uppercase',
      letterSpacing: '0.03em',
      transition: 'all 0.2s ease',
    },
    emptyState: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      color: '#475569',
    },
    badge: {
      backgroundColor: '#f59e0b', color: '#060B18',
      borderRadius: '99px', padding: '2px 8px',
      fontSize: '11px', fontWeight: '900',
      minWidth: '20px', textAlign: 'center',
    },
  };

  if (loading) return (
    <div style={S.root}>
      <Header title="Messages" subtitle="Student-Advisor Communication Channel" />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>💬</div>
          <div style={{ fontWeight: '700' }}>Loading conversations...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.root}>
      <Header title="Messages" subtitle="Student-Advisor Communication Channel" />

      <div style={S.container}>
        {/* Sidebar: Conversation List */}
        <div style={S.sidebar}>
          <div style={S.sidebarHeader}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
            Conversations ({conversations.length})
          </div>
          <div style={S.convList}>
            {conversations.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
                No active conversations yet. You will see conversations here once an advisor is assigned.
              </div>
            ) : conversations.map(c => (
              <div
                key={c.assignment_id}
                style={S.convItem(activeAssignment === c.assignment_id)}
                onClick={() => openConversation(c.assignment_id)}
                onMouseEnter={e => {
                  if (activeAssignment !== c.assignment_id)
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={e => {
                  if (activeAssignment !== c.assignment_id)
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>{c.other_name}</span>
                  {c.unread_count > 0 && <span style={S.badge}>{c.unread_count}</span>}
                </div>
                <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600', marginBottom: '4px' }}>
                  {c.internship_title}
                </div>
                {c.last_message && (
                  <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.last_message}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>
                  {formatTime(c.last_message_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={S.chatArea}>
          {!activeAssignment ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: '64px' }}>💬</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#94a3b8' }}>Select a conversation</div>
              <div style={{ fontSize: '13px' }}>Choose a conversation from the sidebar to start messaging.</div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={S.chatHeader}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '900', color: '#060B18',
                }}>
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{otherName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{internshipTitle}</div>
                </div>
                <button 
                  onClick={() => window.open('https://meet.google.com/new', '_blank')}
                  style={{
                    marginLeft: 'auto',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                >
                  <span style={{ fontSize: '16px' }}>🎥</span> Start Google Meet
                </button>
              </div>

              {/* Messages */}
              <div style={S.messagesArea}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#475569', padding: '40px', fontSize: '13px' }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : messages.map(msg => (
                  <div 
                    key={msg.id} 
                    style={S.bubble(msg.is_mine)}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {/* Delete Confirmation Overlay */}
                    {deleteConfirmId === msg.id && (
                      <div style={S.deleteConfirmOverlay}>
                        <div style={S.deleteConfirmBox}>
                          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#fff' }}>
                            Delete this message?
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                            This action cannot be undone.
                          </div>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={cancelDelete}
                              style={{
                                padding: '8px 16px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmDelete}
                              style={{
                                padding: '8px 16px',
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Actions (Edit/Delete) - Only for own messages */}
                    {msg.is_mine && editingMessageId !== msg.id && deleteConfirmId !== msg.id && (
                      <div style={S.messageActions}>
                        <button
                          onClick={() => startEdit(msg)}
                          style={{
                            ...S.actionBtn,
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Edit message"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          style={{
                            ...S.actionBtn,
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Delete message"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}

                    <div style={{ fontSize: '10px', fontWeight: '700', color: msg.is_mine ? '#f59e0b' : '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {msg.is_mine ? 'You' : msg.sender_name}
                    </div>

                    {/* Edit Mode */}
                    {editingMessageId === msg.id ? (
                      <div>
                        <input
                          type="text"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          style={S.editInput}
                          autoFocus
                          onKeyPress={e => {
                            if (e.key === 'Enter') saveEdit(msg.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <div style={S.editActions}>
                          <button
                            onClick={cancelEdit}
                            style={{
                              ...S.actionBtn,
                              padding: '8px 16px',
                              background: 'rgba(255,255,255,0.1)',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            ✕ Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(msg.id)}
                            style={{
                              ...S.actionBtn,
                              padding: '8px 16px',
                              background: 'rgba(245, 158, 11, 0.3)',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            ✓ Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5' }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: '10px', color: '#475569', marginTop: '6px', textAlign: 'right' }}>
                          {formatTime(msg.created_at)}
                          {msg.is_edited && <span style={{ marginLeft: '6px', fontStyle: 'italic' }}>(edited)</span>}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSend} style={S.inputBar}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={S.input}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  style={{
                    ...S.sendBtn,
                    opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
                    cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? '...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
