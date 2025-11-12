/**
 * Sakura Chat Widget
 * 
 * A modern, Material UI-based chat widget that provides an AI-powered customer support experience.
 * Features include user registration, real-time chat, typewriter animations, and persistent state management.
 * 
 * @author Sakura Team
 * @version 1.0.0
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'next/navigation';

import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
  Fade,
  CircularProgress,
  Button,
  Backdrop,
} from '@mui/material';
import {
  ArrowBack,
  MoreHoriz,
  Minimize,
  Maximize,
  Close,
  Add,
  EmojiEmotions,
  Send,
  ChatBubble,
  Person,
} from '@mui/icons-material';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents a chat message with metadata
 */
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'agent';
  timestamp: string;
  processingTime?: number;
}

/**
 * Response structure from the chat API
 */
interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  processing_time: number;
}

/**
 * User data structure for analytics and personalization
 */
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

/**
 * Response structure from user data API
 */
interface UserDataResponse {
  success: boolean;
  message: string;
}

interface BackendMessage {
  _id?: string;
  text?: string;
  content?: string;
  role: 'user' | 'assistant' | 'agent';
  timestamp?: string;
}

interface BackendChat {
  chat_id: string;
  messages?: BackendMessage[];
}

interface DebugUser {
  email: string;
  chats?: BackendChat[];
}

interface DebugUsersResponse {
  users?: DebugUser[];
}

interface UserChatsResponse {
  user_name?: string;
  user_email?: string;
  chats?: BackendChat[];
}

type CreateChatRequestBody = {
  user_id?: string;
  name?: string;
  email?: string;
};

type UserDataPayload = UserData & { user_id?: string };

const mapBackendMessage = (msg: BackendMessage): Message => {
  const timestamp = msg.timestamp ?? new Date().toISOString();
  return {
    id: msg._id || `msg_${timestamp}`,
    content: msg.text || msg.content || '',
    role: msg.role === 'user' ? 'user' : msg.role === 'agent' ? 'agent' : 'assistant',
    timestamp,
  };
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * API Base URL Configuration
 * Dynamically switches between local development and production backend URLs
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://sakura-backend.onrender.com");

/**
 * Material UI Theme Configuration
 * Custom dark theme with Sakura brand colors and component overrides
 */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2', // Blue for user messages and primary actions
    },
    secondary: {
      main: '#dc004e', // Red for secondary actions
    },
    background: {
      default: '#1a1a1a', // Dark background for window frame
      paper: '#2d2d2d',   // Slightly lighter for window controls
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Rounded corners for chat area
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 25, // Rounded input fields
          },
        },
      },
    },
  },
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ChatPage Component
 * 
 * Main chat widget component that handles user registration, chat functionality,
 * and real-time communication with the AI backend.
 */
