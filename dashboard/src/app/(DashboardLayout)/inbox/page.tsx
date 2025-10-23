"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Divider,
} from "@mui/material";
import {
  ChatBubbleOutline,
  Person,
  TrendingUp,
  Schedule,
  CheckCircle,
  Warning as AlertCircle,
  SmartToy as Robot,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useRouter } from "next/navigation";

const InboxPage = () => {
  const router = useRouter();
  const [stats] = useState({
    totalChats: 24,
    activeChats: 8,
    resolvedToday: 16,
    avgResponseTime: "2m 30s",
    satisfaction: 4.8,
  });

  const [recentChats] = useState([
    {
      id: "1",
      name: "Paul Eme",
      lastMessage: "Hello",
      timestamp: "21s",
      unreadCount: 1,
      avatar: "P",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      lastMessage: "I need help with my policy",
      timestamp: "2m",
      unreadCount: 0,
      avatar: "S",
      status: "resolved",
    },
    {
      id: "3",
      name: "Mike Chen",
      lastMessage: "Thank you for your assistance",
      timestamp: "5m",
      unreadCount: 0,
      avatar: "M",
      status: "resolved",
    },
  ]);

  const [quickActions] = useState([
    {
      title: "My Inbox",
      description: "Manage your personal conversations",
      icon: <Person />,
      color: "#4caf50",
      href: "/inbox/my-inbox",
    },
    {
      title: "Agent Inbox",
      description: "Monitor AI agent conversations",
      icon: <Robot />,
      color: "#ff6b35",
      href: "/inbox/agent-inbox",
    },
  ]);

  return (
    <PageContainer title="Inbox" description="Manage your conversations">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
              Inbox Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: "#ccc" }}>
              Overview of all conversations and support metrics
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <ChatBubbleOutline sx={{ color: "#4caf50", fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                    {stats.totalChats}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Total Chats
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <AlertCircle sx={{ color: "#ff9800", fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                    {stats.activeChats}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Active Chats
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <CheckCircle sx={{ color: "#4caf50", fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                    {stats.resolvedToday}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Resolved Today
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Schedule sx={{ color: "#2196f3", fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                    {stats.avgResponseTime}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Avg Response
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <TrendingUp sx={{ color: "#9c27b0", fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                    {stats.satisfaction}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Satisfaction
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        startIcon={action.icon}
                        onClick={() => router.push(action.href)}
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          borderColor: action.color,
                          color: action.color,
                          "&:hover": {
                            borderColor: action.color,
                            backgroundColor: `${action.color}20`,
                          },
                        }}
                      >
                        <Box sx={{ textAlign: "left" }}>
                          <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            {action.description}
                          </Typography>
                        </Box>
                      </Button>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Recent Chats */}
            <Box sx={{ flex: "1 1 400px", minWidth: "400px" }}>
              <Card sx={{ backgroundColor: "#2a2a2a", border: "1px solid #333" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Recent Chats
                  </Typography>
                  <List>
                    {recentChats.map((chat, index) => (
                      <React.Fragment key={chat.id}>
                        <ListItem
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#3a3a3a",
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: chat.status === "active" ? "#ff6b35" : "#4caf50",
                                color: "white",
                              }}
                            >
                              {chat.avatar}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body1" sx={{ color: "white" }}>
                                  {chat.name}
                                </Typography>
                                <Chip
                                  label={chat.status}
                                  size="small"
                                  sx={{
                                    backgroundColor: chat.status === "active" ? "#ff6b35" : "#4caf50",
                                    color: "white",
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ color: "#ccc" }}>
                                {chat.lastMessage}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                              <Typography variant="caption" sx={{ color: "#ccc" }}>
                                {chat.timestamp}
                              </Typography>
                              {chat.unreadCount > 0 && (
                                <Badge badgeContent={chat.unreadCount} color="error" />
                              )}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < recentChats.length - 1 && <Divider sx={{ backgroundColor: "#333" }} />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Navigation Cards */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Card 
                sx={{ 
                  backgroundColor: "#2a2a2a", 
                  border: "1px solid #333",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#3a3a3a",
                  },
                }}
                onClick={() => router.push("/inbox/my-inbox")}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Person sx={{ color: "#4caf50", fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
                    My Inbox
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Manage your personal conversations and handle customer inquiries
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Card 
                sx={{ 
                  backgroundColor: "#2a2a2a", 
                  border: "1px solid #333",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#3a3a3a",
                  },
                }}
                onClick={() => router.push("/inbox/agent-inbox")}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Robot sx={{ color: "#ff6b35", fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
                    Agent Inbox
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    Monitor AI agent conversations and automated workflows
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Card 
                sx={{ 
                  backgroundColor: "#2a2a2a", 
                  border: "1px solid #333",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#3a3a3a",
                  },
                }}
                onClick={() => router.push("/reports")}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <TrendingUp sx={{ color: "#2196f3", fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
                    Reports
          </Typography>
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    View analytics and performance metrics for your conversations
          </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default InboxPage;