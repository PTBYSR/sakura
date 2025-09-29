"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const KnowledgeBaseFilesPage = () => {
  return (
    <PageContainer title="Knowledge Base Files" description="Manage file-based knowledge sources">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Knowledge Base Files
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Knowledge Base Files page at /knowledge-base/files
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default KnowledgeBaseFilesPage;
