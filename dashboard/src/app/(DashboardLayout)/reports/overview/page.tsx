"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const ReportsOverviewPage = () => {
  return (
    <PageContainer title="Reports Overview" description="View comprehensive reports overview">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Reports Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Reports Overview page at /reports/overview
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ReportsOverviewPage;
