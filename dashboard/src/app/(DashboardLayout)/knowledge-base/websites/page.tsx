"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const KnowledgeBaseWebsitesPage = () => {
  return (
    <PageContainer title="Knowledge Base Websites" description="Manage website knowledge sources">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Knowledge Base Websites
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the Knowledge Base Websites page at /knowledge-base/websites
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default KnowledgeBaseWebsitesPage;
