"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SalesAgentPerformancePage = () => {
  return (
    <PageContainer title="Sales Agent Performance" description="View sales agent performance metrics">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Sales Agent Performance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Sales Agent Performance page at /sales-agent/performance
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SalesAgentPerformancePage;
