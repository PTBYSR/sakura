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

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Divider,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
  Fade,
  CircularProgress,
  Button,
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
  role: 'user' | 'assistant';
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

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * TypewriterText Component
 * 
 * Creates a typewriter animation effect for AI responses
 * @param text - The text to animate
 * @param speed - Animation speed in milliseconds per character (default: 30ms)
 */
const TypewriterText = ({ text, speed = 30 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animate text character by character
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  // Reset animation when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
      {displayedText}
      {currentIndex < text.length && <span style={{ opacity: 0.7 }}>|</span>}
    </Typography>
  );
};

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
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // UI State
  const [stage, setStage] = useState<'form' | 'chat'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // User Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');

  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visitStartTime = useRef<number>(Date.now());

  // ============================================================================
  // EFFECTS & LIFECYCLE
  // ============================================================================

  /**
   * Initialize component state from localStorage
   * Loads saved user data, stage, and messages on component mount
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load saved stage
      const savedStage = localStorage.getItem("stage") as 'form' | 'chat';
      if (savedStage) setStage(savedStage);

      // Load saved user data
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);

      // Track and increment visit count
      const visits = parseInt(localStorage.getItem('totalVisits') || '0', 10) + 1;
      localStorage.setItem('totalVisits', visits.toString());
    }
  }, []);

  /**
   * Persist stage changes to localStorage
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stage", stage);
    }
  }, [stage]);

  /**
   * Load saved messages from localStorage
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("messages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, []);

  /**
   * Persist messages to localStorage whenever they change
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

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

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Generate a unique session ID for tracking chat sessions
   */
  const generateSessionId = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log('🆔 Generated session ID:', newSessionId);
  };

  /**
   * Check API health status
   */
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
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
    if (!name || !email) return;

    try {
      // Collect user metadata
      const userData = await collectUserMetadata();
      console.log("🧠 Sending user data to backend:", userData);

      // Send user data to backend
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error(`Failed to save user data: ${response.status}`);

      // Save user data to localStorage
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("stage", "chat");

      const result: UserDataResponse = await response.json();
      console.log('User data saved:', result);

      // Transition to chat stage
      setStage('chat');
    } catch (error) {
      console.error('Error saving user data:', error);
      setStage('chat'); // Fallback to chat even if user data save fails
    }
  };

  /**
   * Send message to AI backend and handle response
   */
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

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
    setError('');

    try {
      // Prepare chat payload
      const payload = {
        message: userMessage.content,
        session_id: sessionId,
        name,
        email,
      };
      
      console.log("💬 Sending chat payload to backend:", payload);

      // Send message to backend
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      // Process response
      const chatResponse: ChatResponse = await response.json();
      console.log("✅ Response from backend:", chatResponse);

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
    } catch (error) {
      // Handle errors gracefully
      setError(error instanceof Error ? error.message : 'Error sending message');
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

  /**
   * Clear chat history and generate new session
   */
  const clearChat = () => {
    setMessages([]);
    setError('');
    generateSessionId();
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
                Let's get started
              </Typography>
              <Stack spacing={2}>
                {/* Name Input */}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Start Chat
                </Button>
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
                  {/* Assistant Avatar */}
                  {message.role === 'assistant' && (
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
                  )}
                  
                  {/* Message Bubble */}
                  <Paper
                    sx={{
                      maxWidth: '70%',
                      px: 1.5,
                      py: 1,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'grey.50',
                      color: message.role === 'user' ? 'white' : 'grey.800',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <TypewriterText text={message.content} speed={30} />
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