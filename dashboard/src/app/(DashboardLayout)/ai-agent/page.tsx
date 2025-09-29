"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const AIAgentPage = () => {
  return (
    <PageContainer title="AI Agent" description="Manage your AI agents">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            AI Agent
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the AI Agent page at /ai-agent
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentPage;
