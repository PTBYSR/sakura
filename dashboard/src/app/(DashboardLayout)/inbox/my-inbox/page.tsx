"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const MyInboxPage = () => {
  return (
    <PageContainer title="My Inbox" description="Manage your personal inbox">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            My Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the My Inbox page at /inbox/my-inbox
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default MyInboxPage;