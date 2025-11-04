"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Collapse,
  Badge,
  InputAdornment,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Send,
  ChatBubbleOutline,
  Public,
  ExpandMore,
  Warning as AlertCircle,
  CheckCircle,
  SmartToy as Robot,
  Search,
  Email,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useUnifiedChatData } from "../hooks/useUnifiedChatData";
import { useSidebar } from "@/contexts/SidebarContext";

// Types
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead?: boolean;
  avatar?: string;
  role?: string; // "assistant" for AI, "agent" for human agent, "user" for customer
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  status: "online" | "offline" | "away";
  section: string;
}

interface ContactInfo {
  name: string;
  email: string;
  location: string;
  avatar: string;
  status: string;
  chatId: string;
  chatDuration: string;
  totalMessages: number;
  archivedCount: number;
  visitedPagesCount: number;
  tags: string[];
  visitedPages: { url: string; title: string; timestamp: string }[];
}

interface ChatInterfaceProps {
  inboxType: "agent" | "human";
  userEmail?: string;
  userId?: string | null;
  section?: string;
  contactInfo?: ContactInfo;
  suggestedReplies?: string[];
}

const ExactChatInterface: React.FC<ChatInterfaceProps> = ({
  inboxType,
  userEmail = "agent@heirs.com",
  userId = null,
  section,
  contactInfo: defaultContactInfo,
  suggestedReplies = [],
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [aiAgentEnabled, setAiAgentEnabled] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    chatInfo: false,
    visitedPages: false,
  });

  // Format timestamp function
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // If less than 1 minute ago
      if (diffMins < 1) {
        return "Just now";
      }
      // If less than 1 hour ago
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      }
      // If less than 24 hours ago
      if (diffHours < 24) {
        return `${diffHours}h ago`;
      }
      // If less than 7 days ago
      if (diffDays < 7) {
        return `${diffDays}d ago`;
      }
      // Otherwise, show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Just now";
    }
  };

  // Determine if message is from AI Agent or Human Agent
  // Check both sender name and role indicator
  const isAIMessage = (message: Message): boolean => {
    // First check role (most reliable)
    if (message.role === "assistant") {
      return true;
    }
    // Fallback to sender name check
    const senderLower = message.sender.toLowerCase();
    return senderLower === "ai agent" || senderLower.includes("ai") || senderLower.includes("bot");
  };

  const isHumanAgentMessage = (message: Message): boolean => {
    // If it's AI, it's not human
    if (isAIMessage(message)) {
      return false;
    }
    // Check role first (most reliable)
    if (message.role === "agent") {
      return true;
    }
    // Fallback to sender name check
    const senderLower = message.sender.toLowerCase();
    return senderLower === "you" || senderLower === "agent" || (senderLower.includes("agent") && !senderLower.includes("ai"));
  };

  const {
    chats,
    selectedChat,
    setSelectedChat,
    sendMessage,
    markAsRead,
    loading,
    error,
  } = useUnifiedChatData({ inboxType, userEmail, userId, section: section || "" });

  const { isSidebarCollapsed, sidebarWidth, collapsedSidebarWidth } = useSidebar();
  const currentSidebarWidth = isSidebarCollapsed ? collapsedSidebarWidth : sidebarWidth;

  // Fetch AI agent status when chat is selected
  useEffect(() => {
    const fetchAiAgentStatus = async () => {
      if (!selectedChat?.chat.id) {
        setAiAgentEnabled(true); // Default to enabled
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : "https://sakura-backend.onrender.com");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/chats/${selectedChat.chat.id}/ai-agent`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAiAgentEnabled(data.ai_agent_enabled ?? true);
        } else {
          // Default to enabled if fetch fails
          setAiAgentEnabled(true);
        }
      } catch (error) {
        console.error("Error fetching AI agent status:", error);
        setAiAgentEnabled(true); // Default to enabled on error
      }
    };

    fetchAiAgentStatus();
  }, [selectedChat?.chat.id]);

  const handleToggleAiAgent = async (enabled: boolean) => {
    if (!selectedChat?.chat.id) return;

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8000"
        : "https://sakura-backend.onrender.com");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/chats/${selectedChat.chat.id}/ai-agent`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setAiAgentEnabled(enabled);
      } else {
        console.error("Failed to update AI agent status");
        // Revert the toggle on error
        setAiAgentEnabled(!enabled);
      }
    } catch (error) {
      console.error("Error updating AI agent status:", error);
      // Revert the toggle on error
      setAiAgentEnabled(!enabled);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const currentContactInfo = selectedChat?.contactInfo || defaultContactInfo;

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#1a1a1a" }}>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "white" }}>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#1a1a1a" }}>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "red" }}>Error: {error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column",
      height: "100vh", 
      width: `calc(100vw - ${currentSidebarWidth}px)`,
      position: "fixed", 
      top: 0, 
      left: `${currentSidebarWidth}px`,
      right: 0,
      bottom: 0,
      backgroundColor: "#1a1a1a",
      overflow: "hidden",
      transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
      zIndex: 1100
    }}>
      {/* Top Global Navigation Bar */}
      <Box sx={{ 
        height: 52, 
        backgroundColor: "#2a2a2a", 
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        flexShrink: 0,
        zIndex: 1000
      }}>
        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TextField
            placeholder="Search"
            size="small"
            sx={{
              width: 280,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1a1a1a",
                color: "white",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#555" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
              "& .MuiInputBase-input": { color: "white", fontSize: "0.875rem" },
              "& .MuiInputBase-input::placeholder": { color: "#ccc", fontSize: "0.875rem" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#ccc", fontSize: "1rem" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip label="ctrl K" size="small" sx={{ backgroundColor: "#333", color: "#ccc", fontSize: "0.65rem", height: "20px" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Right side - Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ color: "white", fontWeight: 600, fontSize: "1rem" }}>
            páse
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        display: "flex", 
        flex: 1,
        height: "calc(100vh - 52px)",
        overflow: "hidden"
      }}>
        {/* Left Sidebar - Chat List */}
        <Box sx={{ 
          width: 300, 
          backgroundColor: "#2a2a2a", 
          borderRight: "1px solid #333", 
          display: "flex", 
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden"
        }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
            <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem", mb: 0.75 }}>
              All chats
            </Typography>
            <Typography sx={{ color: "#999", fontSize: "0.8rem", fontWeight: 400 }}>
              {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
              </Typography>
          </Box>

          {/* Chat List */}
          <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {chats.length === 0 ? (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography sx={{ color: "#888", fontSize: "0.8rem" }}>
                  No active chats found. {loading ? "Loading..." : "Chats will appear here when customers start conversations."}
                </Typography>
                {process.env.NODE_ENV === "development" && (
                  <Typography sx={{ color: "#666", fontSize: "0.7rem", mt: 1.5 }}>
                    Debug: Section=&quot;{section}&quot;, Chats={chats.length}, Loading={loading ? "Yes" : "No"}, Error={error || "None"}
                  </Typography>
                )}
              </Box>
            ) : (
              chats.map((chat) => (
              <ListItemButton
                key={chat.chat.id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  backgroundColor: selectedChat?.chat.id === chat.chat.id ? "#3a3a3a" : "transparent",
                  borderRadius: 0,
                  px: 2.5,
                  py: 1.5,
                  "&:hover": { backgroundColor: "#3a3a3a" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Badge
                    badgeContent={chat.chat.unreadCount}
                    color="error"
                    invisible={chat.chat.unreadCount === 0}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#ff6b35",
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      {chat.chat.avatar}
                    </Avatar>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography component="div" sx={{ color: "white", fontSize: "0.875rem", fontWeight: 500, mb: 0.25 }}>
                      {chat.chat.name}
                    </Typography>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                  secondary={
                    <Box>
                      <Typography component="div" sx={{ color: "#999", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mb: 0.25 }}>
                        {chat.chat.lastMessage}
                      </Typography>
                      <Typography component="div" sx={{ color: "#666", fontSize: "0.7rem", fontWeight: 400 }}>
                        {chat.chat.timestamp}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
              ))
            )}
          </Box>
        </Box>

        {/* Center Panel - Chat Messages */}
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          backgroundColor: "#1a1a1a",
          overflow: "hidden"
        }}>
          {/* Chat Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: "1px solid #333", 
            backgroundColor: "#2a2a2a", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            flexShrink: 0
          }}>
            <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem", mb: 0.5 }}>
              {currentContactInfo?.name || "Select a chat"}
            </Typography>
            {currentContactInfo?.email && (
              <Box sx={{ mt: 0.5 }}>
                <Typography component="div" sx={{ color: "#999", fontSize: "0.8rem" }}>
                  E-mail: <Typography component="span" sx={{ color: "#2196f3", cursor: "pointer", fontWeight: 400 }}>{currentContactInfo.email}</Typography>
                </Typography>
              </Box>
              )}
            </Box>
            {selectedChat && (
              <Tooltip title={aiAgentEnabled ? "AI Agent is responding automatically" : "AI Agent responses are disabled"}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={aiAgentEnabled}
                      onChange={(e) => handleToggleAiAgent(e.target.checked)}
                      disabled={loading}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#4caf50",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#4caf50",
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Robot sx={{ fontSize: "0.9rem", color: aiAgentEnabled ? "#4caf50" : "#888" }} />
                      <Typography sx={{ color: "#999", fontSize: "0.8rem", ml: 0.5, fontWeight: 400 }}>
                        AI Agent
                      </Typography>
                    </Box>
                  }
                  sx={{ ml: 1.5, mr: 0 }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: 2 }}>
            {selectedChat?.messages.map((message) => {
              const isAI = isAIMessage(message);
              const isHumanAgent = isHumanAgentMessage(message);
              const isAgentMessage = isAI || isHumanAgent;
              const isCustomerMessage = !isAgentMessage;
              const formattedTime = formatTimestamp(message.timestamp);

              return (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                    justifyContent: isAgentMessage ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isAgentMessage ? "flex-end" : "flex-start" }}>
                    {/* Sender label and timestamp */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.4, gap: 0.5 }}>
                      {isCustomerMessage && (
                        <Avatar sx={{ width: 20, height: 20, bgcolor: "#ff6b35", color: "white", fontSize: "0.7rem" }}>
                        {message.avatar}
                      </Avatar>
                    )}
                      {isAgentMessage && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {isAI ? (
                            <Chip
                              icon={<Robot sx={{ fontSize: "0.75rem !important" }} />}
                              label="AI Agent"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                backgroundColor: "#4caf50",
                                color: "white",
                                "& .MuiChip-icon": { color: "white" },
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<PersonIcon sx={{ fontSize: "0.75rem !important" }} />}
                              label="Agent"
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                backgroundColor: "#1976d2",
                                color: "white",
                                "& .MuiChip-icon": { color: "white" },
                              }}
                            />
                          )}
                        </Box>
                      )}
                      <Typography sx={{ color: "#999", fontSize: "0.75rem", fontWeight: 400 }}>
                        {formattedTime}
                    </Typography>
                  </Box>
                    
                    {/* Message bubble */}
                  <Paper
                    sx={{
                        p: 1.5,
                        backgroundColor: isAI 
                          ? "#4caf50" 
                          : isHumanAgent 
                          ? "#1976d2" 
                          : "#2a2a2a",
                      color: "white",
                        borderRadius: 1.5,
                        border: isAI 
                          ? "1px solid #66bb6a" 
                          : isHumanAgent 
                          ? "1px solid #42a5f5" 
                          : "1px solid #333",
                        boxShadow: isAgentMessage ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.5, fontWeight: 400 }}>
                        {message.content}
                      </Typography>
                  </Paper>
                    
                    {/* Status text */}
                    <Typography sx={{ fontSize: "0.65rem", color: "#666", mt: 0.4, fontWeight: 400 }}>
                      {isAgentMessage ? (message.isRead !== false ? "Read" : "Sent") : (message.isRead !== false ? "Read" : "Unread")}
                    </Typography>
                </Box>
              </Box>
              );
            })}
          </Box>

          {/* Message Input Area */}
          <Box sx={{ 
            p: 2, 
            borderTop: "1px solid #333", 
            backgroundColor: "#2a2a2a",
            flexShrink: 0
          }}>
            {/* Message Input */}
            <TextField
              fullWidth
              placeholder="Enter message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              size="small"
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                  "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                },
                "& .MuiInputBase-input": { color: "white", fontSize: "0.875rem" },
                "& .MuiInputBase-input::placeholder": { color: "#999", fontSize: "0.875rem" },
              }}
            />

            {/* Controls */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Button
                onClick={handleSendMessage}
                size="small"
                disabled={!newMessage.trim()}
                sx={{
                  backgroundColor: "#333",
                  color: "white",
                  px: 2,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "#444" },
                  "&:disabled": { backgroundColor: "#222", color: "#666" },
                }}
                endIcon={<Send sx={{ fontSize: "1rem" }} />}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right Sidebar - Contact Info */}
        <Box sx={{ 
          width: 300, 
          backgroundColor: "#2a2a2a", 
          borderLeft: "1px solid #333", 
          p: 2,
          flexShrink: 0,
          overflowY: "auto",
          overflowX: "hidden"
        }}>
          {currentContactInfo ? (
            <>
              {/* Contact Profile */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: "#ff6b35", color: "white", width: 40, height: 40, fontSize: "0.95rem", fontWeight: 600 }}>
                  {currentContactInfo.avatar}
                </Avatar>
                <Box>
                  <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem", mb: 0.25 }}>
                    {currentContactInfo.name}
                  </Typography>
                  <Typography sx={{ color: "#999", fontSize: "0.8rem", fontWeight: 400 }}>
                    {currentContactInfo.status}
                  </Typography>
                </Box>
              </Box>

              {/* Contact Details */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
                  <Email sx={{ color: "#999", fontSize: "0.9rem" }} />
                  <Typography sx={{ color: "#999", fontSize: "0.8rem", fontWeight: 400 }}>
                    {currentContactInfo.email}
                  </Typography>
                </Box>

                {/* Stats */}
                <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ChatBubbleOutline sx={{ color: "#999", fontSize: "0.9rem" }} />
                    <Typography sx={{ color: "white", fontSize: "0.8rem", fontWeight: 500 }}>
                      {currentContactInfo.totalMessages} messages
                    </Typography>
                  </Box>
                  {currentContactInfo.visitedPagesCount > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Public sx={{ color: "#999", fontSize: "0.9rem" }} />
                      <Typography sx={{ color: "white", fontSize: "0.8rem", fontWeight: 500 }}>
                        {currentContactInfo.visitedPagesCount} pages
                    </Typography>
                  </Box>
                  )}
                </Box>
              </Box>

              {/* Chat Info Section */}
              <Box sx={{ mb: 2 }}>
                <Button
                  onClick={() => toggleSection("chatInfo")}
                  sx={{ color: "white", justifyContent: "flex-start", width: "100%", textTransform: "none", fontSize: "0.85rem", fontWeight: 500, padding: "6px 8px", minHeight: "32px" }}
                  endIcon={<ExpandMore sx={{ transform: expandedSections.chatInfo ? "rotate(180deg)" : "rotate(0deg)", fontSize: "1rem" }} />}
                >
                  Chat info
                </Button>
                <Collapse in={expandedSections.chatInfo}>
                  <Box sx={{ pl: 1.5, mt: 0.75 }}>
                    <Typography sx={{ color: "#999", fontSize: "0.75rem", mb: 0.75, fontWeight: 400 }}>
                      Chat ID {currentContactInfo.chatId}
                    </Typography>
                    <Typography sx={{ color: "#999", fontSize: "0.75rem", fontWeight: 400 }}>
                      Chat duration {currentContactInfo.chatDuration}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>

              {/* Visited Pages Section */}
              {currentContactInfo.visitedPages && currentContactInfo.visitedPages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                <Button
                  onClick={() => toggleSection("visitedPages")}
                    sx={{ color: "white", justifyContent: "flex-start", width: "100%", textTransform: "none", fontSize: "0.85rem", fontWeight: 500, padding: "6px 8px", minHeight: "32px" }}
                  endIcon={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Badge badgeContent={currentContactInfo.visitedPagesCount} color="error" />
                        <ExpandMore sx={{ transform: expandedSections.visitedPages ? "rotate(180deg)" : "rotate(0deg)", fontSize: "1rem" }} />
                    </Box>
                  }
                >
                  Visited pages
                </Button>
                <Collapse in={expandedSections.visitedPages}>
                    <Box sx={{ pl: 1.5, mt: 0.75 }}>
                    {currentContactInfo.visitedPages.map((page, index) => (
                        <Box key={index} sx={{ mb: 0.75, display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Public sx={{ color: "#999", fontSize: "0.9rem" }} />
                        <Box>
                            <Typography sx={{ color: "white", fontSize: "0.75rem", fontWeight: 400 }}>
                            {typeof page === 'string' ? page : page.title}
                          </Typography>
                            {typeof page !== 'string' && page.timestamp && (
                              <Typography sx={{ color: "#999", fontSize: "0.65rem", fontWeight: 400 }}>
                                {page.timestamp}
                          </Typography>
                            )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography sx={{ color: "#999", fontSize: "0.8rem", fontWeight: 400 }}>
                Select a chat to view contact information
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ExactChatInterface;
