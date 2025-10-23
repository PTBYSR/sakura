"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { useParams } from "next/navigation";

const AgentSettingsPage = () => {
  const params = useParams();
  const agentId = params.agentId as string;
  const { agents } = useAgents();
  
  const agent = agents.find(a => a.id === agentId);

  if (!agent) {
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
    <PageContainer title={`${agent.name} Settings`} description={`Configure ${agent.name} settings`}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            {agent.name} Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the {agent.name} Settings page at /{agent.id}/settings
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AgentSettingsPage;

