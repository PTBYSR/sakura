"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SalesAgentPage = () => {
  return (
    <PageContainer title="Sales Agent" description="Manage sales agent configuration">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Sales Agent
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Sales Agent page at /ai-agent/sales-agent
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SalesAgentPage;