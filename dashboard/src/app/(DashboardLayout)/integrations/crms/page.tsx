"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Avatar,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Api as ApiIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface CRMIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  color: string;
  lastSync: string;
  recordsSynced: number;
  syncFrequency: string;
  features: string[];
  category: 'ecommerce' | 'automation' | 'crm' | 'api';
}

const CRMsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [integrationConfig, setIntegrationConfig] = useState({
    apiKey: '',
    endpoint: '',
    syncFrequency: '15min',
    autoSync: true,
    dataMapping: 'default'
  });

  const [integrations, setIntegrations] = useState<CRMIntegration[]>([
    {
      id: "shopify",
      name: "Shopify",
      description: "Connect with Shopify store for e-commerce data synchronization",
      icon: <TrendingUpIcon />,
      status: "connected",
      color: "#96BF48",
      lastSync: "2 minutes ago",
      recordsSynced: 1247,
      syncFrequency: "Every 15 minutes",
      features: ["Product sync", "Order management", "Customer data", "Inventory tracking"],
      category: "ecommerce"
    },
    {
      id: "paystack",
      name: "Paystack",
      description: "Integrate with Paystack for payment processing and transaction management",
      icon: <TrendingUpIcon />,
      status: "connected",
      color: "#00C851",
      lastSync: "1 minute ago",
      recordsSynced: 892,
      syncFrequency: "Real-time",
      features: ["Payment processing", "Transaction tracking", "Customer billing", "Refund management"],
      category: "ecommerce"
    },
    {
      id: "zendesk",
      name: "Zendesk",
      description: "Connect Zendesk for customer support ticket management and analytics",
      icon: <TrendingUpIcon />,
      status: "disconnected",
      color: "#17494D",
      lastSync: "Never",
      recordsSynced: 0,
      syncFrequency: "Every hour",
      features: ["Ticket management", "Customer support", "Analytics", "Multi-channel support"],
      category: "crm"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon color="success" fontSize="small" />;
      case 'disconnected': return <ErrorIcon color="error" fontSize="small" />;
      case 'pending': return <ScheduleIcon color="warning" fontSize="small" />;
      case 'error': return <ErrorIcon color="error" fontSize="small" />;
      default: return <ScheduleIcon color="action" fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ecommerce': return 'primary';
      case 'automation': return 'secondary';
      case 'crm': return 'info';
      case 'api': return 'warning';
      default: return 'default';
    }
  };

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'connected' as const, lastSync: 'Just now' }
        : i
    ));
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'disconnected' as const, recordsSynced: 0 }
        : i
    ));
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const totalRecords = integrations.reduce((sum, i) => sum + i.recordsSynced, 0);
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;

  return (
    <PageContainer title="CRMs" description="Manage CRM and business integrations">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                CRM & Business Integrations
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Connect Sakura with CRMs, e-commerce platforms, and business tools
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`${connectedIntegrations}/${integrations.length} Connected`} 
                color="success" 
                variant="outlined"
              />
              <Button variant="contained" startIcon={<SyncIcon />}>
                Sync All
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StorageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{connectedIntegrations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Integrations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SyncIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{totalRecords.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Records Synced
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SpeedIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">
                    {integrations.filter(i => i.syncFrequency === 'Real-time').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time Sync
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{errorIntegrations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sync Errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Integration Cards */}
          <Grid container spacing={3}>
            {integrations.map((integration) => (
              <Grid item xs={12} sm={6} md={4} key={integration.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: integration.color }}>
                        {integration.icon}
                      </Avatar>
                    }
                    action={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(integration.status)}
                        <Chip 
                          label={integration.status} 
                          color={getStatusColor(integration.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    title={integration.name}
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={integration.category} 
                          color={getCategoryColor(integration.category) as any}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {integration.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Sync Status
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {integration.recordsSynced.toLocaleString()} records
                        </Typography>
                        <Typography variant="body2">
                          {integration.syncFrequency}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={integration.status === 'connected' ? 100 : 0} 
                        color={integration.status === 'connected' ? 'success' : 'error'}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Features
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {integration.features.slice(0, 2).map((feature, index) => (
                          <Chip 
                            key={index}
                            label={feature} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                        {integration.features.length > 2 && (
                          <Chip 
                            label={`+${integration.features.length - 2} more`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Last sync: {integration.lastSync}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant={integration.status === 'connected' ? 'outlined' : 'contained'}
                        size="small" 
                        fullWidth
                        onClick={() => integration.status === 'connected' ? handleDisconnect(integration.id) : handleConnect(integration.id)}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small"
                        disabled={integration.status !== 'connected'}
                      >
                        Settings
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Integration Categories */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom>
              Integration Categories
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="E-commerce Platforms"
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><TrendingUpIcon /></Avatar>}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect with e-commerce platforms for product and order management
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                        <ListItemText primary="Shopify" secondary="E-commerce platform" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                        <ListItemText primary="Paystack" secondary="Payment processing" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="CRM & Automation"
                    avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><ApiIcon /></Avatar>}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Integrate with CRM systems and automation platforms
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                        <ListItemText primary="Zendesk" secondary="Customer support platform" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Sync Performance */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Sync Performance
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">98.5%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Success Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">2.3s</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Sync Time
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">24/7</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monitoring
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default CRMsPage;
