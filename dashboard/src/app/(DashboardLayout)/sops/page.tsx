"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SOPsLibraryPage = () => {
  return (
    <PageContainer title="SOPs Library" description="Manage your Standard Operating Procedures">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            SOPs Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the SOPs Library page at /sops
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SOPsLibraryPage;

