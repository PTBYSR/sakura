"use client";
import React from "react";
import { Box, Typography, Container } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SOPsEditorPage = () => {
  return (
    <PageContainer title="SOPs Editor" description="Create and edit Standard Operating Procedures">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            SOPs Editor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This is the SOPs Editor page at /sops/sops-editor
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SOPsEditorPage;
