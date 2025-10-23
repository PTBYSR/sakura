'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Clock } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  processingTime?: number;
}

interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  processing_time: number;
}

interface UserData {
  name: string;
  email: string;
  ip: string;
  location: {
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  device: {
    userAgent: string;
    platform: string;
    language: string;
  };
  timestamp: string;
  lastSeen: string;
  totalVisits: number;
  chatId: string;
  vibe: string;
  visitDuration: number;
  category: string;
  status: string;
}

interface UserDataResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = 'http://localhost:8000';

export default function ChatPage() {
  const [stage, setStage] = useState<'form' | 'chat'>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visitStartTime = useRef<number>(Date.now());

  // Load saved state only on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStage = localStorage.getItem("stage") as 'form' | 'chat';
      if (savedStage) setStage(savedStage);

      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);

      // Track visits
      const visits = parseInt(localStorage.getItem('totalVisits') || '0', 10) + 1;
      localStorage.setItem('totalVisits', visits.toString());
    }
  }, []);

  // Persist stage changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stage", stage);
    }
  }, [stage]);


  // Load messages on mount
useEffect(() => {
  if (typeof window !== "undefined") {
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }
}, []);

// Persist messages whenever they change
useEffect(() => {
  if (typeof window !== "undefined") {
    localStorage.setItem("messages", JSON.stringify(messages));
  }
}, [messages]);




  // Init checks
  useEffect(() => {
    checkApiHealth();
    generateSessionId();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateSessionId = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log('🆔 Generated session ID:', newSessionId);
  };

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      setApiStatus(response.ok ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const collectUserMetadata = async (): Promise<UserData> => {
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      const locationData = await locationResponse.json();

      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;

      const totalVisits = parseInt(localStorage.getItem('totalVisits') || '1', 10);
      const visitDuration = Math.floor((Date.now() - visitStartTime.current) / 1000);

      return {
        name,
        email,
        ip,
        location: {
          city: locationData.city || 'Unknown',
          region: locationData.region || 'Unknown',
          country: locationData.country_name || 'Unknown',
          timezone: locationData.taimezone || 'Unknown',
        },
        device: { userAgent, platform, language },
        timestamp: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalVisits,
        chatId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        vibe: "neutral",
        visitDuration,
        category: "agent-inbox",
        status: "active"
      };
    } catch (error) {
      console.error('Error collecting metadata:', error);
      return {
        name,
        email,
        ip: 'Unknown',
        location: { city: 'Unknown', region: 'Unknown', country: 'Unknown', timezone: 'Unknown' },
        device: { userAgent: navigator.userAgent, platform: navigator.platform, language: navigator.language },
        timestamp: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalVisits: parseInt(localStorage.getItem('totalVisits') || '1', 10),
        chatId: `chat_${Date.now()}`,
        vibe: "neutral",
        visitDuration: Math.floor((Date.now() - visitStartTime.current) / 1000),
        category: "agent-inbox",
        status: "active"
      };
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const userData = await collectUserMetadata();

      console.log("🧠 Sending user data to backend:", userData);


      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error(`Failed to save user data: ${response.status}`);

      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("stage", "chat");

      const result: UserDataResponse = await response.json();
      console.log('User data saved:', result);

      setStage('chat');
    } catch (error) {
      console.error('Error saving user data:', error);
      setStage('chat'); // fallback
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    localStorage.setItem("lastSeen", new Date().toISOString());

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');



    try {

      const payload = {
        message: userMessage.content,
        session_id: sessionId,
        name,
        email,
      };
      
      console.log("💬 Sending chat payload to backend:", payload);
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          name,
          email,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const chatResponse: ChatResponse = await response.json();
      console.log("✅ Response from backend:", chatResponse);


      let cleanResponse = chatResponse.response;

      // Example filter: remove system/meta markers
      cleanResponse = cleanResponse
        .split("\n")
        .filter(line =>
          !line.startsWith("▶") &&   // remove AOP start
          !line.startsWith("➡️") &&  // remove step markers
          !line.startsWith("⏸") &&  // remove pause markers
          !line.startsWith("💬 Agent:") // remove redundant agent prefix
        )
        .join("\n")
        .trim();
      
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        content: chatResponse.response,
        role: 'assistant',
        timestamp: chatResponse.timestamp,
        processingTime: chatResponse.processing_time,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error sending message');
      setMessages(prev => [
        ...prev,
        { id: `error_${Date.now()}`, content: 'Sorry, something went wrong.', role: 'assistant', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    generateSessionId();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ================== RENDER ==================
  if (stage === 'form') {
    return (
      <div className="flex flex-col h-screen bg-white shadow-lg">
        <header className="bg-blue-600 text-white p-4">Welcome</header>
        <form onSubmit={handleFormSubmit} className="flex flex-col p-6 space-y-3 flex-1 justify-center max-w-md mx-auto w-full">
          <h2 className="text-lg font-semibold text-gray-700 text-center">Let’s get started</h2>
          <input className="border p-3 rounded" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
          <input className="border p-3 rounded" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" />
          <button type="submit" className="bg-blue-600 text-white rounded py-2 mt-2 hover:bg-blue-700">
            Start Chat
          </button>
        </form>
      </div>
    );
  }

  // Chat stage
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-800">Heirs Support</h1>
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-600">
                  {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={clearChat} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md">
              Clear Chat
            </button>
            <div className="text-xs text-gray-500">Session: {sessionId.split('_')[1]}</div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 px-6 py-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow-sm border border-gray-200'}`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className={`text-xs mt-2 flex items-center space-x-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                <Clock className="w-3 h-3" />
                <span>{formatTime(message.timestamp)}</span>
                {message.processingTime && <span>• {message.processingTime.toFixed(2)}s</span>}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white text-gray-800 shadow-sm border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center gap-5 border-2 border-black rounded-full pl-5 pr-1 py-1">
            <textarea
              onFocus={(e) => {console.log("focus: " + e)}}
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me anything, ${name}...`}
              className="text-black w-full px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={1}
              disabled={isLoading || apiStatus === 'offline'}
              style={{ minHeight: '', maxHeight: '120px' }}
            />
         
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || apiStatus === 'offline'}
            className="border border-black text-white p-2 rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 "
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-gray-500" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">Press Enter to send • Shift + Enter for new line</div>
      </div>
    </div>
  );
}
