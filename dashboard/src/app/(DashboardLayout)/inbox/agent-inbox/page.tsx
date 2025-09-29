"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const AgentInboxPage = () => {
  return (
    <PageContainer title="Agent Inbox" description="Manage AI agent conversations">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Agent Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Agent Inbox page at /inbox/agent-inbox
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AgentInboxPage;