"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Chat as ChatIcon,
  People as PeopleIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface ReportsStats {
  total_chats: number;
  agent_chats: number;
  channels: {
    whatsapp: number;
    instagram: number;
    website: number;
  };
}

const ReportsOverviewPage = () => {
  const [stats, setStats] = useState<ReportsStats | null>(null);
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
        
        const response = await fetch(`${API_BASE_URL}/api/reports/stats`, {
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
            total_chats: data.total_chats || 0,
            agent_chats: data.agent_chats || 0,
            channels: {
              whatsapp: data.channels?.whatsapp || 0,
              instagram: data.channels?.instagram || 0,
              website: data.channels?.website || 0,
            },
          });
        }
      } catch (err: any) {
        console.error("Error fetching reports stats:", err);
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageContainer title="Reports Overview" description="View chat statistics and metrics">
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Reports Overview" description="View chat statistics and metrics">
        <Container maxWidth="lg">
          <Box sx={{ py: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Reports Overview" description="View chat statistics and metrics">
      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
              Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
              Basic chat statistics and metrics
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
            {/* Total Chats */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChatIcon sx={{ color: "white", fontSize: "1.5rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontSize: "1.75rem", fontWeight: 600 }}>
                      {stats?.total_chats.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      Total Chats
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Agent Chats */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: "success.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PeopleIcon sx={{ color: "white", fontSize: "1.5rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontSize: "1.75rem", fontWeight: 600 }}>
                      {stats?.agent_chats.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      Agent Chats
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Channel Breakdown Header Card */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: "info.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LanguageIcon sx={{ color: "white", fontSize: "1.5rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontSize: "1.75rem", fontWeight: 600 }}>
                      {((stats?.channels.whatsapp || 0) + (stats?.channels.instagram || 0) + (stats?.channels.website || 0)).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      Total Channels
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Channel Breakdown */}
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 2 }}>
                Chats by Channel
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* WhatsApp */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <WhatsAppIcon sx={{ color: "#25D366", fontSize: "1.5rem" }} />
                    <Typography variant="body1" sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      WhatsApp
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                    {stats?.channels.whatsapp.toLocaleString() || 0}
                  </Typography>
                </Box>

                {/* Instagram */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <InstagramIcon sx={{ color: "#E4405F", fontSize: "1.5rem" }} />
                    <Typography variant="body1" sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      Instagram
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                    {stats?.channels.instagram.toLocaleString() || 0}
                  </Typography>
                </Box>

                {/* Website */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <LanguageIcon sx={{ color: "primary.main", fontSize: "1.5rem" }} />
                    <Typography variant="body1" sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      Website
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                    {stats?.channels.website.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ReportsOverviewPage;
