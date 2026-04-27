/**
 * Video Call Modal Component
 * Real-time video/audio calling using WebRTC
 */
import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Phone, PhoneIncoming } from 'lucide-react';
import webrtcService from '../../services/webrtcService';
import './VideoCallModal.css';

const VideoCallModal = ({ 
  isOpen, 
  onClose, 
  otherUserName,
  otherUserId,
  isVideoCall = true,
  onCallEnd,
  isIncoming = false,
  onAccept,
  onReject
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connecting');
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Initialize call when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initializeCall = async () => {
      try {
        // Set up WebRTC event handlers
        webrtcService.onRemoteStream = (stream) => {
          console.log('Remote stream received');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setCallStatus('connected');
          startDurationTimer();
        };

        webrtcService.onConnectionStateChange = (state) => {
          console.log('Connection state:', state);
          if (state === 'connected') {
            setCallStatus('connected');
            if (!callStartTimeRef.current) {
              startDurationTimer();
            }
          } else if (state === 'disconnected' || state === 'failed') {
            handleEndCall();
          }
        };

        // If outgoing call, start it
        if (!isIncoming) {
          await webrtcService.startCall(otherUserId, isVideoCall);
          
          // Get local stream and display it
          const localStream = webrtcService.localStream;
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
        }

      } catch (error) {
        console.error('Error initializing call:', error);
        alert('Could not access camera/microphone. Please check permissions.');
        onClose();
      }
    };

    initializeCall();

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isOpen, isIncoming, otherUserId, isVideoCall]);

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

  // Handle accept incoming call
  const handleAcceptCall = async () => {
    try {
      await webrtcService.acceptCall(otherUserId, isVideoCall);
      
      // Get local stream and display it
      const localStream = webrtcService.localStream;
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      
      setCallStatus('connecting');
      
      if (onAccept) {
        onAccept();
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Could not access camera/microphone.');
      handleRejectCall();
    }
  };

  // Handle reject incoming call
  const handleRejectCall = () => {
    webrtcService.rejectCall(otherUserId);
    if (onReject) {
      onReject();
    }
    onClose();
  };

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    webrtcService.toggleAudio(!newMutedState);
    setIsMuted(newMutedState);
  };

  // Toggle video
  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    webrtcService.toggleVideo(newVideoState);
    setIsVideoEnabled(newVideoState);
  };

  // End call
  const handleEndCall = () => {
    setCallStatus('ended');
    webrtcService.endCall();
    
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
              {callStatus === 'incoming' && 'Incoming call...'}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'connected' && formatDuration(callDuration)}
              {callStatus === 'ended' && 'Call Ended'}
            </div>
          </div>
          <button className="close-btn" onClick={handleEndCall}>
            <X size={24} />
          </button>
        </div>

        {/* Video Area */}
        <div className="video-container">
          {/* Remote Video (Main) */}
          <div className="remote-video-wrapper">
            {callStatus === 'incoming' ? (
              <div className="incoming-call-state">
                <div className="avatar-large">
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
                <div className="incoming-text">{otherUserName} is calling...</div>
                <div className="call-type-badge">
                  {isVideoCall ? '📹 Video Call' : '📞 Voice Call'}
                </div>
              </div>
            ) : callStatus === 'connecting' ? (
              <div className="connecting-state">
                <div className="avatar-large">
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
                <div className="connecting-text">Calling {otherUserName}...</div>
                <div className="connecting-spinner"></div>
              </div>
            ) : (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />
                <div className="remote-video-placeholder">
                  <div className="avatar-large">
                    {otherUserName.charAt(0).toUpperCase()}
                  </div>
                  <div className="placeholder-text">{otherUserName}</div>
                </div>
              </>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {isVideoCall && callStatus !== 'incoming' && (
            <div className="local-video-wrapper">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`local-video ${!isVideoEnabled ? 'video-disabled' : ''}`}
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
          {callStatus === 'incoming' ? (
            <>
              <button
                className="control-btn reject-btn"
                onClick={handleRejectCall}
                title="Reject call"
              >
                <PhoneOff size={28} />
              </button>
              <button
                className="control-btn accept-btn"
                onClick={handleAcceptCall}
                title="Accept call"
              >
                <Phone size={28} />
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
