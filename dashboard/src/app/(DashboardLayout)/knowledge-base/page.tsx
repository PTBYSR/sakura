"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const KnowledgeBasePage = () => {
  return (
    <PageContainer title="Knowledge Base" description="Manage your knowledge base">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Knowledge Base
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Knowledge Base page at /knowledge-base
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default KnowledgeBasePage;
