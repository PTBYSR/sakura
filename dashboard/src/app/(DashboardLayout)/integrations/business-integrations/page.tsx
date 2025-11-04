"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Avatar,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Store as ShopifyIcon,
  Payment as PaystackIcon,
  TableChart as ExcelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  UploadFile as UploadIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface BusinessIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected';
  color: string;
}

const BusinessIntegrationsPage = () => {
  const [integrations] = useState<BusinessIntegration[]>([
    {
      id: "shopify",
      name: "Shopify",
      description: "Connect with Shopify store for e-commerce data synchronization",
      icon: <ShopifyIcon />,
      status: "disconnected",
      color: "#96BF48",
    },
    {
      id: "paystack",
      name: "Paystack",
      description: "Integrate with Paystack for payment processing and transaction management",
      icon: <PaystackIcon />,
      status: "disconnected",
      color: "#00C851",
    },
    {
      id: "excel-editor",
      name: "Excel Editor",
      description: "Upload and edit Excel files for data management",
      icon: <ExcelIcon />,
      status: "disconnected",
      color: "#1976d2",
    },
  ]);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon color="success" sx={{ fontSize: "1rem" }} />;
      case 'disconnected': return <ErrorIcon color="error" sx={{ fontSize: "1rem" }} />;
      default: return <ScheduleIcon color="action" sx={{ fontSize: "1rem" }} />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'success' : 'error';
  };

  const handleConnect = (integrationId: string) => {
    // Placeholder for connect functionality
    console.log(`Connect ${integrationId}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setExcelFileName(file.name);
    }
  };

  return (
    <PageContainer title="Business Integrations" description="Connect with business tools and services">
      <Container maxWidth="lg">
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
              Business Integrations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
              Connect Sakura with your business tools
            </Typography>
          </Box>

          {/* Integration Cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Shopify Integration */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: integrations[0].color, width: 48, height: 48 }}>
                      {integrations[0].icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {integrations[0].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                        {integrations[0].description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {getStatusIcon(integrations[0].status)}
                    <Chip
                      label={integrations[0].status}
                      color={getStatusColor(integrations[0].status) as any}
                      size="small"
                      sx={{ fontSize: "0.75rem", height: 24 }}
                    />
                    <Button
                      variant={integrations[0].status === 'connected' ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => handleConnect(integrations[0].id)}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {integrations[0].status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Paystack Integration */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: integrations[1].color, width: 48, height: 48 }}>
                      {integrations[1].icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                        {integrations[1].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                        {integrations[1].description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {getStatusIcon(integrations[1].status)}
                    <Chip
                      label={integrations[1].status}
                      color={getStatusColor(integrations[1].status) as any}
                      size="small"
                      sx={{ fontSize: "0.75rem", height: 24 }}
                    />
                    <Button
                      variant={integrations[1].status === 'connected' ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => handleConnect(integrations[1].id)}
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {integrations[1].status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Excel Editor */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: integrations[2].color, width: 48, height: 48 }}>
                    {integrations[2].icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                      {integrations[2].name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                      {integrations[2].description}
                    </Typography>
                  </Box>
                </Box>

                {/* File Upload Section */}
                <Box sx={{ mt: 2 }}>
                  <input
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    id="excel-file-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="excel-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon sx={{ fontSize: "1rem" }} />}
                      size="small"
                      sx={{ fontSize: "0.875rem", mb: 1.5 }}
                    >
                      Upload Excel File
                    </Button>
                  </label>
                  {excelFileName && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                        Selected: {excelFileName}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Edit Section */}
                {excelFile && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon sx={{ fontSize: "1rem" }} />}
                      size="small"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      Edit Excel File
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default BusinessIntegrationsPage;

