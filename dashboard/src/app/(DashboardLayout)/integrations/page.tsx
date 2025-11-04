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
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  Api as ApiIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Message as SlackIcon,
  Forum as DiscordIcon,
  Webhook as WebhookIcon,
  AutoAwesome as ZapierIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  category: 'api' | 'social' | 'automation' | 'webhook';
  lastSync?: string;
  error?: string;
}

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "slack",
      name: "Slack",
      description: "Connect Sakura to your Slack workspace for seamless team communication",
      icon: <SlackIcon />,
      status: "connected",
      category: "social",
      lastSync: "2 minutes ago"
    },
    {
      id: "discord",
      name: "Discord",
      description: "Integrate with Discord servers for community management",
      icon: <DiscordIcon />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Connect WhatsApp Business API for customer support",
      icon: <WhatsAppIcon />,
      status: "connected",
      category: "social",
      lastSync: "5 minutes ago"
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Integrate Telegram bots for automated messaging",
      icon: <TelegramIcon />,
      status: "pending",
      category: "social"
    },
    {
      id: "facebook",
      name: "Facebook Messenger",
      description: "Connect Facebook Messenger for customer interactions",
      icon: <FacebookIcon />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Integrate Instagram Direct Messages",
      icon: <InstagramIcon />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "api",
      name: "Custom API",
      description: "Connect to external APIs and services",
      icon: <ApiIcon />,
      status: "connected",
      category: "api",
      lastSync: "1 hour ago"
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Configure webhooks for real-time data synchronization",
      icon: <WebhookIcon />,
      status: "connected",
      category: "webhook",
      lastSync: "30 minutes ago"
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 5000+ apps through Zapier automation",
      icon: <ZapierIcon />,
      status: "disconnected",
      category: "automation"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon color="success" fontSize="small" />;
      case 'disconnected': return <ErrorIcon color="error" fontSize="small" />;
      case 'pending': return <ScheduleIcon color="warning" fontSize="small" />;
      default: return <ScheduleIcon color="action" fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'primary';
      case 'api': return 'secondary';
      case 'automation': return 'info';
      case 'webhook': return 'warning';
      default: return 'default';
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;

  return (
    <PageContainer title="Integrations" description="Manage third-party integrations">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Integrations
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Connect Sakura with contact channels and business tools to enhance your workflow
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`${connectedCount}/${totalCount} Connected`} 
                color="success" 
                variant="outlined"
              />
              <Button variant="contained" startIcon={<SettingsIcon />}>
                Manage All
              </Button>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{connectedCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">
                    {integrations.filter(i => i.status === 'disconnected').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Disconnected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">
                    {integrations.filter(i => i.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ApiIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{totalCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Integrations Grid */}
          <Grid container spacing={3}>
            {integrations.map((integration) => (
              <Grid item xs={12} sm={6} md={4} key={integration.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                      <Chip 
                        label={integration.category} 
                        color={getCategoryColor(integration.category) as any}
                        size="small"
                        variant="outlined"
                      />
                    }
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {integration.description}
                    </Typography>
                    
                    {integration.lastSync && (
                      <Typography variant="caption" color="text.secondary">
                        Last sync: {integration.lastSync}
                      </Typography>
                    )}
                    
                    {integration.error && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        Error: {integration.error}
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        disabled={integration.status === 'connected'}
                      >
                        {integration.status === 'connected' ? 'Connected' : 'Connect'}
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
                    title="Social Platforms"
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><FacebookIcon /></Avatar>}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect with popular social media platforms and messaging services
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><SlackIcon /></ListItemIcon>
                        <ListItemText primary="Slack" secondary="Team communication" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DiscordIcon /></ListItemIcon>
                        <ListItemText primary="Discord" secondary="Community management" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><WhatsAppIcon /></ListItemIcon>
                        <ListItemText primary="WhatsApp" secondary="Customer support" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="API & Automation"
                    avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><ApiIcon /></Avatar>}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect with external APIs and automation platforms
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><ApiIcon /></ListItemIcon>
                        <ListItemText primary="Custom APIs" secondary="External service integration" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><WebhookIcon /></ListItemIcon>
                        <ListItemText primary="Webhooks" secondary="Real-time data sync" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><ZapierIcon /></ListItemIcon>
                        <ListItemText primary="Zapier" secondary="5000+ app connections" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default IntegrationsPage;
