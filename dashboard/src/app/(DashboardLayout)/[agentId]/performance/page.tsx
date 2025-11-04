"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { useParams } from "next/navigation";

const AgentPerformancePage = () => {
  const params = useParams();
  const agentId = params.agentId as string;
  const { agent } = useAgents();
  
  // Check if the agent ID matches the requested agentId
  const isAgentMatch = agent.id === agentId;

  if (!isAgentMatch) {
    return (
      <PageContainer title="Agent Not Found" description="The requested agent was not found">
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Agent Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The agent you&apos;re looking for doesn&apos;t exist.
            </Typography>
          </Box>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`${agent.name} Performance`} description={`View ${agent.name} performance metrics`}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            {agent.name} Performance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the {agent.name} Performance page at /{agent.id}/performance
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AgentPerformancePage;

