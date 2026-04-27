/**
 * WebRTC Service for Real-Time Video/Audio Calling
 * Handles peer-to-peer connections and signaling
 */

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.websocket = null;
    this.isInitiator = false;
    this.targetUserId = null;
    
    // ICE servers (STUN/TURN)
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    };
    
    // Event callbacks
    this.onRemoteStream = null;
    this.onCallInvite = null;
    this.onCallAccept = null;
    this.onCallReject = null;
    this.onCallEnd = null;
    this.onConnectionStateChange = null;
  }

  /**
   * Connect to WebSocket signaling server
   */
  connectSignaling() {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('token');
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/call/?token=${token}`;
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
      
      this.websocket.onmessage = (event) => {
        this.handleSignalingMessage(JSON.parse(event.data));
      };
      
      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  }

  /**
   * Handle incoming signaling messages
   */
  handleSignalingMessage(data) {
    console.log('Signaling message:', data);
    
    switch (data.type) {
      case 'connection_established':
        console.log('Connection established');
        break;
        
      case 'call_invite':
        if (this.onCallInvite) {
          this.onCallInvite(data);
        }
        break;
        
      case 'call_accept':
        if (this.onCallAccept) {
          this.onCallAccept(data);
        }
        this.createOffer();
        break;
        
      case 'call_reject':
        if (this.onCallReject) {
          this.onCallReject(data);
        }
        break;
        
      case 'call_end':
        if (this.onCallEnd) {
          this.onCallEnd(data);
        }
        this.cleanup();
        break;
        
      case 'webrtc_offer':
        this.handleOffer(data.offer);
        break;
        
      case 'webrtc_answer':
        this.handleAnswer(data.answer);
        break;
        
      case 'ice_candidate':
        this.handleIceCandidate(data.candidate);
        break;
    }
  }

  /**
   * Initialize local media stream
   */
  async initializeMedia(isVideoCall = true) {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: isVideoCall ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.iceServers);
    
    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      this.remoteStream.addTrack(event.track);
      
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice_candidate',
          target_user_id: this.targetUserId,
          candidate: event.candidate
        });
      }
    };
    
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };
    
    return this.peerConnection;
  }

  /**
   * Start a call (caller side)
   */
  async startCall(targetUserId, isVideoCall = true) {
    this.targetUserId = targetUserId;
    this.isInitiator = true;
    
    // Initialize media
    await this.initializeMedia(isVideoCall);
    
    // Send call invitation
    this.sendSignalingMessage({
      type: 'call_invite',
      target_user_id: targetUserId,
      call_type: isVideoCall ? 'video' : 'audio',
      timestamp: Date.now()
    });
  }

  /**
   * Accept incoming call (receiver side)
   */
  async acceptCall(callerId, isVideoCall = true) {
    this.targetUserId = callerId;
    this.isInitiator = false;
    
    // Initialize media
    await this.initializeMedia(isVideoCall);
    
    // Create peer connection
    this.createPeerConnection();
    
    // Send acceptance
    this.sendSignalingMessage({
      type: 'call_accept',
      caller_id: callerId
    });
  }

  /**
   * Reject incoming call
   */
  rejectCall(callerId) {
    this.sendSignalingMessage({
      type: 'call_reject',
      caller_id: callerId
    });
  }

  /**
   * End call
   */
  endCall() {
    if (this.targetUserId) {
      this.sendSignalingMessage({
        type: 'call_end',
        target_user_id: this.targetUserId
      });
    }
    this.cleanup();
  }

  /**
   * Create WebRTC offer
   */
  async createOffer() {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'webrtc_offer',
        target_user_id: this.targetUserId,
        offer: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  /**
   * Handle WebRTC offer
   */
  async handleOffer(offer) {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'webrtc_answer',
        target_user_id: this.targetUserId,
        answer: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle WebRTC answer
   */
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(candidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Send signaling message via WebSocket
   */
  sendSignalingMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Reset remote stream
    this.remoteStream = null;
    this.targetUserId = null;
    this.isInitiator = false;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.cleanup();
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Export singleton instance
const webrtcService = new WebRTCService();
export default webrtcService;
