"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const InboxPage = () => {
  return (
    <PageContainer title="Inbox" description="Manage your conversations">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Inbox
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Inbox page at /inbox
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default InboxPage;
