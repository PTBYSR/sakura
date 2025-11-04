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
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Save as SaveIcon,
  SmartToy as SmartToyIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const AIAgentSettingsPage = () => {
  const { agent, updateAgent } = useAgents();
  
  const [agentName, setAgentName] = useState(agent.name || "");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  // Load system prompt from backend on mount
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/system-prompt`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load system prompt: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && data.system_prompt) {
          setSystemPrompt(data.system_prompt);
        }
      } catch (error: any) {
        console.error("Error loading system prompt:", error);
        setSnackbar({
          open: true,
          message: "Failed to load system prompt. Using default.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSystemPrompt();
  }, []);

  const handleSave = async () => {
    if (!agentName.trim()) {
      setSnackbar({
        open: true,
        message: "Agent name cannot be empty",
        severity: "error",
      });
      return;
    }

    if (!systemPrompt.trim()) {
      setSnackbar({
        open: true,
        message: "System prompt cannot be empty",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      // Update agent name in context
      updateAgent({
        name: agentName,
      });

      // Update system prompt in backend
      const response = await fetch(`${API_BASE_URL}/api/system-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_prompt: systemPrompt,
        }),
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update system prompt");
      }

      setSnackbar({
        open: true,
        message: "Settings saved successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to save settings",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="AI Agent Settings" description="Configure your AI agent">
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="AI Agent Settings" description="Configure your AI agent">
      <Container maxWidth="md">
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
                AI Agent Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Configure your AI agent&apos;s name and behavior
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: "1rem" }} />}
              onClick={handleSave}
              disabled={saving}
              size="small"
              sx={{ fontSize: "0.875rem" }}
            >
              {saving ? <CircularProgress size={20} /> : "Save Settings"}
            </Button>
          </Box>

          {/* Agent Settings Card */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                  <SmartToyIcon sx={{ fontSize: "1rem" }} />
                </Avatar>
              }
              title="Agent Configuration"
              titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
              sx={{ pb: 1, pt: 2 }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="AI Agent Name"
                  fullWidth
                  size="small"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Enter your AI agent name"
                  sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
                />

                <TextField
                  label="System Prompt"
                  fullWidth
                  multiline
                  rows={12}
                  size="small"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter the system prompt that defines your AI agent's behavior and personality..."
                  helperText="This prompt defines how your AI agent responds to users. Be specific about tone, style, and behavior."
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                    },
                    "& .MuiFormHelperText-root": { fontSize: "0.75rem" },
                  }}
                />

                <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                  The system prompt is used to guide your AI agent&apos;s responses. Changes will take effect immediately after saving.
                </Alert>
              </Box>
            </CardContent>
          </Card>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentSettingsPage;
