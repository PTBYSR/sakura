"use client";
import React from "react";
import { Box, Typography, Container, Grid2 as Grid } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import ARPCustomization from "@/app/(DashboardLayout)/components/agent/ARPCustomization";

const SalesAgentSettingsPage = () => {
  return (
    <PageContainer title="Sales Agent Settings" description="Configure sales agent settings">
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Sales Agent Settings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Configure your Sales Agent&apos;s behavior, responses, and capabilities
          </Typography>

          <Grid container spacing={3}>
            <Grid size={12}>
              <ARPCustomization agentId="sales-agent" />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default SalesAgentSettingsPage;
