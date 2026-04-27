/**
 * Modern Messages Page - Upwork-Inspired
 * Features: Video calls, file sharing, clean professional UI
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, Phone, Paperclip, Send, Search, MoreVertical, 
  Smile, Image as ImageIcon, File, X, Download, Check, CheckCheck 
} from 'lucide-react';
import Header from '../../components/common/Header';
import VideoCallModal from '../../components/chat/VideoCallModal';
import messageService from '../../services/messageService';
import webrtcService from '../../services/webrtcService';
import './MessagesModern.css';

const MessagesModern = () => {
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
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
    initializeWebRTC();
    
    return () => {
      // Cleanup WebRTC on unmount
      webrtcService.disconnect();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      await webrtcService.connectSignaling();
      
      // Handle incoming calls
      webrtcService.onCallInvite = (data) => {
        setOtherUserId(data.caller_id);
        setOtherName(data.caller_name);
        setIsVideoCall(data.call_type === 'video');
        setIsIncomingCall(true);
        setIsCallModalOpen(true);
      };
      
      // Handle call acceptance
      webrtcService.onCallAccept = (data) => {
        console.log('Call accepted by:', data.accepter_name);
      };
      
      // Handle call rejection
      webrtcService.onCallReject = () => {
        alert('Call was rejected');
        setIsCallModalOpen(false);
      };
      
      // Handle call end
      webrtcService.onCallEnd = () => {
        setIsCallModalOpen(false);
      };
    } catch (error) {
      console.error('WebRTC initialization error:', error);
    }
  };

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
      setOtherUserId(res.data.other_user_id); // Assuming API returns this
      setInternshipTitle(res.data.internship_title);
      setConversations(prev =>
        prev.map(c => c.assignment_id === assignmentId ? { ...c, unread_count: 0 } : c)
      );
    }
  }, []);

  // Poll for new messages
  useEffect(() => {
    if (!activeAssignment) return;
    pollRef.current = setInterval(async () => {
      const res = await messageService.getMessages(activeAssignment);
      if (res.success) setMessages(res.data.messages);
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
    if (!activeAssignment || !otherUserId) return;
    setIsVideoCall(true);
    setIsIncomingCall(false);
    setIsCallModalOpen(true);
  };

  // Start voice call
  const startVoiceCall = () => {
    if (!activeAssignment || !otherUserId) return;
    setIsVideoCall(false);
    setIsIncomingCall(false);
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
    
    setIsIncomingCall(false);
    setIncomingCallData(null);
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
  const filteredConversations = conversations.filter(c =>
    c.other_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.internship_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false);
          setIsIncomingCall(false);
        }}
        otherUserName={otherName}
        otherUserId={otherUserId}
        isVideoCall={isVideoCall}
        onCallEnd={handleCallEnd}
        isIncoming={isIncomingCall}
        onAccept={() => setIsIncomingCall(false)}
        onReject={() => setIsCallModalOpen(false)}
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
            ) : filteredConversations.map(c => (
              <div
                key={c.assignment_id}
                className={`conversation-item ${activeAssignment === c.assignment_id ? 'active' : ''}`}
                onClick={() => openConversation(c.assignment_id)}
              >
                <div className="conversation-avatar">
                  {c.other_name.charAt(0).toUpperCase()}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">{c.other_name}</span>
                    <span className="conversation-time">{formatTime(c.last_message_at)}</span>
                  </div>
                  <div className="conversation-subtitle">{c.internship_title}</div>
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
            ))}
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
                    {otherName.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{otherName}</div>
                    <div className="chat-subtitle">{internshipTitle}</div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="header-action-btn" onClick={startVideoCall} title="Start video call">
                    <Video size={20} />
                  </button>
                  <button className="header-action-btn" onClick={startVoiceCall} title="Voice call">
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
