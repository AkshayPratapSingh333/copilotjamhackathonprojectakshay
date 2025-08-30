export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to signaling server
        this.sendSignal({ type: 'candidate', candidate: event.candidate });
      }
    };

    this.peerConnection.ontrack = (event) => {
      // Handle incoming audio track
      const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
      if (audioElement && event.streams[0]) {
        audioElement.srcObject = event.streams[0];
      }
    };
  }

  async startLocalStream(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');
    
    // Add local stream to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Create data channel for expression data
    this.dataChannel = this.peerConnection.createDataChannel('expressionData');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onmessage = (event) => {
      try {
        const expressionData = JSON.parse(event.data);
        this.handleExpressionData(expressionData);
      } catch (error) {
        console.error('Error parsing expression data:', error);
      }
    };

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
    };
  }

  private handleExpressionData(data: any) {
    // Dispatch custom event for expression updates
    document.dispatchEvent(new CustomEvent('expressionUpdate', { detail: data }));
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');
    await this.peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');
    await this.peerConnection.addIceCandidate(candidate);
  }

  private sendSignal(data: any) {
    // Implement signaling with your backend (WebSocket or HTTP)
    fetch('/api/webrtc/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  close() {
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }
}