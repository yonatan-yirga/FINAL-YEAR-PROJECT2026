/**
 * Agora Video/Audio Calling Service
 * Handles all Agora RTC functionality
 */
import AgoraRTC from 'agora-rtc-sdk-ng';

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
    
    // Agora App ID
    this.appId = '19fa6bc3e79140d596e36afda2045b97';
    
    // Event callbacks
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onUserPublished = null;
    this.onUserUnpublished = null;
    this.onConnectionStateChange = null;
  }

  /**
   * Initialize Agora client
   */
  async initialize() {
    console.log('🚀 Initializing Agora client...');
    
    // Create Agora client
    this.client = AgoraRTC.createClient({
      mode: 'rtc',
      codec: 'vp8'
    });
    
    // Set up event listeners
    this.client.on('user-published', async (user, mediaType) => {
      console.log('👤 User published:', user.uid, mediaType);
      
      // Subscribe to remote user
      await this.client.subscribe(user, mediaType);
      console.log('✅ Subscribed to user:', user.uid);
      
      // Store remote user
      this.remoteUsers[user.uid] = user;
      
      if (this.onUserPublished) {
        this.onUserPublished(user, mediaType);
      }
    });
    
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('👤 User unpublished:', user.uid, mediaType);
      
      if (this.onUserUnpublished) {
        this.onUserUnpublished(user, mediaType);
      }
    });
    
    this.client.on('user-joined', (user) => {
      console.log('👤 User joined:', user.uid);
      this.remoteUsers[user.uid] = user;
      
      if (this.onUserJoined) {
        this.onUserJoined(user);
      }
    });
    
    this.client.on('user-left', (user) => {
      console.log('👤 User left:', user.uid);
      delete this.remoteUsers[user.uid];
      
      if (this.onUserLeft) {
        this.onUserLeft(user);
      }
    });
    
    this.client.on('connection-state-change', (curState, prevState) => {
      console.log('🔌 Connection state changed:', prevState, '->', curState);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(curState, prevState);
      }
    });
    
    console.log('✅ Agora client initialized');
  }

  /**
   * Join a channel
   * @param {string} channelName - Channel name (e.g., "assignment_123")
   * @param {string} token - Agora token from backend (can be null if certificate disabled)
   * @param {number} uid - User ID (0 for auto-assign)
   */
  async joinChannel(channelName, token, uid = 0) {
    console.log('📞 Joining channel:', channelName);
    console.log('   Token:', token ? token.substring(0, 20) + '...' : 'null (no certificate)');
    
    if (!this.client) {
      await this.initialize();
    }
    
    try {
      // Join the channel
      // If token is null, Agora will work in "no certificate" mode
      const assignedUid = await this.client.join(
        this.appId,
        channelName,
        token,  // Can be null if certificate is disabled in Agora console
        uid
      );
      
      console.log('✅ Joined channel successfully! UID:', assignedUid);
      return assignedUid;
    } catch (error) {
      console.error('❌ Failed to join channel:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      throw error;
    }
  }

  /**
   * Create and publish local tracks
   * @param {boolean} video - Enable video
   * @param {boolean} audio - Enable audio
   */
  async createAndPublishTracks(video = true, audio = true) {
    console.log('🎥 Creating local tracks...', { video, audio });
    
    try {
      // First, try to close any existing tracks to release devices
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      
      // Wait a bit for devices to be released
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create audio track
      if (audio) {
        try {
          this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: 'music_standard',
          });
          console.log('✅ Audio track created');
        } catch (audioError) {
          console.error('❌ Failed to create audio track:', audioError);
          
          // Handle specific error codes
          if (audioError.code === 'NOT_READABLE' || audioError.message.includes('Device in use')) {
            throw new Error('DEVICE_IN_USE: Your microphone is being used by another application. Please close other apps using your microphone and try again.');
          } else if (audioError.code === 'PERMISSION_DENIED') {
            throw new Error('PERMISSION_DENIED: Microphone access denied. Please allow microphone access in your browser settings.');
          } else {
            throw new Error(`AUDIO_ERROR: ${audioError.message || 'Failed to access microphone'}`);
          }
        }
      }
      
      // Create video track
      if (video) {
        try {
          this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: '720p_2',
          });
          console.log('✅ Video track created');
        } catch (videoError) {
          console.error('❌ Failed to create video track:', videoError);
          
          // Handle specific error codes
          if (videoError.code === 'NOT_READABLE' || videoError.message.includes('Device in use')) {
            throw new Error('DEVICE_IN_USE: Your camera is being used by another application. Please close other apps using your camera and try again.');
          } else if (videoError.code === 'PERMISSION_DENIED') {
            throw new Error('PERMISSION_DENIED: Camera access denied. Please allow camera access in your browser settings.');
          } else {
            throw new Error(`VIDEO_ERROR: ${videoError.message || 'Failed to access camera'}`);
          }
        }
      }
      
      // Publish tracks
      const tracks = [];
      if (this.localAudioTrack) tracks.push(this.localAudioTrack);
      if (this.localVideoTrack) tracks.push(this.localVideoTrack);
      
      if (tracks.length > 0) {
        await this.client.publish(tracks);
        console.log('✅ Tracks published');
      }
      
      return {
        audioTrack: this.localAudioTrack,
        videoTrack: this.localVideoTrack
      };
    } catch (error) {
      console.error('❌ Failed to create/publish tracks:', error);
      
      // Clean up any partially created tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      
      throw error;
    }
  }

  /**
   * Leave channel and cleanup
   */
  async leaveChannel() {
    console.log('👋 Leaving channel...');
    
    try {
      // Close local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
      
      // Leave channel
      if (this.client) {
        await this.client.leave();
        console.log('✅ Left channel');
      }
      
      // Clear remote users
      this.remoteUsers = {};
    } catch (error) {
      console.error('❌ Error leaving channel:', error);
    }
  }

  /**
   * Toggle audio mute
   */
  async toggleAudio(enabled) {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled);
      console.log('🎤 Audio:', enabled ? 'enabled' : 'disabled');
    }
  }

  /**
   * Toggle video
   */
  async toggleVideo(enabled) {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
      console.log('📹 Video:', enabled ? 'enabled' : 'disabled');
    }
  }

  /**
   * Get remote users
   */
  getRemoteUsers() {
    return Object.values(this.remoteUsers);
  }

  /**
   * Play video track in DOM element
   */
  playVideoTrack(track, elementId) {
    if (track) {
      track.play(elementId);
    }
  }

  /**
   * Play audio track
   */
  playAudioTrack(track) {
    if (track) {
      track.play();
    }
  }
}

// Export singleton instance
const agoraService = new AgoraService();
export default agoraService;
