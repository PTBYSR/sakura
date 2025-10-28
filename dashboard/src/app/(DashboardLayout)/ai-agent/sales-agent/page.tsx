"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const SalesAgentPage = () => {
  const { agent } = useAgents();

  return (
    <PageContainer title="Sales Agent" description="Manage sales agent configuration">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Sales Agent Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Agent Name: {agent.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Type: {agent.type}
          </Typography>
          {agent.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Description: {agent.description}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary">
            This is the Sales Agent configuration page at /ai-agent/sales-agent
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SalesAgentPage;