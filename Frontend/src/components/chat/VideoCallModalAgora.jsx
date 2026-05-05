/**
 * Video Call Modal Component - Agora Version
 * Real-time video/audio calling using Agora
 */
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';
import agoraService from '../../services/agoraService';
import apiService from '../../services/api';
import './VideoCallModal.css';

const VideoCallModalAgora = ({ 
  isOpen, 
  onClose, 
  otherUserName,
  otherUserId,
  assignmentId,
  isVideoCall = true,
  onCallEnd
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Initialize call when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initializeCall = async () => {
      try {
        setCallStatus('connecting');
        setError(null);
        
        console.log('🚀 Initializing Agora call...');
        console.log('  Assignment ID:', assignmentId);
        console.log('  Other User ID:', otherUserId);
        console.log('  Video Call:', isVideoCall);
        
        // Initialize Agora
        await agoraService.initialize();
        
        // Get Agora token from backend
        const channelName = `assignment_${assignmentId}`;
        console.log('📞 Getting Agora token for channel:', channelName);
        
        const tokenResponse = await apiService.post('/messages/agora/token/', {
          channelName: channelName,
          uid: 0  // Auto-assign UID
        });
        
        // Token can be null if certificate is disabled in Agora console
        if (tokenResponse.token === undefined) {
          throw new Error('Failed to get Agora token from backend');
        }
        
        if (tokenResponse.token) {
          console.log('✅ Got Agora token (with certificate)');
        } else {
          console.log('✅ Got response (no certificate mode)');
        }
        
        // 1. Set up remote user handlers BEFORE joining
        agoraService.onUserPublished = async (user, mediaType) => {
          console.log('👤 Remote user published:', user.uid, mediaType);
          
          // Wait a tiny bit for React to render if it just switched to connected
          setTimeout(() => {
            if (mediaType === 'video' && remoteVideoRef.current) {
              user.videoTrack.play(remoteVideoRef.current);
              console.log('✅ Remote video playing');
            }
            
            if (mediaType === 'audio') {
              user.audioTrack.play();
              console.log('✅ Remote audio playing');
            }
            
            setCallStatus('connected');
            startDurationTimer();
          }, 100);
        };
        
        agoraService.onUserLeft = (user) => {
          console.log('👤 Remote user left:', user.uid);
          handleEndCall();
        };

        // 2. Join channel
        console.log('📞 Joining Agora channel...');
        const uid = await agoraService.joinChannel(
          channelName,
          tokenResponse.token,
          tokenResponse.uid
        );
        console.log('✅ Joined channel with UID:', uid);
        
        // 3. Create and publish local tracks
        console.log('🎥 Creating local tracks...');
        const { audioTrack, videoTrack } = await agoraService.createAndPublishTracks(
          isVideoCall,
          true  // Always enable audio
        );
        
        // Play local video
        if (videoTrack && localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
          console.log('✅ Local video playing');
        }
        
        // Notify other user about the call
        console.log('📢 Notifying other user...');
        await apiService.post('/messages/agora/notify/', {
          targetUserId: otherUserId,
          channelName: channelName,
          callType: isVideoCall ? 'video' : 'audio'
        });
        
        // Also send an automated message to the chat so they can see the call request
        await apiService.post('/messages/send/', {
          assignment_id: assignmentId,
          content: `📞 Started a ${isVideoCall ? 'video' : 'voice'} call. Please click the ${isVideoCall ? 'video' : 'phone'} icon at the top right of the chat to join!`
        });
        
        // Only set to calling if we haven't already connected to a remote user
        setCallStatus(prev => prev === 'connected' ? 'connected' : 'calling');
        console.log('✅ Call initialized successfully');
        
      } catch (error) {
        console.error('❌ Error initializing call:', error);
        setError(error.message || 'Failed to initialize call');
        setCallStatus('error');
      }
    };

    initializeCall();

    return () => {
      // Cleanup on unmount
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      agoraService.leaveChannel();
    };
  }, [isOpen, assignmentId, otherUserId, isVideoCall]);

  // Start duration timer
  const startDurationTimer = () => {
    if (!callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  };

  // Toggle mute
  const toggleMute = async () => {
    const newMutedState = !isMuted;
    await agoraService.toggleAudio(!newMutedState);
    setIsMuted(newMutedState);
  };

  // Toggle video
  const toggleVideo = async () => {
    const newVideoState = !isVideoEnabled;
    await agoraService.toggleVideo(newVideoState);
    setIsVideoEnabled(newVideoState);
  };

  // End call
  const handleEndCall = async () => {
    setCallStatus('ended');
    await agoraService.leaveChannel();
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    if (onCallEnd) {
      onCallEnd(callDuration);
    }
    onClose();
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="video-call-overlay">
      <div className="video-call-modal">
        {/* Header */}
        <div className="call-header">
          <div className="call-info">
            <div className="caller-name">{otherUserName}</div>
            <div className="call-status-text">
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'connected' && formatDuration(callDuration)}
              {callStatus === 'ended' && 'Call Ended'}
              {callStatus === 'error' && 'Error'}
            </div>
          </div>
          <button className="close-btn" onClick={handleEndCall}>
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="call-error">
            <div className="error-icon">⚠️</div>
            <div className="error-message">{error}</div>
          </div>
        )}

        {/* Video Area */}
        <div className="video-container">
          {/* Remote Video (Main) */}
          <div className="remote-video-wrapper">
            {/* Always render the video div so Agora has a valid element to attach to */}
            <div 
              ref={remoteVideoRef} 
              className="remote-video"
              style={{ width: '100%', height: '100%', display: callStatus === 'connected' ? 'block' : 'none' }}
            />
            
            {callStatus === 'calling' && (
              <div className="connecting-state">
                <div className="avatar-large">
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
                <div className="connecting-text">Calling {otherUserName}...</div>
                <div className="connecting-spinner"></div>
              </div>
            )}
            
            {callStatus === 'connected' && !isVideoCall && (
              <div className="remote-video-placeholder">
                <div className="avatar-large">
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
                <div className="placeholder-text">{otherUserName}</div>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {isVideoCall && (
            <div className="local-video-wrapper">
              <div 
                ref={localVideoRef}
                className={`local-video ${!isVideoEnabled ? 'video-disabled' : ''}`}
                style={{ width: '100%', height: '100%' }}
              />
              {!isVideoEnabled && (
                <div className="local-video-disabled">
                  <VideoOff size={24} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="call-controls">
          <button
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {isVideoCall && (
            <button
              className={`control-btn ${!isVideoEnabled ? 'active' : ''}`}
              onClick={toggleVideo}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          )}

          <button
            className="control-btn end-call-btn"
            onClick={handleEndCall}
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModalAgora;
