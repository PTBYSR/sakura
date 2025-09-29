"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const ARPLibraryPage = () => {
  return (
    <PageContainer title="ARP Library" description="Manage your Automated Response Protocols">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            ARP Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the ARP Library page at /arp
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ARPLibraryPage;

