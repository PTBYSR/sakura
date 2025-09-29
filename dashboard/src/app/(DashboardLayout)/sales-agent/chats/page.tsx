"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SalesAgentChatsPage = () => {
  return (
    <PageContainer title="Sales Agent Chats" description="View sales agent conversations">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Sales Agent Chats
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Sales Agent Chats page at /sales-agent/chats
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SalesAgentChatsPage;
