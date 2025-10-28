"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const AllSOPsPage = () => {
  return (
    <PageContainer title="All SOPs" description="View all Standard Operating Procedures">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            All SOPs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the All SOPs page at /sops/all
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AllSOPsPage;
