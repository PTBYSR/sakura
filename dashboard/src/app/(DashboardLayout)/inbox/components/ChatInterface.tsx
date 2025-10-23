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
} from "@mui/icons-material";

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
  chats: Chat[];
  messages: Message[];
  contactInfo: ContactInfo;
  suggestedReplies?: string[];
  onSendMessage: (message: string) => void;
  onChatSelect: (chatId: string) => void;
  selectedChatId: string;
  inboxType: "agent" | "human";
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chats,
  messages,
  contactInfo,
  suggestedReplies = [],
  onSendMessage,
  onChatSelect,
  selectedChatId,
  inboxType,
}) => {
  const [message, setMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    chatInfo: true,
    chatTags: true,
    visitedPages: true,
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChatId);

  const getAvatarColor = (status: string) => {
    switch (status) {
      case "online":
        return "#4caf50";
      case "away":
        return "#ff9800";
      case "offline":
        return "#757575";
      default:
        return inboxType === "agent" ? "#ff6b35" : "#4caf50";
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 200px)",
        display: "flex",
        backgroundColor: "#1a1a1a",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar - Chat List */}
      <Box
        sx={{
          width: 300,
          backgroundColor: "#2a2a2a",
          borderRight: "1px solid #333",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Chat List Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            All chats
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body2" sx={{ color: "#ccc" }}>
              My chats {chats.length}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", color: "#ccc" }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Oldest
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Chat List */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {chats.map((chat) => (
            <Box
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              sx={{
                p: 2,
                cursor: "pointer",
                backgroundColor: selectedChatId === chat.id ? "#3a3a3a" : "transparent",
                borderBottom: "1px solid #333",
                "&:hover": {
                  backgroundColor: "#3a3a3a",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: getAvatarColor(chat.status),
                    color: "white",
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  {chat.avatar}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{ color: "white", fontWeight: "medium" }}
                  >
                    {chat.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#ccc", fontSize: "0.875rem" }}
                  >
                    {chat.lastMessage}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <Typography variant="caption" sx={{ color: "#ccc" }}>
                    {chat.timestamp}
                  </Typography>
                  {chat.unreadCount > 0 && (
                    <Badge
                      badgeContent={chat.unreadCount}
                      color="error"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Central Panel - Chat Conversation */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            {selectedChatData?.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton sx={{ color: "#ccc" }}>
              <Link />
            </IconButton>
            <IconButton sx={{ color: "#ccc" }}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "You" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ maxWidth: "70%" }}>
                <Typography variant="caption" sx={{ color: "#ccc", ml: 1 }}>
                  {msg.sender} {msg.timestamp}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: msg.sender === "You" ? "#1976d2" : "#3a3a3a",
                    color: "white",
                    p: 1.5,
                    borderRadius: 2,
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "#ccc", ml: 1 }}>
                  {msg.sender === "You" ? "Read • Now" : msg.isRead ? "Read" : "Unread"}
                </Typography>
              </Box>
              {msg.sender === "You" && (
                <Avatar
                  sx={{
                    bgcolor: "#9c27b0",
                    color: "white",
                    width: 24,
                    height: 24,
                    ml: 1,
                    mt: 2,
                  }}
                >
                  A
                </Avatar>
              )}
            </Box>
          ))}
        </Box>

        {/* Suggested Replies */}
        {suggestedReplies.length > 0 && (
          <Box sx={{ p: 2, borderTop: "1px solid #333" }}>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {suggestedReplies.map((reply, index) => (
                <Chip
                  key={index}
                  label={reply}
                  size="small"
                  sx={{
                    backgroundColor: "#3a3a3a",
                    color: "#ccc",
                    "&:hover": {
                      backgroundColor: "#4a4a4a",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Message Input */}
        <Box sx={{ p: 2, borderTop: "1px solid #333" }}>
          <TextField
            fullWidth
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#3a3a3a",
                color: "white",
                "& fieldset": {
                  borderColor: "#555",
                },
                "&:hover fieldset": {
                  borderColor: "#777",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#ccc",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton size="small" sx={{ color: "#ccc" }}>
                      <Tag />
                    </IconButton>
                    <IconButton size="small" sx={{ color: "#ccc" }}>
                      <AttachFile />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSendMessage}
                      sx={{
                        backgroundColor: "#3a3a3a",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "#4a4a4a",
                        },
                      }}
                    >
                      Send
                    </Button>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Right Sidebar - Contact Details */}
      <Box
        sx={{
          width: 300,
          backgroundColor: "#2a2a2a",
          borderLeft: "1px solid #333",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Contact Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(contactInfo.status),
                  color: "white",
                  width: 40,
                  height: 40,
                  mr: 2,
                }}
              >
                {contactInfo.avatar}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                  {contactInfo.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  {contactInfo.status}
                </Typography>
              </Box>
            </Box>
            <IconButton sx={{ color: "#ccc" }}>
              <ExpandMore />
            </IconButton>
          </Box>
        </Box>

        {/* Contact Information */}
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" sx={{ color: "#ccc", mr: 1 }}>
              📧
            </Typography>
            <Typography variant="body2" sx={{ color: "white" }}>
              {contactInfo.email}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ color: "#ccc", mr: 1 }}>
              📍
            </Typography>
            <Typography variant="body2" sx={{ color: "white" }}>
              {contactInfo.location}
            </Typography>
          </Box>
        </Box>

        {/* Metrics */}
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <Box sx={{ textAlign: "center" }}>
              <ChatBubbleOutline sx={{ color: "#ccc", mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                {contactInfo.totalMessages}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Archive sx={{ color: "#ccc", mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                {contactInfo.archivedCount}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Public sx={{ color: "#ccc", mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: "white" }}>
                {contactInfo.visitedPagesCount}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Chat Info Section */}
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Box
            onClick={() => toggleSection("chatInfo")}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          >
            <Typography variant="body1" sx={{ color: "white", fontWeight: "medium" }}>
              Chat info
            </Typography>
            <ExpandMore
              sx={{
                color: "#ccc",
                transform: expandedSections.chatInfo ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </Box>
          <Collapse in={expandedSections.chatInfo}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Chat ID
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {contactInfo.chatId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Chat duration
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  {contactInfo.chatDuration}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Chat Tags Section */}
        <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
          <Box
            onClick={() => toggleSection("chatTags")}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          >
            <Typography variant="body1" sx={{ color: "white", fontWeight: "medium" }}>
              Chat tags
            </Typography>
            <ExpandMore
              sx={{
                color: "#ccc",
                transform: expandedSections.chatTags ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </Box>
          <Collapse in={expandedSections.chatTags}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                {contactInfo.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: "#3a3a3a",
                      color: "#ccc",
                      fontSize: "0.75rem",
                    }}
                  />
                ))}
              </Box>
              <IconButton
                sx={{
                  backgroundColor: "#3a3a3a",
                  color: "#ccc",
                  width: 32,
                  height: 32,
                  "&:hover": {
                    backgroundColor: "#4a4a4a",
                  },
                }}
              >
                <Add />
              </IconButton>
            </Box>
          </Collapse>
        </Box>

        {/* Visited Pages Section */}
        <Box sx={{ p: 2 }}>
          <Box
            onClick={() => toggleSection("visitedPages")}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ color: "white", fontWeight: "medium" }}>
                Visited pages
              </Typography>
              <Badge badgeContent="1" color="error" sx={{ ml: 1 }} />
            </Box>
            <ExpandMore
              sx={{
                color: "#ccc",
                transform: expandedSections.visitedPages ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </Box>
          <Collapse in={expandedSections.visitedPages}>
            <Box sx={{ mt: 2 }}>
              {contactInfo.visitedPages.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {contactInfo.visitedPages.map((page, index) => (
                    <Box key={index} sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="body2" sx={{ color: "white", fontWeight: "medium" }}>
                        {page.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#ccc" }}>
                        {page.url} • {page.timestamp}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  No pages visited yet
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;

