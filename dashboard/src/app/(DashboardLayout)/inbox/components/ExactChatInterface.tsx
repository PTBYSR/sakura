"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import {
  MoreVert,
  Link,
  Send,
  AttachFile,
  Tag,
  ChatBubbleOutline,
  Archive,
  Public,
  ExpandMore,
  Add,
  Warning as AlertCircle,
  CheckCircle,
  SmartToy as Robot,
  Person,
  Search,
  KeyboardArrowDown,
  Message,
  Bolt,
  Email,
  LocationOn,
  Facebook,
  WhatsApp,
  Description,
} from "@mui/icons-material";
import { useUnifiedChatData } from "../hooks/useUnifiedChatData";

// Types
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    chatInfo: true,
    chatTags: true,
    visitedPages: true,
  });

  const {
    chats,
    selectedChat,
    setSelectedChat,
    sendMessage,
    markAsRead,
    loading,
    error,
  } = useUnifiedChatData({ inboxType, userEmail, userId, section: section || "" });

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
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#1a1a1a" }}>
      {/* Top Global Navigation Bar */}
      <Box sx={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 60, 
        backgroundColor: "#2a2a2a", 
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        zIndex: 1000
      }}>
        {/* Search Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            placeholder="Search"
            size="small"
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1a1a1a",
                color: "white",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#555" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputBase-input::placeholder": { color: "#ccc" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip label="ctrl K" size="small" sx={{ backgroundColor: "#333", color: "#ccc", fontSize: "0.7rem" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Right side - Logo and notifications */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>
            páse
          </Typography>
          <Badge badgeContent={2} color="error">
            <IconButton sx={{ color: "white" }}>
              <Add />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", height: "100vh", pt: 7.5 }}>
        {/* Left Sidebar - Chat List */}
        <Box sx={{ width: 350, backgroundColor: "#2a2a2a", borderRight: "1px solid #333", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid #333" }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
              All chats
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                My chats {chats.length}
              </Typography>
              <Button
                endIcon={<KeyboardArrowDown />}
                sx={{ color: "#ccc", textTransform: "none", fontSize: "0.9rem" }}
              >
                Oldest
              </Button>
            </Box>
          </Box>

          {/* Chat List */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {chats.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
                  No active chats found. {loading ? "Loading..." : "Chats will appear here when customers start conversations."}
                </Typography>
                {process.env.NODE_ENV === "development" && (
                  <Typography sx={{ color: "#666", fontSize: "0.75rem", mt: 2 }}>
                    Debug: Section="{section}", Chats={chats.length}, Loading={loading ? "Yes" : "No"}, Error={error || "None"}
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
                  px: 3,
                  py: 2,
                  "&:hover": { backgroundColor: "#3a3a3a" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 50 }}>
                  <Badge
                    badgeContent={chat.chat.unreadCount}
                    color="error"
                    invisible={chat.chat.unreadCount === 0}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#ff6b35",
                        color: "white",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {chat.chat.avatar}
                    </Avatar>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography component="div" sx={{ color: "white", fontSize: "0.95rem", fontWeight: "bold" }}>
                      {chat.chat.name}
                    </Typography>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                  secondary={
                    <Box>
                      <Typography component="div" sx={{ color: "#ccc", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.chat.lastMessage}
                      </Typography>
                      <Typography component="div" sx={{ color: "#888", fontSize: "0.75rem" }}>
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
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#1a1a1a" }}>
          {/* Chat Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid #333", backgroundColor: "#2a2a2a" }}>
            <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>
              {currentContactInfo?.name || "Select a chat"}
            </Typography>
            {currentContactInfo?.email && (
              <Box sx={{ mt: 1 }}>
                <Typography component="div" sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                  E-mail: <Typography component="span" sx={{ color: "#2196f3", cursor: "pointer" }}>{currentContactInfo.email}</Typography>
                </Typography>
              </Box>
            )}
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            {selectedChat?.messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent: message.sender === "You" || message.sender === "AI Agent" ? "flex-end" : "flex-start",
                  mb: 3,
                }}
              >
                <Box sx={{ maxWidth: "70%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    {message.sender !== "You" && message.sender !== "AI Agent" && (
                      <Avatar sx={{ width: 24, height: 24, bgcolor: "#ff6b35", color: "white", fontSize: "0.8rem", mr: 1 }}>
                        {message.avatar}
                      </Avatar>
                    )}
                    <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>
                      {message.sender} {message.timestamp}
                    </Typography>
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: message.sender === "You" || message.sender === "AI Agent" ? "#1976d2" : "#2a2a2a",
                      color: "white",
                      borderRadius: 2,
                      border: "1px solid #333",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.9rem" }}>{message.content}</Typography>
                  </Paper>
                  <Typography sx={{ fontSize: "0.7rem", color: "#888", mt: 0.5 }}>
                    {message.sender === "You" || message.sender === "AI Agent" ? "Read • Now" : "Now"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Message Input Area */}
          <Box sx={{ p: 3, borderTop: "1px solid #333", backgroundColor: "#2a2a2a" }}>
            {/* Message Input */}
            <TextField
              fullWidth
              placeholder="Enter message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                  "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                },
                "& .MuiInputBase-input": { color: "white" },
                "& .MuiInputBase-input::placeholder": { color: "#ccc" },
              }}
            />

            {/* Controls */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  endIcon={<KeyboardArrowDown />}
                  sx={{ color: "#ccc", textTransform: "none", fontSize: "0.9rem" }}
                >
                  Message
                </Button>
                <IconButton sx={{ color: "#ccc" }}>
                  <Bolt />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <Tag />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <AttachFile />
                </IconButton>
              </Box>
              <Button
                onClick={handleSendMessage}
                sx={{
                  backgroundColor: "#333",
                  color: "white",
                  px: 3,
                  "&:hover": { backgroundColor: "#444" },
                }}
                endIcon={<Send />}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right Sidebar - Contact Info */}
        <Box sx={{ width: 350, backgroundColor: "#2a2a2a", borderLeft: "1px solid #333", p: 3 }}>
          {currentContactInfo ? (
            <>
              {/* Top Icons */}
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <IconButton sx={{ color: "#ccc" }}>
                  <Link />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <MoreVert />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <Person />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <Public />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <WhatsApp />
                </IconButton>
                <IconButton sx={{ color: "#ccc" }}>
                  <Description />
                </IconButton>
              </Box>

              {/* Contact Profile */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: "#ff6b35", color: "white", width: 48, height: 48 }}>
                  {currentContactInfo.avatar}
                </Avatar>
                <Box>
                  <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>
                    {currentContactInfo.name}
                  </Typography>
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {currentContactInfo.status}
                  </Typography>
                </Box>
              </Box>

              {/* Contact Details */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Email sx={{ color: "#ccc", fontSize: "1rem" }} />
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {currentContactInfo.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <LocationOn sx={{ color: "#ccc", fontSize: "1rem" }} />
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {currentContactInfo.location}
                  </Typography>
                </Box>

                {/* Stats */}
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ChatBubbleOutline sx={{ color: "#ccc", fontSize: "1rem" }} />
                    <Typography sx={{ color: "white", fontSize: "0.9rem" }}>
                      {currentContactInfo.totalMessages}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Archive sx={{ color: "#ccc", fontSize: "1rem" }} />
                    <Typography sx={{ color: "white", fontSize: "0.9rem" }}>
                      {currentContactInfo.archivedCount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Public sx={{ color: "#ccc", fontSize: "1rem" }} />
                    <Typography sx={{ color: "white", fontSize: "0.9rem" }}>
                      {currentContactInfo.visitedPagesCount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Public sx={{ color: "#ccc", fontSize: "1rem" }} />
                    <Typography sx={{ color: "white", fontSize: "0.9rem" }}>
                      {currentContactInfo.visitedPagesCount}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Chat Info Section */}
              <Box sx={{ mb: 3 }}>
                <Button
                  onClick={() => toggleSection("chatInfo")}
                  sx={{ color: "white", justifyContent: "flex-start", width: "100%", textTransform: "none" }}
                  endIcon={<ExpandMore sx={{ transform: expandedSections.chatInfo ? "rotate(180deg)" : "rotate(0deg)" }} />}
                >
                  Chat info
                </Button>
                <Collapse in={expandedSections.chatInfo}>
                  <Box sx={{ pl: 2, mt: 1 }}>
                    <Typography sx={{ color: "#ccc", fontSize: "0.8rem", mb: 1 }}>
                      Chat ID {currentContactInfo.chatId}
                    </Typography>
                    <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>
                      Chat duration {currentContactInfo.chatDuration}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>

              {/* Chat Tags Section */}
              <Box sx={{ mb: 3 }}>
                <Button
                  onClick={() => toggleSection("chatTags")}
                  sx={{ color: "white", justifyContent: "flex-start", width: "100%", textTransform: "none" }}
                  endIcon={<ExpandMore sx={{ transform: expandedSections.chatTags ? "rotate(180deg)" : "rotate(0deg)" }} />}
                >
                  Chat tags
                </Button>
                <Collapse in={expandedSections.chatTags}>
                  <Box sx={{ pl: 2, mt: 1 }}>
                    <IconButton sx={{ color: "#ccc" }}>
                      <Add sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </Box>
                </Collapse>
              </Box>

              {/* Visited Pages Section */}
              <Box sx={{ mb: 3 }}>
                <Button
                  onClick={() => toggleSection("visitedPages")}
                  sx={{ color: "white", justifyContent: "flex-start", width: "100%", textTransform: "none" }}
                  endIcon={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Badge badgeContent={currentContactInfo.visitedPagesCount} color="error" />
                      <ExpandMore sx={{ transform: expandedSections.visitedPages ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </Box>
                  }
                >
                  Visited pages
                </Button>
                <Collapse in={expandedSections.visitedPages}>
                  <Box sx={{ pl: 2, mt: 1 }}>
                    {currentContactInfo.visitedPages.map((page, index) => (
                      <Box key={index} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                        <Public sx={{ color: "#ccc", fontSize: "1rem" }} />
                        <Box>
                          <Typography sx={{ color: "white", fontSize: "0.8rem" }}>
                            {typeof page === 'string' ? page : page.title}
                          </Typography>
                          <Typography sx={{ color: "#ccc", fontSize: "0.7rem" }}>
                            {typeof page === 'string' ? 'Unknown' : page.timestamp}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography sx={{ color: "#ccc" }}>
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
