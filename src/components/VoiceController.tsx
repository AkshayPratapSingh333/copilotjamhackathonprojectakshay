'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceControllerProps {
  onVoiceInput: (text: string) => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  isAISpeaking: boolean;
}

export default function VoiceController({
  onVoiceInput,
  onSpeechStart,
  onSpeechEnd,
  isAISpeaking,
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for Web Speech API support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechSynthesis = window.speechSynthesis;
      
      if (SpeechRecognition && speechSynthesis) {
        setIsSupported(true);
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        synthRef.current = speechSynthesis;
      }
    }
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string, gender: 'male' | 'female' = 'female') => {
    if (synthRef.current && voiceEnabled) {
      // Cancel any ongoing speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find appropriate voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (gender === 'female' ? voice.name.toLowerCase().includes('female') : voice.name.toLowerCase().includes('male'))
      ) || voices.find(voice => voice.lang.includes('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = gender === 'female' ? 1.2 : 0.8;
      utterance.volume = 0.8;

      utterance.onstart = onSpeechStart;
      utterance.onend = onSpeechEnd;

      synthRef.current.speak(utterance);
    }
  };

  // Expose speak function for parent components
  useEffect(() => {
    (window as any).avatarSpeak = speak;
  }, []);

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700">
          Speech recognition is not supported in this browser. 
          Please use Chrome, Edge, or Safari for voice features.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={isAISpeaking}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className={`transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
            : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 mr-2" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Start Voice
          </>
        )}
      </Button>

      <Button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        variant="outline"
        size="lg"
        className={`transition-all duration-300 ${
          voiceEnabled 
            ? 'border-blue-500 text-blue-500 hover:bg-blue-50' 
            : 'border-gray-500 text-gray-500 hover:bg-gray-50'
        }`}
      >
        {voiceEnabled ? (
          <>
            <Volume2 className="w-5 h-5 mr-2" />
            Voice On
          </>
        ) : (
          <>
            <VolumeX className="w-5 h-5 mr-2" />
            Voice Off
          </>
        )}
      </Button>

      {isListening && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-medium">Listening...</span>
        </div>
      )}

      {isAISpeaking && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-white font-medium">Speaking...</span>
        </div>
      )}
    </div>
  );
}