"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Psychology as PsychologyIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

interface AgentStats {
  chats_responded_to: number;
  model: string;
  status: string;
  initialized: boolean;
}

const AIAgentOverviewPage = () => {
  const { agent } = useAgents();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/agent/stats`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          setStats({
            chats_responded_to: data.chats_responded_to || 0,
            model: data.model || "Unknown",
            status: data.status || "offline",
            initialized: data.initialized || false,
          });
        }
      } catch (err: any) {
        console.error("Error fetching agent stats:", err);
        setError(err.message || "Failed to load agent statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
                AI Agent Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Current Agent: {agent.name} ({agent.type})
              </Typography>
            </Box>
            <Chip 
              label={stats?.status === "online" ? "Online" : "Offline"} 
              color={stats?.status === "online" ? "success" : "error"} 
              variant="outlined"
              size="small"
              icon={stats?.status === "online" ? (
                <CheckCircleIcon sx={{ fontSize: "1rem" }} />
              ) : (
                <ErrorIcon sx={{ fontSize: "1rem" }} />
              )}
            />
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <MessageIcon color="primary" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>
                    {stats?.chats_responded_to.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Chats AI Agent Has Responded To
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <PsychologyIcon color="secondary" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>
                    {stats?.model || "Unknown"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    AI Model
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircleIcon 
                    color={stats?.status === "online" ? "success" : "error"} 
                    sx={{ fontSize: 32, mb: 0.75 }} 
                  />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>
                    {stats?.status === "online" ? "Online" : "Offline"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Live Status
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Agent Information */}
          <Card>
            <CardHeader 
              title="Agent Information"
              titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
              avatar={<Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}><PsychologyIcon sx={{ fontSize: "1rem" }} /></Avatar>}
              sx={{ pb: 1, pt: 2 }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, mb: 0.75 }}>
                    {agent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mb: 1.5 }}>
                    {agent.description || "AI customer support agent"}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={agent.type} color="primary" size="small" sx={{ fontSize: "0.75rem", height: 24 }} />
                    <Chip 
                      label={stats?.status === "online" ? "Active" : "Inactive"} 
                      color={stats?.status === "online" ? "success" : "default"} 
                      size="small" 
                      sx={{ fontSize: "0.75rem", height: 24 }} 
                    />
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 1 }}>
                    System Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {stats?.status === "online" ? (
                        <CheckCircleIcon color="success" sx={{ fontSize: "1rem" }} />
                      ) : (
                        <ErrorIcon color="error" sx={{ fontSize: "1rem" }} />
                      )}
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        AI Engine: {stats?.status === "online" ? "Running" : "Stopped"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color={stats?.initialized ? "success" : "disabled"} sx={{ fontSize: "1rem" }} />
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        Service Initialized: {stats?.initialized ? "Yes" : "No"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon color="primary" sx={{ fontSize: "1rem" }} />
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        Model: {stats?.model || "Unknown"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentOverviewPage;
