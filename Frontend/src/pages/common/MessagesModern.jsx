/**
 * Modern Messages Page - Upwork-Inspired
 * Features: Video calls, file sharing, clean professional UI
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, Phone, PhoneOff, Paperclip, Send, Search, MoreVertical, 
  Smile, Image as ImageIcon, File, X, Download, Check, CheckCheck 
} from 'lucide-react';
import Header from '../../components/common/Header';
import VideoCallModalAgora from '../../components/chat/VideoCallModalAgora';
import messageService from '../../services/messageService';
import useAuth from '../../hooks/useAuth';
import './MessagesModern.css';

const MessagesModern = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [otherName, setOtherName] = useState('');
  const [otherUserId, setOtherUserId] = useState(null);
  const [internshipTitle, setInternshipTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);
  const handledCallMessageIds = useRef(new Set());
  const ringtoneRef = useRef(null);

  // Initialize ringtone and cleanup
  useEffect(() => {
    // Using a free, reliable notification sound
    ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3');
    ringtoneRef.current.loop = true;
    
    // Cleanup on unmount
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.src = "";
      }
    };
  }, []);

  // Stop ringtone automatically if incomingCall is dismissed
  useEffect(() => {
    if (!incomingCall && ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, [incomingCall]);

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

  // Helper to check for incoming calls
  const checkIncomingCall = (messagesList) => {
    if (!messagesList || messagesList.length === 0) return;
    
    const latestOverallMsg = messagesList[messagesList.length - 1];
    
    // Auto-dismiss call if the latest message is a call ended or declined message
    if (latestOverallMsg.content.includes('call ended') || latestOverallMsg.content.includes('Call declined')) {
      setIncomingCall(null);
    }
    
    // Check the last 5 messages in case another text was sent right after the call
    const recentMessages = messagesList.slice(-5);
    
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      
      if (!msg.is_mine && 
          msg.content.includes('📞 Started a') && 
          msg.content.includes('call. Please click')) {
        
        // If we already handled this call message, skip
        if (handledCallMessageIds.current.has(msg.id)) continue;
        
        // Backend sends "YYYY-MM-DD HH:MM:SS" which is implicitly UTC but lacks timezone info.
        // We convert it to a valid ISO format "YYYY-MM-DDTHH:MM:SSZ" before parsing.
        let dateStr = msg.created_at;
        if (!dateStr.includes('T')) dateStr = dateStr.replace(' ', 'T');
        if (!dateStr.endsWith('Z') && !dateStr.includes('+')) dateStr += 'Z';
        
        const msgTime = new Date(dateStr).getTime();
        const now = Date.now();
        const diff = Math.abs(now - msgTime);
        
        if (diff < 300000) { // 5 minutes
          handledCallMessageIds.current.add(msg.id);
          
          setIncomingCall({
            isVideo: msg.content.includes('video call'),
            messageId: msg.id
          });
          
          // Play ringtone
          if (ringtoneRef.current) {
            ringtoneRef.current.currentTime = 0;
            ringtoneRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
          }
          break; // Stop after finding the latest unhandled call
        }
      }
    }
  };

  // Open a conversation
  const openConversation = useCallback(async (assignmentId) => {
    setActiveAssignment(assignmentId);
    const res = await messageService.getMessages(assignmentId);
    if (res.success) {
      const data = res.data;
      setMessages(data.messages);
      
      // Check for incoming calls on initial load
      checkIncomingCall(data.messages);
      
      // Determine who the "other" user is based on current user's role
      let otherUserId, otherUserName;
      
      console.log('Opening conversation - User role:', user?.role);
      console.log('Response data:', data);
      
      if (user?.role === 'STUDENT') {
        // Student talks to advisor
        otherUserId = data.advisor_id;
        otherUserName = data.advisor_name;
        console.log('Student mode - Advisor ID:', otherUserId, 'Name:', otherUserName);
      } else if (user?.role === 'ADVISOR') {
        // Advisor talks to student
        otherUserId = data.student_id;
        otherUserName = data.student_name;
        console.log('Advisor mode - Student ID:', otherUserId, 'Name:', otherUserName);
      } else if (user?.role === 'COMPANY') {
        // Company can talk to either student or advisor
        // For now, default to student (you can add UI to switch)
        otherUserId = data.student_id;
        otherUserName = `${data.student_name} (Advisor: ${data.advisor_name})`;
        console.log('Company mode - Student ID:', otherUserId, 'Name:', otherUserName);
      }
      
      setOtherName(otherUserName || 'Unknown');
      setOtherUserId(otherUserId);
      setInternshipTitle(data.internship_title);
      
      console.log('Set otherUserId to:', otherUserId);
      
      setConversations(prev =>
        prev.map(c => c.assignment_id === assignmentId ? { ...c, unread_count: 0 } : c)
      );
    }
  }, [user]);

  // Poll for new messages
  useEffect(() => {
    if (!activeAssignment) return;
    pollRef.current = setInterval(async () => {
      const res = await messageService.getMessages(activeAssignment);
      if (res.success) {
        const newMessages = res.data.messages;
        checkIncomingCall(newMessages);
        setMessages(newMessages);
      }
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeAssignment]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeAssignment || sending) return;
    
    setSending(true);
    const messageText = selectedFile 
      ? `📎 ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` 
      : newMessage.trim();
    
    const res = await messageService.sendMessage(activeAssignment, messageText);
    if (res.success) {
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      setSelectedFile(null);
    }
    setSending(false);
  };

  // File selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Start video call
  const startVideoCall = () => {
    console.log('startVideoCall - activeAssignment:', activeAssignment, 'otherUserId:', otherUserId);
    
    if (!activeAssignment || !otherUserId) {
      console.error('Cannot start call: missing assignment or user ID');
      alert('Please select a conversation first before starting a call.');
      return;
    }
    
    setIsVideoCall(true);
    setIsCallModalOpen(true);
  };

  // Start voice call
  const startVoiceCall = () => {
    console.log('startVoiceCall - activeAssignment:', activeAssignment, 'otherUserId:', otherUserId);
    
    if (!activeAssignment || !otherUserId) {
      console.error('Cannot start call: missing assignment or user ID');
      alert('Please select a conversation first before starting a call.');
      return;
    }
    
    setIsVideoCall(false);
    setIsCallModalOpen(true);
  };

  // Handle call end
  const handleCallEnd = async (duration) => {
    if (!activeAssignment) return;
    
    // Send a message about the call
    const callType = isVideoCall ? 'Video' : 'Voice';
    const durationText = duration > 0 
      ? ` (${Math.floor(duration / 60)}m ${duration % 60}s)` 
      : '';
    const messageText = `📞 ${callType} call ended${durationText}`;
    
    const res = await messageService.sendMessage(activeAssignment, messageText);
    if (res.success) {
      setMessages(prev => [...prev, res.data]);
    }
  };

  // Format time
  const formatTime = (dt) => {
    const d = new Date(dt);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (!c) return false; // Skip if conversation is null/undefined
    
    const otherName = c.other_name || '';
    const internshipTitle = c.internship_title || '';
    const query = (searchQuery || '').toLowerCase();
    
    return otherName.toLowerCase().includes(query) ||
           internshipTitle.toLowerCase().includes(query);
  });

  if (loading) return (
    <div className="messages-modern-root">
      <Header title="Messages" subtitle="Modern Communication Hub" />
      <div className="messages-loading">
        <div className="loading-spinner"></div>
        <div>Loading conversations...</div>
      </div>
    </div>
  );

  return (
    <div className="messages-modern-root">
      <Header title="Messages" subtitle="Modern Communication Hub" />

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="incoming-call-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="incoming-call-modal" style={{
            background: 'white', padding: '30px', borderRadius: '16px',
            textAlign: 'center', width: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div className="caller-avatar" style={{
              width: '80px', height: '80px', borderRadius: '40px',
              backgroundColor: '#4a90e2', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '32px',
              margin: '0 auto 16px', fontWeight: 'bold'
            }}>
              {(otherName || '?').charAt(0).toUpperCase()}
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#333', fontSize: '20px' }}>{otherName}</h3>
            <p style={{ margin: '0 0 24px', color: '#666', fontSize: '15px' }}>
              Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call...
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  if (ringtoneRef.current) {
                    ringtoneRef.current.pause();
                    ringtoneRef.current.currentTime = 0;
                  }
                  setIncomingCall(null);
                  messageService.sendMessage(activeAssignment, "❌ Call declined");
                }}
                style={{
                  width: '56px', height: '56px', borderRadius: '28px',
                  border: 'none', backgroundColor: '#e74c3c', color: 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(231, 76, 60, 0.3)', transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Decline"
              >
                <PhoneOff size={24} />
              </button>
              <button 
                onClick={() => {
                  if (ringtoneRef.current) {
                    ringtoneRef.current.pause();
                    ringtoneRef.current.currentTime = 0;
                  }
                  setIsVideoCall(incomingCall.isVideo);
                  setIsCallModalOpen(true);
                  setIncomingCall(null);
                }}
                style={{
                  width: '56px', height: '56px', borderRadius: '28px',
                  border: 'none', backgroundColor: '#2ecc71', color: 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(46, 204, 113, 0.3)', transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Accept"
              >
                {incomingCall.isVideo ? <Video size={24} /> : <Phone size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      <VideoCallModalAgora
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        otherUserName={otherName}
        otherUserId={otherUserId}
        assignmentId={activeAssignment}
        isVideoCall={isVideoCall}
        onCallEnd={handleCallEnd}
      />

      <div className="messages-container">
        {/* Sidebar */}
        <div className="messages-sidebar">
          {/* Search */}
          <div className="sidebar-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Conversations List */}
          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="empty-conversations">
                {searchQuery ? 'No conversations found' : 'No active conversations yet'}
              </div>
            ) : filteredConversations.map(c => {
              // Determine display name and role based on user type
              let displayName = '';
              let displayRole = '';
              let avatarInitial = '?';
              
              if (c.user_role === 'COMPANY') {
                // Company sees: Student Name (Advisor: Advisor Name)
                displayName = c.student_name || 'Unknown Student';
                displayRole = `Advisor: ${c.advisor_name || 'Unknown'}`;
                avatarInitial = (c.student_name || '?').charAt(0).toUpperCase();
              } else if (c.user_role === 'STUDENT') {
                // Student sees: Advisor Name (Role: Advisor)
                displayName = c.other_name || 'Unknown';
                displayRole = c.other_role || 'ADVISOR';
                avatarInitial = (c.other_name || '?').charAt(0).toUpperCase();
              } else if (c.user_role === 'ADVISOR') {
                // Advisor sees: Student Name (Role: Student)
                displayName = c.other_name || 'Unknown';
                displayRole = c.other_role || 'STUDENT';
                avatarInitial = (c.other_name || '?').charAt(0).toUpperCase();
              }
              
              return (
                <div
                  key={c.assignment_id}
                  className={`conversation-item ${activeAssignment === c.assignment_id ? 'active' : ''}`}
                  onClick={() => openConversation(c.assignment_id)}
                >
                  <div className="conversation-avatar">
                    {avatarInitial}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">
                        {displayName}
                        {displayRole && (
                          <span style={{ 
                            fontSize: '0.75em', 
                            color: '#666', 
                            marginLeft: '6px',
                            fontWeight: '400',
                            backgroundColor: '#f0f0f0',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {displayRole}
                          </span>
                        )}
                      </span>
                      <span className="conversation-time">{formatTime(c.last_message_at)}</span>
                    </div>
                    <div className="conversation-subtitle">{c.internship_title || 'No title'}</div>
                    {c.last_message && (
                      <div className="conversation-preview">
                        {c.last_message}
                      </div>
                    )}
                  </div>
                  {c.unread_count > 0 && (
                    <div className="unread-badge">{c.unread_count}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {!activeAssignment ? (
            <div className="chat-empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">Select a conversation</div>
              <div className="empty-subtitle">Choose a conversation from the sidebar to start messaging</div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-avatar">
                    {(otherName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{otherName || 'Unknown'}</div>
                    <div className="chat-subtitle">{internshipTitle || 'No title'}</div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button 
                    className="header-action-btn" 
                    onClick={startVideoCall} 
                    title="Start video call"
                  >
                    <Video size={20} />
                  </button>
                  <button 
                    className="header-action-btn" 
                    onClick={startVoiceCall} 
                    title="Voice call"
                  >
                    <Phone size={20} />
                  </button>
                  <button className="header-action-btn" title="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">👋</div>
                    <div>No messages yet. Say hello!</div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const showDate = index === 0 || 
                        new Date(messages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
                      
                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="message-date-divider">
                              {new Date(msg.created_at).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          )}
                          <div className={`message-bubble ${msg.is_mine ? 'mine' : 'theirs'}`}>
                            {!msg.is_mine && (
                              <div className="message-sender">{msg.sender_name}</div>
                            )}
                            <div className="message-content">
                              {msg.content}
                            </div>
                            <div className="message-meta">
                              <span className="message-time">{formatTime(msg.created_at)}</span>
                              {msg.is_mine && (
                                <span className="message-status">
                                  {msg.is_read ? <CheckCheck size={14} /> : <Check size={14} />}
                                </span>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="input-area">
                {selectedFile && (
                  <div className="file-preview">
                    <File size={16} />
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    <button 
                      className="file-remove"
                      onClick={() => setSelectedFile(null)}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSend} className="input-form">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={sending}
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    title="Emoji"
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={(!newMessage.trim() && !selectedFile) || sending}
                  >
                    {sending ? (
                      <div className="sending-spinner"></div>
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesModern;