export default function ChatPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const routeUserId = (params as { userId?: string | string[] })?.userId;
  const propUserId =
    (searchParams?.get('userId') as string | null) ??
    (Array.isArray(routeUserId) ? routeUserId[0] : routeUserId) ??
    undefined;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // UI State
  const [stage, setStage] = useState<'form' | 'chat'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // User Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(propUserId || null);

  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visitStartTime = useRef<number>(Date.now());

  // ============================================================================
  // EFFECTS & LIFECYCLE
  // ============================================================================

  /**
   * Clear localStorage chat data - useful for starting fresh
   */
  const clearChatData = useCallback(() => {
    console.log('🧹 Clearing chat data from localStorage');
    localStorage.removeItem("currentChatId");
    localStorage.removeItem("messages");
    localStorage.removeItem("stage");
  }, []);

  const checkCustomerAndLoadChats = useCallback(async (customerEmail: string) => {
    try {
      // First, check if we have a chat ID saved
      const savedChatId = localStorage.getItem("currentChatId");

      // Try to find customer via debug endpoint (returns all users with chats)
      try {
        const debugResponse = await fetch(`${API_BASE_URL}/api/debug/users-chats`);
        if (debugResponse.ok) {
          const debugData: DebugUsersResponse = await debugResponse.json();
          const user = debugData.users?.find((u) => u.email === customerEmail);

          if (user && user.chats && user.chats.length > 0) {
            // Customer exists and has chats - load the most recent one
            const latestChat = user.chats[user.chats.length - 1];
            const chatId = latestChat.chat_id;

            setCurrentChatId(chatId);
            setStage('chat');
            localStorage.setItem("stage", "chat");
            localStorage.setItem("currentChatId", chatId);

            // Load chat messages from backend or localStorage
            if (latestChat.messages && latestChat.messages.length > 0) {
              const chatMessages = latestChat.messages.map(mapBackendMessage);
              setMessages(chatMessages);
              console.log(`✅ Loaded ${chatMessages.length} messages from backend for ${customerEmail}`);
            } else {
              // ⚠️ VALIDATE: Only load localStorage messages if email matches
              const storedEmail = localStorage.getItem("userEmail");
              if (storedEmail === customerEmail) {
                // Check localStorage for unsynced messages
                const savedMessages = localStorage.getItem("messages");
                if (savedMessages) {
                  try {
                    const parsedMessages = JSON.parse(savedMessages) as Message[];
                    if (parsedMessages && parsedMessages.length > 0) {
                      setMessages(parsedMessages);
                      console.log(`✅ Loaded ${parsedMessages.length} messages from localStorage for ${customerEmail}`);
                    }
                  } catch (error) {
                    console.error('Error parsing saved messages:', error);
                    setMessages([]);
                  }
                } else {
                  setMessages([]);
                }
              } else {
                console.log('⚠️ Email mismatch, clearing localStorage messages');
                clearChatData();
                setMessages([]);
              }
            }

            console.log('✅ Loaded existing chat for customer:', customerEmail);
            return;
          }
        }
      } catch (error) {
        console.log('Could not fetch from debug endpoint:', error);
      }

      // ⚠️ VALIDATE: Only use saved chat ID if email matches
      const storedEmail = localStorage.getItem("userEmail");
      if (savedChatId && storedEmail === customerEmail) {
        setCurrentChatId(savedChatId);
        setStage('chat');
        localStorage.setItem("stage", "chat");
        console.log(`✅ Using saved chat ID ${savedChatId} for ${customerEmail}`);
        return;
      } else if (savedChatId && storedEmail !== customerEmail) {
        console.log('⚠️ Saved chat ID belongs to different user, clearing...');
        clearChatData();
      }

      // If no chat found but stage was saved as 'chat', go to chat (chat will be created on first message)
      const savedStage = localStorage.getItem("stage") as 'form' | 'chat';
      if (savedStage === 'chat') {
        setStage('chat');
        console.log('✅ Restored chat stage from localStorage');
      } else {
        setStage('form');
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      // Fallback to saved stage
      const savedStage = localStorage.getItem("stage") as 'form' | 'chat';
      if (savedStage) {
        setStage(savedStage);
      }
    }
  }, [clearChatData]);

  const fetchUserInfo = useCallback(async (uid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${uid}/chats`);
      if (response.ok) {
        const data: UserChatsResponse = await response.json();
        const userName = data.user_name || '';
        const userEmail = data.user_email || '';

        // If user exists but has no proper name/email, show form to collect it
        // This handles cases where customer record exists but lacks user info
        const hasValidUserInfo = userName && userEmail && !userEmail.includes('@widget.local');

        if (!hasValidUserInfo) {
          console.log('👤 User exists but lacks name/email, showing form');
          setStage('form');
          setMessages([]);
          // Still set userId so the widget knows which user to link chats to
          return;
        }

        setName(userName);
        setEmail(userEmail);
        setStage('chat'); // Go directly to chat if user exists with valid info

        // Load existing chats and messages
        if (data.chats && data.chats.length > 0) {
          // Load the most recent chat's messages
          const latestChat = data.chats[data.chats.length - 1];
          setCurrentChatId(latestChat.chat_id);
          localStorage.setItem("currentChatId", latestChat.chat_id);

          // Load messages from backend if available
          if (latestChat.messages && latestChat.messages.length > 0) {
            // Convert chat messages to widget message format
            const chatMessages: Message[] = latestChat.messages.map(mapBackendMessage);

            // Merge with any existing messages from localStorage/state
            // This preserves messages that were loaded on mount before this API call
            setMessages(prevMessages => {
              // If we already have messages (from localStorage restore), merge them
              if (prevMessages.length > 0) {
                console.log(`🔄 Merging ${chatMessages.length} backend messages with ${prevMessages.length} existing messages`);
                // Use backend messages as base, add any localStorage messages not in backend
                const backendMessageIds = new Set(chatMessages.map(m => m.id));
                const unsavedMessages = prevMessages.filter(m => !backendMessageIds.has(m.id));
                const merged = [...chatMessages, ...unsavedMessages];
                console.log(`✅ Merged to ${merged.length} total messages`);
                return merged;
              }
              // No existing messages, just use backend messages
              console.log(`📥 Loaded ${chatMessages.length} messages from backend`);
              return chatMessages;
            });
          } else {
            // Chat exists but has no messages - check localStorage first
            const savedMessages = localStorage.getItem("messages");
            if (savedMessages) {
              try {
                const parsedMessages = JSON.parse(savedMessages);
                if (parsedMessages && parsedMessages.length > 0) {
                  setMessages(parsedMessages);
                } else {
                  setMessages([]);
                }
              } catch {
                console.error('Error parsing saved messages:', savedMessages);
                setMessages([]);
              }
            } else {
              setMessages([]);
            }
          }
        } else {
          // No chats exist - check localStorage for messages
          const savedMessages = localStorage.getItem("messages");
          if (savedMessages) {
            try {
              const parsedMessages = JSON.parse(savedMessages) as Message[];
              if (parsedMessages && parsedMessages.length > 0) {
                setMessages(parsedMessages);
              }
            } catch (error) {
              console.error('Error parsing saved messages:', error);
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        }
      } else if (response.status === 404) {
        // User doesn't exist yet - show the form to collect name/email
        console.log(' User not found in database, showing form for new user');
        setStage('form');
        setMessages([]);
      } else {
        // Other error - show form as fallback
        console.error(' Error fetching user info:', response.status, response.statusText);
        setStage('form');
        setMessages([]);
      }
    } catch (error) {
      console.error(' Error fetching user info:', error);
      // On error, show form to allow user to proceed
      setStage('form');
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    console.log(' Widget API URL:', API_BASE_URL);
    console.log(' Environment:', process.env.NODE_ENV);
    if (typeof window !== "undefined") {

      // Always load saved user data from localStorage first (UI state restoration)
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const savedStage = localStorage.getItem("stage") as 'form' | 'chat';
      const savedChatId = localStorage.getItem("currentChatId");

      // IMPORTANT: Clear old chat data if this is a new session
      // Check if we have user data in localStorage but no valid session
      const hasStoredData = storedName || storedEmail || savedChatId;
      const isNewSession = !propUserId && !storedEmail; // No URL userId and no saved email

      if (hasStoredData && isNewSession) {
        console.log(' Clearing old session data for fresh start');
        clearChatData();
      }

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);

      // If userId provided via props (from URL), use it
      if (propUserId) {
        setUserId(propUserId);

        // If we have saved email, check if customer exists and has chats (more reliable than userId endpoint)
        if (storedEmail) {
          checkCustomerAndLoadChats(storedEmail);
        } else if (savedStage === 'chat' && savedChatId) {
          // If we have saved stage as 'chat' and a chat ID, restore directly to chat
          setStage('chat');
          setCurrentChatId(savedChatId);
          // Load messages from localStorage if available
          const savedMessages = localStorage.getItem("messages");
          if (savedMessages) {
            try {
              const parsedMessages = JSON.parse(savedMessages);
              if (parsedMessages && parsedMessages.length > 0) {
                setMessages(parsedMessages);
              }
            } catch (e) {
              console.error('Error parsing saved messages:', e);
            }
          }
        } else {
          // No saved email or chat, try to get user info from API based on userId
          fetchUserInfo(propUserId);
        }
      } else {
        // No userId in URL - check if we have saved email
        if (storedEmail) {
          checkCustomerAndLoadChats(storedEmail);
        } else if (savedStage) {

          // No saved email, load saved stage
          setStage(savedStage);
          // If stage is 'chat' and we have a chat ID, restore it
          if (savedStage === 'chat' && savedChatId) {
            setCurrentChatId(savedChatId);
            // Load messages from localStorage if available
            const savedMessages = localStorage.getItem("messages");
            if (savedMessages) {
              try {
                const parsedMessages = JSON.parse(savedMessages);
                if (parsedMessages && parsedMessages.length > 0) {
                  setMessages(parsedMessages);
                }
              } catch (e) {
                console.error('Error parsing saved messages:', e);
              }
            }
          }
        }
      }

      // Track and increment visit count
      const visits = parseInt(localStorage.getItem('totalVisits') || '0', 10) + 1;
      localStorage.setItem('totalVisits', visits.toString());
    }

  }, [propUserId, checkCustomerAndLoadChats, fetchUserInfo, clearChatData]);

  /**
   * Persist stage changes to localStorage
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stage", stage);
    }
  }, [stage]);

  /**
   * Load saved messages from localStorage on mount - runs FIRST
   * Messages are stored in localStorage for quick access during the session
   * This ensures messages are available immediately on page load, before any API calls
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("messages");
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages) as Message[];
          if (parsedMessages && parsedMessages.length > 0) {
            console.log(` Restoring ${parsedMessages.length} messages from localStorage`);
            // Set messages immediately - this will be merged later if backend has messages
            setMessages(parsedMessages);
          }
        } catch (e) {
          console.error('Error parsing saved messages:', e);
          // Don't remove messages on parse error - might be temporary
        }
      }
    }
  }, []); // Empty deps - runs once on mount, BEFORE other effects

  /**
   * Persist messages to localStorage whenever they change
   * This provides fast access and offline capability during the session
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (messages.length > 0) {
        localStorage.setItem("messages", JSON.stringify(messages));
      } else {
        // Only clear localStorage if we're intentionally clearing messages (e.g., new session)
        // Don't clear on initial load or if messages might be loading
        const isInitialLoad = !currentChatId && !userId;
        if (!isInitialLoad) {
          // Messages were cleared intentionally, remove from localStorage
          localStorage.removeItem("messages");
        }
      }
    }
  }, [messages, currentChatId, userId]);

  // Messages are saved immediately when created; no additional unload sync required.

  /**
   * Initialize API health check and session ID generation
   */
  useEffect(() => {
    checkApiHealth();
    generateSessionId();
  }, []);

  /**
   * Auto-scroll to bottom when new messages are added
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Poll for new messages from the dashboard (human agent replies)
   * This runs every 2 seconds when in chat stage and chat ID exists
   */
  useEffect(() => {
    if (stage !== 'chat' || !currentChatId || !email) return;

    let isActive = true;

    const pollMessages = async () => {
      try {
        console.log(` Polling for messages - Chat ID: ${currentChatId}, Email: ${email}`);
        
        // Fetch latest messages from backend
        const response = await fetch(`${API_BASE_URL}/api/users/${email}/chats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          console.error(` Poll failed - Status: ${response.status}`);
          return;
        }
        
        if (!isActive) return;

        const data: UserChatsResponse = await response.json();
        console.log(` Received ${data.chats?.length || 0} chats from backend`);
        
        const currentChat = data.chats?.find((chat: BackendChat) => chat.chat_id === currentChatId);
        
        if (!currentChat) {
          console.warn(` Chat ${currentChatId} not found in response`);
          return;
        }
        
        console.log(` Chat found with ${currentChat.messages?.length || 0} messages`);
        
        if (currentChat && currentChat.messages && isActive) {
          const serverMessages = currentChat.messages.map(mapBackendMessage);

          // Always update with server messages (server is source of truth)
          setMessages(prevMessages => {
            // Compare to detect if there are actual changes
            const prevIds = prevMessages.map(m => m.id).join(',');
            const serverIds = serverMessages.map(m => m.id).join(',');
            
            if (prevIds !== serverIds) {
              console.log(' Messages updated - Count:', serverMessages.length);
              return serverMessages;
            }
            return prevMessages;
          });
        }
      } catch (error) {
        console.warn('Failed to poll messages:', error);
      }
    };

    // Poll immediately on mount, then every 2 seconds
    pollMessages();
    const intervalId = setInterval(pollMessages, 2000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [stage, currentChatId, email]); // Stable dependencies

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Generate a unique session ID for tracking chat sessions
   */
  const generateSessionId = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log(' Generated session ID:', newSessionId);
  };

  /**
   * Check API health status
   */
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      setApiStatus(response.ok ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  };

  /**
   * Scroll chat to bottom smoothly
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Collect comprehensive user metadata for analytics
   * Includes IP, location, device info, and visit statistics
   */
  const collectUserMetadata = async (): Promise<UserData> => {
    try {
      // Get user's IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      // Get location data based on IP
      const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      const locationData = await locationResponse.json();

      // Collect device information
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;

      // Calculate visit statistics
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
      // Return fallback data if metadata collection fails
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

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle form submission for user registration
   * Collects user metadata and transitions to chat stage
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingForm) return;
    if (!name || !email) return;

    try {
      setIsSubmittingForm(true);
      // Collect user metadata
      const userData = await collectUserMetadata();
      const payload: UserDataPayload = {
        ...userData,
        ...(userId ? { user_id: userId } : {}),
      };

      console.log(" Sending user data to backend:", payload);

      // Send user data to backend
      const response = await fetch(`${API_BASE_URL}/api/users/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to save user data: ${response.status}`);

      // IMPORTANT: Check if email changed BEFORE saving - clear old chat data
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail && storedEmail !== email) {
        console.log(` Email changed from ${storedEmail} to ${email}, clearing old chat data`);
        clearChatData();
      }

      // Save user data to localStorage (only for UI state, not messages)
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("stage", "chat");

      const result: UserDataResponse = await response.json();
      console.log('User data saved:', result);

      // Clear any existing messages when starting a new session
      setMessages([]);
      localStorage.removeItem("messages");

      // Create chat instance immediately after form submission
      try {
        console.log(' Creating chat instance after form submission...');
        const chatId = await ensureChatInstance(userId || undefined);

        console.log(' Chat instance created:', chatId);
        setCurrentChatId(chatId);
      } catch (error) {
        console.error(' Failed to create chat instance on form submit:', error);
        // Don't block form submission if chat creation fails - it will be created on first message
      }

      // Transition to chat stage
      setStage('chat');
    } catch (error) {
      console.error('Error saving user data:', error);
      setStage('chat'); // Fallback to chat even if user data save fails
    } finally {
      setIsSubmittingForm(false);
    }
  };

  /**
   * Create or get chat instance for the user
   * Can work with either userId or email
   */
  const ensureChatInstance = async (uid?: string): Promise<string> => {
    // If we already have a chat ID, return it
    if (currentChatId) {
      return currentChatId;
    }

    try {
      // Create a new chat instance
      // If userId provided, use it; otherwise use email
      const requestBody: CreateChatRequestBody = {};
      if (uid) {
        requestBody.user_id = uid;
      }

      if (name) requestBody.name = name;
      if (email) requestBody.email = email;
      
      // At minimum, need either user_id or email
      if (!requestBody.user_id && !requestBody.email) {
        throw new Error('Cannot create chat: need either userId or email');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/users/chats/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Failed to create chat:', response.status, errorText);
        throw new Error(`Failed to create chat: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const newChatId = data.chat_id;
      setCurrentChatId(newChatId);
      // Save chat ID to localStorage for persistence across refreshes
      localStorage.setItem("currentChatId", newChatId);
      console.log(' Created new chat instance:', newChatId);
      return newChatId;
    } catch (error) {
      console.error('Error creating chat instance:', error);
      throw error;
    }
  };

  /**
   * Send message to AI backend and handle response
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Ensure we have a chat instance (use userId if available, otherwise email)
    if (!currentChatId) {
      try {
        await ensureChatInstance(userId || undefined);
      } catch (error) {
        console.error('Failed to create chat instance:', error);
        return;
      }
    }

    // Update last seen timestamp
    localStorage.setItem("lastSeen", new Date().toISOString());

    // Create user message object
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat and clear input
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // If we have a chat instance, save the message to it
      if (currentChatId) {
        try {
          console.log(` Saving user message to chat ${currentChatId}...`);
          const saveResponse = await fetch(`${API_BASE_URL}/api/users/chats/${currentChatId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content: userMessage.content,
              role: 'user'  // Important: specify role
            }),
          });
          
          if (saveResponse.ok) {
            console.log(' User message saved to chat:', currentChatId);
          } else {
            console.error(` Failed to save message - Status: ${saveResponse.status}`);
          }
        } catch (error) {
          console.error(' Error saving message to chat instance:', error);
        }
      }

      // Prepare chat payload
      // Use currentChatId if available (for AI agent toggle check), otherwise fallback to sessionId
      const payload = {
        message: userMessage.content,
        session_id: currentChatId || sessionId,
      };
      
      console.log(" Sending chat payload to backend:", payload);
      console.log(" Using chat ID for AI agent check:", currentChatId || sessionId);

      // Send message to backend
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      // Process response
      const chatResponse: ChatResponse = await response.json();
      console.log(" Response from backend:", chatResponse);

      // Save AI response to chat instance if we have one
      if (currentChatId) {
        try {
          await fetch(`${API_BASE_URL}/api/users/chats/${currentChatId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content: chatResponse.response,
              role: 'assistant' 
            }),
          });
          console.log(' AI response saved to chat:', currentChatId);
        } catch (error) {
          console.warn('Failed to save AI response to chat instance:', error);
        }
      }

      // Clean response text (remove system markers)
      let cleanResponse = chatResponse.response;
      cleanResponse = cleanResponse
        .split("\n")
        .filter(line =>
          !line.startsWith("▶") &&   // Remove AOP start markers
          !line.startsWith("➡️") &&  // Remove step markers
          !line.startsWith("⏸") &&  // Remove pause markers
          !line.startsWith("💬 Agent:") // Remove redundant agent prefix
        )
        .join("\n")
        .trim();
      
      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        content: cleanResponse,
        role: 'assistant',
        timestamp: chatResponse.timestamp,
        processingTime: chatResponse.processing_time,
      };

      // Add assistant message to chat
      setMessages(prev => [...prev, assistantMessage]);
      // Messages are automatically saved to localStorage via useEffect
      // They will be synced to DB when browser closes
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle errors gracefully
      setMessages(prev => [
        ...prev,
        { 
          id: `error_${Date.now()}`, 
          content: 'Sorry, something went wrong.', 
          role: 'assistant', 
          timestamp: new Date().toISOString() 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle keyboard input for message sending
   * Enter sends message, Shift+Enter creates new line
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  /**
   * Render the user registration form stage
   */
  const renderFormStage = () => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Backdrop
          open={isSubmittingForm}
          sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        >
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress color="inherit" size={24} />
            <Typography variant="body2">Setting things up...</Typography>
          </Stack>
        </Backdrop>
        {/* Window Frame Header */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Left Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <ArrowBack fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Title */}
          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Welcome
          </Typography>
          
          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Minimize fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Maximize fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Main Form Area */}
        <Paper
          sx={{
            flex: 1,
            m: 2,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%', maxWidth: 400 }}>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                Let&apos;s get started
              </Typography>
              <Stack spacing={2}>
                {/* Name Input */}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmittingForm || apiStatus === 'offline'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff', // White background for input
                      '& input': {
                        color: '#000000', // Black text color for visibility
                      },
                      '& input::placeholder': {
                        color: 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(0, 0, 0, 0.6)',
                    },
                  }}
                />
                {/* Email Input */}
                <TextField
                  fullWidth
                  variant="outlined"
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmittingForm || apiStatus === 'offline'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff', // White background for input
                      '& input': {
                        color: '#000000', // Black text color for visibility
                      },
                      '& input::placeholder': {
                        color: 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(0, 0, 0, 0.6)',
                    },
                  }}
                />
                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmittingForm || !name || !email || apiStatus === 'offline'}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {isSubmittingForm ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CircularProgress size={16} sx={{ color: 'white' }} />
                      <span>Starting chat...</span>
                    </Stack>
                  ) : (
                    'Start Chat'
                  )}
                </Button>
                {apiStatus === 'offline' && (
                  <Typography variant="caption" sx={{ color: 'warning.main', textAlign: 'center' }}>
                    Backend is offline. Please try again later.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Powered by{' '}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: '#ff69b4', fontWeight: 600 }}
            >
              Sakura
            </Typography>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );

  /**
   * Render the main chat interface
   */
  const renderChatStage = () => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Window Frame Header */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Left Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <ArrowBack fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Agent Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Agent Avatar with Status */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                }}
              >
                <ChatBubble fontSize="small" />
              </Avatar>
              {/* Online Status Indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 12,
                  height: 12,
                  bgcolor: '#4caf50',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: 'background.paper',
                }}
              />
            </Box>
            {/* Agent Details */}
            <Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                First Agent
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                AI assistant
              </Typography>
            </Box>
          </Box>
          
          {/* Right Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
              Read
            </Typography>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Minimize fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Maximize fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Main Chat Area */}
        <Paper
          sx={{
            flex: 1,
            m: 2,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 3,
            overflow: 'hidden',
          }}
        >
          {/* Messages Container */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Welcome Message */}
            {messages.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  py: 2,
                }}
              >
                You have been transferred to: First Agent.
              </Typography>
            )}

            {/* Message List */}
            {messages.map((message) => (
              <Fade key={message.id} in timeout={300}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {/* Agent Avatar - AI or Human */}
                  {(message.role === 'assistant' || message.role === 'agent') && (
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: message.role === 'agent' ? '#1976d2' : 'grey.800',
                        borderRadius: 1,
                      }}
                    >
                      <ChatBubble sx={{ fontSize: 14 }} />
                    </Avatar>
                  )}
                  
                  {/* Message Bubble */}
                  <Paper
                    sx={{
                      maxWidth: '70%',
                      px: 1.5,
                      py: 1,
                      bgcolor: message.role === 'user' ? 'primary.main' : message.role === 'agent' ? '#e3f2fd' : 'grey.50',
                      color: message.role === 'user' ? 'white' : message.role === 'agent' ? '#1565c0' : 'grey.800',
                      borderRadius: 2,
                      boxShadow: 1,
                      border: message.role === 'agent' ? '1px solid #1976d2' : 'none',
                    }}
                  >
                    {message.role === 'assistant' || message.role === 'agent' ? (
                      <Box>
                        {message.role === 'agent' && (
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#1565c0' }}>
                            👤 Human Agent
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                    )}
                  </Paper>
                  
                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <Person sx={{ fontSize: 14 }} />
                    </Avatar>
                  )}
                </Box>
              </Fade>
            ))}

            {/* Loading State */}
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: 'grey.800',
                    borderRadius: 1,
                  }}
                >
                  <ChatBubble sx={{ fontSize: 14 }} />
                </Avatar>
                <Paper
                  sx={{
                    px: 1.5,
                    py: 1,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'grey.700' }}>
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Chat End Message */}
            {messages.length > 0 && !isLoading && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  py: 1,
                }}
              >
                Chat ended automatically due to your inactivity. Feel free to start it again.
              </Typography>
            )}

            {/* Timestamp */}
            {messages.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  py: 1,
                }}
              >
                {formatTime(messages[messages.length - 1]?.timestamp || new Date().toISOString())}
              </Typography>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              p: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 25,
                px: 2,
                py: 1,
              }}
            >
              {/* Attachment Button */}
              <IconButton size="small" sx={{ color: 'text.secondary', mr: 1 }}>
                <Add fontSize="small" />
              </IconButton>
              
              {/* Message Input */}
              <TextField
                fullWidth
                variant="standard"
                placeholder="Write a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || apiStatus === 'offline'}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: 'grey.800',
                    '& input::placeholder': {
                      color: 'text.secondary',
                    },
                  },
                }}
                inputRef={inputRef}
              />
              
              {/* Emoji Button */}
              <IconButton size="small" sx={{ color: 'text.secondary', mx: 1 }}>
                <EmojiEmotions fontSize="small" />
              </IconButton>
              
              {/* Send Button */}
              <IconButton
                size="small"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || apiStatus === 'offline'}
                sx={{
                  bgcolor: 'grey.200',
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'grey.300',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={16} sx={{ color: 'text.secondary' }} />
                ) : (
                  <Send fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            px: 2,
            py: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Powered by{' '}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: '#ff69b4', fontWeight: 600 }}
            >
              Sakura
            </Typography>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return stage === 'form' ? renderFormStage() : renderChatStage();
}