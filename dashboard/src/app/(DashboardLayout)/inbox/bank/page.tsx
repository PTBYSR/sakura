"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  InputAdornment,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Message as MessageIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Computer as ComputerIcon,
  Psychology as PsychologyIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  SmartToy as AgentIcon,
  PersonPin as HumanIcon,
} from "@mui/icons-material";

interface Message {
  role: string;
  text: string;
  timestamp: string;
  read?: boolean;
}

interface Chat {
  chat_id: string;
  status: string;
  created_at: string;
  last_activity: string;
  total_messages?: number;
  messages: Message[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  ip?: string;
  vibe?: string;
  category?: string;
  status?: string;
  location?: { city?: string; region?: string; country?: string };
  device?: { userAgent?: string; platform?: string };
  chats: Chat[];
}

export default function DataInspectorPage() {
  const [data, setData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [expandedChats, setExpandedChats] = useState<string[]>([]);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/debug/users-chats`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const json = await res.json();
        setData(json.users || []);
        setFilteredData(json.users || []);
      } catch (err: any) {
        console.error("❌ Failed to fetch debug data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredData(
      data.filter(
        (u) =>
          u.name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower)
      )
    );
  }, [search, data]);

  const handleUserToggle = (userId: string) => {
    setExpandedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleChatToggle = (chatId: string) => {
    setExpandedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'agent-inbox':
        return '#4caf50'; // Green
      case 'human-chats':
        return '#2196f3'; // Blue
      case 'escalated':
        return '#f44336'; // Red
      case 'resolved':
        return '#9c27b0'; // Purple
      default:
        return '#666'; // Gray
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'agent-inbox':
        return <AgentIcon sx={{ fontSize: 16 }} />;
      case 'human-chats':
        return <HumanIcon sx={{ fontSize: 16 }} />;
      case 'escalated':
        return <PsychologyIcon sx={{ fontSize: 16 }} />;
      case 'resolved':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      default:
        return <CategoryIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
      case 'closed':
        return <CheckCircleIcon sx={{ fontSize: 16, color: '#666' }} />;
      default:
        return <CheckCircleIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load data: {error}
        </Alert>
      </Box>
    );
  }

  if (!data.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No user data found in database
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
          📊 Database Inspector
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#ccc", mb: 3 }}>
          View and search user chat data
        </Typography>
        
        <TextField
          fullWidth
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#666" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#2a2a2a",
              "& fieldset": {
                borderColor: "#444",
              },
              "&:hover fieldset": {
                borderColor: "#666",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ff6b35",
              },
            },
            "& .MuiInputBase-input": {
              color: "white",
            },
          }}
        />
      </Box>

      {/* User Cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {filteredData.map((user) => (
          <Card
            key={user._id}
            sx={{
              backgroundColor: "#2a2a2a",
              border: "1px solid #333",
              borderRadius: 2,
            }}
          >
            <CardHeader
              sx={{
                backgroundColor: "#333",
                "& .MuiCardHeader-content": {
                  color: "white",
                },
              }}
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#ff6b35" }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: "white" }}>
                      {user.name || "Unknown User"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              }
              action={
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <Chip
                    label={`${user.chats.length} Chats`}
                    size="small"
                    sx={{ bgcolor: "#ff6b35", color: "white" }}
                  />
                  <Chip
                    label={user.vibe || "neutral"}
                    size="small"
                    sx={{ bgcolor: "#444", color: "white" }}
                  />
                  {user.category && (
                    <Chip
                      icon={getCategoryIcon(user.category)}
                      label={user.category}
                      size="small"
                      sx={{ 
                        bgcolor: getCategoryColor(user.category), 
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                  )}
                  {user.status && (
                    <Chip
                      icon={getStatusIcon(user.status)}
                      label={user.status}
                      size="small"
                      sx={{ 
                        bgcolor: user.status === 'active' ? '#4caf50' : '#666', 
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                  )}
                  <IconButton
                    onClick={() => handleUserToggle(user._id)}
                    sx={{ color: "white" }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedUsers.includes(user._id) ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </IconButton>
                </Box>
              }
            />
            
            <Collapse in={expandedUsers.includes(user._id)}>
              <CardContent>
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationIcon sx={{ color: "#666", fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      {user.location?.city || "?"}, {user.location?.country || "?"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ComputerIcon sx={{ color: "#666", fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      {user.device?.platform || "Unknown"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TimeIcon sx={{ color: "#666", fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: "#ccc" }}>
                      Last: {user?.chats[0]?.last_activity || "N/A"}
                    </Typography>
                  </Box>
                  {user.category && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getCategoryIcon(user.category)}
                      <Typography variant="body2" sx={{ color: getCategoryColor(user.category), fontWeight: "bold" }}>
                        {user.category}
                      </Typography>
                    </Box>
                  )}
                  {user.status && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getStatusIcon(user.status)}
                      <Typography variant="body2" sx={{ 
                        color: user.status === 'active' ? '#4caf50' : '#666', 
                        fontWeight: "bold" 
                      }}>
                        {user.status}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 3, borderColor: "#444" }} />

                {user.chats.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#666", fontStyle: "italic" }}>
                    No chats found for this user
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                      Chat History
                    </Typography>
                    {user.chats.map((chat, index) => (
                      <Card
                        key={chat.chat_id}
                        sx={{
                          backgroundColor: "#333",
                          border: "1px solid #444",
                        }}
                      >
                        <CardHeader
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <ChatIcon sx={{ color: "#ff6b35" }} />
                              <Typography variant="subtitle1" sx={{ color: "white" }}>
                                Chat #{index + 1}
                              </Typography>
                              <Chip
                                label={chat.status?.toUpperCase() || "UNKNOWN"}
                                size="small"
                                color={getStatusColor(chat.status)}
                                sx={{ textTransform: "uppercase" }}
                              />
                              <Typography variant="body2" sx={{ color: "#ccc" }}>
                                {chat.total_messages || chat.messages.length} messages
                              </Typography>
                            </Box>
                          }
                          subheader={
                            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                ID: {chat.chat_id}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                Created: {new Date(chat.created_at).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#666" }}>
                                Last: {new Date(chat.last_activity).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          action={
                            <IconButton
                              onClick={() => handleChatToggle(chat.chat_id)}
                              sx={{ color: "white" }}
                            >
                              <ExpandMoreIcon
                                sx={{
                                  transform: expandedChats.includes(chat.chat_id) ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.3s",
                                }}
                              />
                            </IconButton>
                          }
                        />
                        
                        <Collapse in={expandedChats.includes(chat.chat_id)}>
                          <CardContent>
                            <Typography variant="subtitle2" sx={{ color: "white", mb: 2 }}>
                              Messages
                            </Typography>
                            <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                              {chat.messages.map((msg, i) => {
                                const isAgent = msg.role === "agent";
                                return (
                                  <Box
                                    key={i}
                                    sx={{
                                      display: "flex",
                                      justifyContent: isAgent ? "flex-end" : "flex-start",
                                      mb: 2,
                                    }}
                                  >
                                    <Paper
                                      sx={{
                                        maxWidth: "70%",
                                        p: 2,
                                        backgroundColor: isAgent ? "#ff6b35" : "#444",
                                        color: "white",
                                        borderRadius: 2,
                                      }}
                                    >
                                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                                          {msg.role.toUpperCase()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                          {new Date(msg.timestamp).toLocaleTimeString()}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                        {msg.text || "(no message text)"}
                                      </Typography>
                                    </Paper>
                                  </Box>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Collapse>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Collapse>
          </Card>
        ))}
      </Box>
    </Box>
  );
}