"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { authClient } from "@/lib/auth-client";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const ContactChannelsPage = () => {
  const { data: session } = authClient.useSession();
  const [widgetCode, setWidgetCode] = useState("");
  const [widgetUrl, setWidgetUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  useEffect(() => {
    // Get the frontend URL for widget script (must be inside useEffect to avoid SSR issues)
    const FRONTEND_URL =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    // Generate widget code based on user session
    if (session?.user) {
      const userId = session.user.id;
      const userEmail = session.user.email;
      
      // Generate widget script
      const script = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${FRONTEND_URL}/widget.js';
    script.setAttribute('data-user-id', '${userId}');
    script.setAttribute('data-email', '${userEmail}');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-api-url', '${API_BASE_URL}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

      setWidgetCode(script);
      setWidgetUrl(`${FRONTEND_URL}/widget.js`);
    } else {
      // Set default values even without session
      const defaultScript = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${FRONTEND_URL}/widget.js';
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-api-url', '${API_BASE_URL}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
      setWidgetCode(defaultScript);
      setWidgetUrl(`${FRONTEND_URL}/widget.js`);
    }
    setLoading(false);
  }, [session]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(widgetCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(widgetUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Contact Channels" description="Get your widget link">
        <Container maxWidth="md">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <CircularProgress />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Contact Channels" description="Get your widget link">
      <Container maxWidth="md">
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
              Widget Link
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
              Copy and embed this code on your website to enable the Sakura chat widget
            </Typography>
          </Box>

          {/* Widget Code Card */}
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <CodeIcon sx={{ color: "primary.main", fontSize: "1.25rem" }} />
                <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  Embed Code
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={widgetCode}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: "flex-start", mt: 1 }}>
                      <IconButton
                        onClick={handleCopyCode}
                        size="small"
                        sx={{ color: copySuccess ? "success.main" : "inherit" }}
                      >
                        {copySuccess ? (
                          <CheckCircleIcon sx={{ fontSize: "1rem" }} />
                        ) : (
                          <CopyIcon sx={{ fontSize: "1rem" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  },
                }}
              />

              <Box sx={{ mt: 2, display: "flex", gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<CopyIcon sx={{ fontSize: "1rem" }} />}
                  onClick={handleCopyCode}
                  size="small"
                  sx={{ fontSize: "0.875rem" }}
                >
                  {copySuccess ? "Copied!" : "Copy Code"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Widget URL Card */}
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <CodeIcon sx={{ color: "primary.main", fontSize: "1.25rem" }} />
                <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  Widget Script URL
                </Typography>
              </Box>

              <TextField
                fullWidth
                value={widgetUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleCopyUrl}
                        size="small"
                        sx={{ color: copySuccess ? "success.main" : "inherit" }}
                      >
                        {copySuccess ? (
                          <CheckCircleIcon sx={{ fontSize: "1rem" }} />
                        ) : (
                          <CopyIcon sx={{ fontSize: "1rem" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                  },
                }}
              />

              <Alert severity="info" sx={{ mt: 2, fontSize: "0.875rem" }}>
                Add this script tag to your website&apos;s HTML head section to enable the chat widget.
              </Alert>
            </CardContent>
          </Card>

          {/* Snackbar for copy feedback */}
          <Snackbar
            open={copySuccess}
            autoHideDuration={3000}
            onClose={() => setCopySuccess(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity="success" onClose={() => setCopySuccess(false)}>
              Copied to clipboard!
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ContactChannelsPage;
