'use client';

import { useState, useEffect, useRef } from 'react';
import Avatar from '@/components/Avatar';
import { WebRTCManager } from '@/lib/webrtc';
import { SpeechProcessor } from '@/lib/speech';

export default function Home() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('female');
  const [isLoading, setIsLoading] = useState(false);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const speechRef = useRef<SpeechProcessor | null>(null);

  useEffect(() => {
    // Initialize WebRTC and speech processors
    webrtcRef.current = new WebRTCManager();
    speechRef.current = new SpeechProcessor();

    // Start local stream
    webrtcRef.current.startLocalStream().catch(console.error);

    // Set up event listeners
    const handleUserSpeech = async (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      await processUserMessage(customEvent.detail);
    };

    document.addEventListener('userSpeech', handleUserSpeech);

    return () => {
      document.removeEventListener('userSpeech', handleUserSpeech);
      webrtcRef.current?.close();
    };
  }, []);

  const processUserMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          userId: 'anonymous'
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      
      // Speak the response
      if (speechRef.current) {
        speechRef.current.speak(data.response);
      }

      // Send expression data via WebRTC data channel
      if (webrtcRef.current) {
        // Expression data will be sent through the established data channel
      }

    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble processing your request right now." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    await processUserMessage(inputText);
    setInputText('');
  };

  const toggleListening = () => {
    if (!speechRef.current) return;

    if (isListening) {
      speechRef.current.stopListening();
      setIsListening(false);
    } else {
      speechRef.current.startListening();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">AI Virtual Human</h1>
        <p className="text-sm">Powered by Next.js, WebRTC, and Gemini AI</p>
      </header>
      
      <div className="flex flex-1 p-4 gap-4">
        {/* 3D Avatar Panel */}
        <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">3D Avatar</h2>
          <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center">
            <Avatar 
              gender={avatarGender}
              modelUrl={
                avatarGender === 'male' 
                  ? '/models/male_avatar.glb' 
                  : '/models/female_avatar.glb'
              }
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setAvatarGender('male')}
              className={`px-4 py-2 rounded ${
                avatarGender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Male Avatar
            </button>
            <button
              onClick={() => setAvatarGender('female')}
              className={`px-4 py-2 rounded ${
                avatarGender === 'female' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              Female Avatar
            </button>
          </div>
        </div>
        
        {/* Chat Panel */}
        <div className="w-1/2 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Conversation</h2>
          
          <div className="flex-1 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Start a conversation by typing or clicking the microphone</p>
                <p className="text-sm mt-2">This demo uses free Web Speech API</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 border border-gray-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2 ${
                isListening ? 'bg-red-500' : 'bg-gray-300'
              } text-white`}
            >
              {isListening ? '🛑' : '🎤'}
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading || !inputText.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <p>Built with Next.js, WebRTC, Web Speech API, Three.js, and Google Gemini</p>
        <p>Uses free models and services - no authentication required for basic functionality</p>
      </footer>
    </div>
  );
}