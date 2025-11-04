"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface ChatInstance {
  chat_id: string;
  status: string;
  created_at: string;
  last_activity: string;
  total_messages: number;
  messages: Array<{
    role: string;
    text: string;
    content: string;
    timestamp: string;
    read: boolean;
  }>;
}

interface UserChatsResponse {
  user_id: string;
  user_name: string;
  user_email: string;
  chats: ChatInstance[];
  total_chats: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function MyChatsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; id: string } | null>(null);

  useEffect(() => {
    // Check authentication
    if (!isPending && !session) {
      router.push("/authentication/login");
      return;
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchMyChats = async () => {
      if (!session?.user?.id) {
        console.log("No session or user ID available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get user ID from session
        const userId = session.user.id;
        console.log("Fetching chats for user ID:", userId);
        
        // Fetch user's chats
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/chats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            console.log("User not found in database, showing empty state");
            setChats([]);
            setUserInfo({
              name: session.user.name || "User",
              email: session.user.email || "",
              id: userId,
            });
            setLoading(false);
            return;
          }
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch chats: ${response.status} - ${errorText}`);
        }

        const data: UserChatsResponse = await response.json();
        console.log("Fetched chats data:", data);
        setChats(data.chats || []);
        setUserInfo({
          name: data.user_name,
          email: data.user_email,
          id: data.user_id,
        });
      } catch (err: any) {
        console.error("Error fetching chats:", err);
        setError(err.message || "Failed to load your chats");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchMyChats();
    } else if (!isPending) {
      // Session loaded but no user - set loading to false
      setLoading(false);
    }
  }, [session, isPending]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getLastMessage = (chat: ChatInstance) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "No messages yet";
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.text || lastMsg.content || "No message content";
  };

  // Show loading state while checking session
  if (isPending || (loading && !session)) {
    return (
      <PageContainer title="My Chats" description="View your chat history">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Loading...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  // If no session after loading, show message (don't return null)
  if (!session) {
    return (
      <PageContainer title="My Chats" description="View your chat history">
        <Box sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please log in to view your chats.
          </Alert>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            You need to be logged in to view your chat history.
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Chats" description="View your chat history">
      <Box sx={{ p: 3 }}>
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              Debug: Session: {session ? "✓" : "✗"} | User ID: {session?.user?.id || "N/A"} | Loading: {loading ? "Yes" : "No"}
            </Typography>
          </Alert>
        )}

        {/* User Info */}
        {userInfo ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 1, color: "text.primary" }}>
              Welcome, {userInfo.name}!
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {userInfo.email}
            </Typography>
            <Chip
              label={`${chats.length} ${chats.length === 1 ? "chat" : "chats"}`}
              color="primary"
              size="small"
            />
          </Box>
        ) : session?.user ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 1, color: "text.primary" }}>
              Welcome, {session.user.name || session.user.email || "User"}!
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {session.user.email}
            </Typography>
            <Chip
              label="Loading your chats..."
              color="primary"
              size="small"
            />
          </Box>
        ) : null}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Widget Link */}
        {userInfo ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your unique widget link:{" "}
              <strong>
                {typeof window !== "undefined" && `http://localhost:3000/widget/${userInfo.id}`}
              </strong>
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
              Copy this link to share with customers or embed on your website
            </Typography>
          </Alert>
        ) : session?.user?.id ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your unique widget link:{" "}
              <strong>
                {typeof window !== "undefined" && `http://localhost:3000/widget/${session.user.id}`}
              </strong>
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
              Copy this link to share with customers or embed on your website
            </Typography>
          </Alert>
        ) : null}

        {/* Chats List */}
        <Paper sx={{ p: 2, backgroundColor: "background.paper" }}>
          {chats.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
              }}
            >
              <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                No chats yet. Start a conversation using your widget!
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
                Your Chat History
              </Typography>
              <List>
                {chats.map((chat) => (
                  <ListItem
                    key={chat.chat_id}
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      onClick={() => setSelectedChat(selectedChat?.chat_id === chat.chat_id ? null : chat)}
                      sx={{
                        borderRadius: 1,
                        border: selectedChat?.chat_id === chat.chat_id ? 2 : 1,
                        borderColor: selectedChat?.chat_id === chat.chat_id ? "primary.main" : "divider",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="subtitle1" component="span" sx={{ fontWeight: "bold" }}>
                              Chat {chat.chat_id.substring(0, 8)}
                            </Typography>
                            <Chip
                              label={chat.status}
                              size="small"
                              color={chat.status === "open" ? "success" : "default"}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        }
                        primaryTypographyProps={{ component: "div" }}
                        secondaryTypographyProps={{ component: "div" }}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="div" sx={{ color: "text.secondary", mt: 0.5 }}>
                              {getLastMessage(chat)}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                              <Typography variant="caption" component="span" sx={{ color: "text.secondary" }}>
                                {formatDate(chat.last_activity)}
                              </Typography>
                              <Typography variant="caption" component="span" sx={{ color: "text.secondary" }}>
                                {chat.total_messages} {chat.total_messages === 1 ? "message" : "messages"}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {/* Selected Chat Messages */}
              {selectedChat && (
                <Paper
                  sx={{
                    mt: 3,
                    p: 2,
                    backgroundColor: "background.default",
                    maxHeight: "400px",
                    overflow: "auto",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Messages
                  </Typography>
                  <List>
                    {selectedChat.messages.map((msg, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          display: "flex",
                          justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                      >
                        <Paper
                          sx={{
                            p: 1.5,
                            maxWidth: "70%",
                            backgroundColor: msg.role === "user" ? "primary.main" : "background.paper",
                            color: msg.role === "user" ? "primary.contrastText" : "text.primary",
                          }}
                        >
                          <Typography variant="body2">{msg.text || msg.content}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: "block" }}>
                            {formatDate(msg.timestamp)}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          )}
        </Paper>
      </Box>
    </PageContainer>
  );
}

