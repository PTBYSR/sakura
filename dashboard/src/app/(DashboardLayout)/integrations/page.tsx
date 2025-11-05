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
    <PageContainer title="Integrations" description="Manage integrations">
      <Container maxWidth="xl">
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
                Integrations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Connect Sakura with contact channels and business tools to enhance your workflow
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Chip 
                label={`${connectedCount}/${totalCount} Connected`} 
                color="success" 
                variant="outlined"
                size="small"
                sx={{ fontSize: "0.8rem" }}
              />
              <Button variant="contained" size="small" startIcon={<SettingsIcon sx={{ fontSize: "1rem" }} />} sx={{ fontSize: "0.875rem" }}>
                Manage All
              </Button>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>{connectedCount}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Connected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <ErrorIcon color="error" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>
                    {integrations.filter(i => i.status === 'disconnected').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Disconnected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <ScheduleIcon color="warning" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>
                    {integrations.filter(i => i.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <ApiIcon color="primary" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>{totalCount}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Total Available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Integrations Grid */}
          <Grid container spacing={2}>
            {integrations.map((integration) => (
              <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={integration.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <Box sx={{ fontSize: "1rem", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {integration.icon}
                        </Box>
                      </Avatar>
                    }
                    action={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {getStatusIcon(integration.status)}
                        <Chip 
                          label={integration.status} 
                          color={getStatusColor(integration.status) as any}
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </Box>
                    }
                    title={integration.name}
                    titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
                    subheader={
                      <Chip 
                        label={integration.category} 
                        color={getCategoryColor(integration.category) as any}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 20, mt: 0.5 }}
                      />
                    }
                    subheaderTypographyProps={{ component: "div" }}
                    sx={{ pb: 1, pt: 2 }}
                  />
                  <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.85rem" }}>
                      {integration.description}
                    </Typography>
                    
                    {integration.lastSync && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                        Last sync: {integration.lastSync}
                      </Typography>
                    )}
                    
                    {integration.error && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75, fontSize: "0.75rem" }}>
                        Error: {integration.error}
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ p: 1.5, pt: 0 }}>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        disabled={integration.status === 'connected'}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {integration.status === 'connected' ? 'Connected' : 'Connect'}
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small"
                        disabled={integration.status !== 'connected'}
                        sx={{ fontSize: "0.8rem" }}
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 2 }}>
              Integration Categories
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader 
                    title="Social Platforms"
                    titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
                    avatar={<Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><FacebookIcon sx={{ fontSize: "1rem" }} /></Avatar>}
                    sx={{ pb: 1, pt: 2 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.85rem" }}>
                      Connect with popular social media platforms and messaging services
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><SlackIcon sx={{ fontSize: "1rem" }} /></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Slack</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Team communication</Typography>} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><DiscordIcon sx={{ fontSize: "1rem" }} /></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Discord</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Community management</Typography>} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><WhatsAppIcon sx={{ fontSize: "1rem" }} /></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>WhatsApp</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Customer support</Typography>} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid sx={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader 
                    title="API & Automation"
                    titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
                    avatar={<Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}><ApiIcon sx={{ fontSize: "1rem" }} /></Avatar>}
                    sx={{ pb: 1, pt: 2 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: "0.85rem" }}>
                      Connect with external APIs and automation platforms
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><ApiIcon sx={{ fontSize: "1rem" }} /></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Custom APIs</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>External service integration</Typography>} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><WebhookIcon sx={{ fontSize: "1rem" }} /></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Webhooks</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Real-time data sync</Typography>} />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><ZapierIcon sx={{ fontSize: "1rem" }} /></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Zapier</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>5000+ app connections</Typography>} />
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
