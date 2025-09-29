"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const AIAgentReportsPage = () => {
  return (
    <PageContainer title="AI Agent Reports" description="View AI agent performance reports">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            AI Agent Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the AI Agent Reports page at /reports/ai-agent
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentReportsPage;
