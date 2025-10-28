"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const AIAgentPage = () => {
  const { agent } = useAgents();

  return (
    <PageContainer title="AI Agent" description="Manage your AI agent">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            AI Agent
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Current Agent: {agent.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Type: {agent.type}
          </Typography>
          {agent.description && (
            <Typography variant="body1" color="text.secondary">
              Description: {agent.description}
            </Typography>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentPage;
