"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const ReportsPage = () => {
  return (
    <PageContainer title="Reports" description="View analytics and reports">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Reports page at /reports
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ReportsPage;
