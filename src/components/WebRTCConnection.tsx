'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Phone, PhoneOff } from 'lucide-react';

interface WebRTCConnectionProps {
  onConnectionStateChange: (connected: boolean) => void;
}

export default function WebRTCConnection({ onConnectionStateChange }: WebRTCConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream]);

  const initializeWebRTC = async () => {
    try {
      // Get user media (audio/video)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoEnabled,
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const connected = peerConnection.connectionState === 'connected';
        setIsConnected(connected);
        onConnectionStateChange(connected);
      };

      // Handle incoming streams
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
      };

      console.log('WebRTC initialized successfully');
      
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
    }
  };

  const toggleConnection = async () => {
    if (!isConnected) {
      await initializeWebRTC();
    } else {
      // Disconnect
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setIsConnected(false);
      onConnectionStateChange(false);
    }
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
      <h3 className="text-lg font-semibold text-white">Real-Time Connection</h3>
      
      {isVideoEnabled && localStream && (
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-40 bg-black rounded-lg object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            You
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={toggleConnection}
          variant={isConnected ? "destructive" : "default"}
          className={`flex-1 transition-all duration-300 ${
            isConnected 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
              : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
          }`}
        >
          {isConnected ? (
            <>
              <PhoneOff className="w-4 h-4 mr-2" />
              Disconnect
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 mr-2" />
              Connect
            </>
          )}
        </Button>

        <Button
          onClick={toggleVideo}
          variant="outline"
          size="icon"
          className={`transition-all duration-300 ${
            isVideoEnabled 
              ? 'border-blue-500 text-blue-500 hover:bg-blue-50' 
              : 'border-gray-500 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {isVideoEnabled ? (
            <Video className="w-4 h-4" />
          ) : (
            <VideoOff className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="text-xs text-white/70 text-center">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
}