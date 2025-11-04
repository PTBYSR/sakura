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
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Send as TelegramIcon,
  Group as SlackIcon,
  Chat as DiscordIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface ContactChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  color: string;
  messagesToday: number;
  activeChats: number;
  lastSync: string;
  features: string[];
  widgetEnabled?: boolean;
}

const ContactChannelsPage = () => {
  const [widgetCode, setWidgetCode] = useState(`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://sakura-widget.com/widget.js';
    script.setAttribute('data-api-key', 'your-api-key');
    script.setAttribute('data-theme', 'light');
    document.head.appendChild(script);
  })();
</script>`);

  const [channels, setChannels] = useState<ContactChannel[]>([
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Connect WhatsApp Business API for customer support",
      icon: <WhatsAppIcon />,
      status: "connected",
      color: "#25D366",
      messagesToday: 89,
      activeChats: 5,
      lastSync: "5 minutes ago",
      features: ["Business API", "Media sharing", "Status updates", "Group chats"],
      widgetEnabled: true
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

  const handleConnect = (channelId: string) => {
    setChannels(prev => prev.map(c => 
      c.id === channelId 
        ? { ...c, status: 'connected' as const, lastSync: 'Just now' }
        : c
    ));
  };

  const handleDisconnect = (channelId: string) => {
    setChannels(prev => prev.map(c => 
      c.id === channelId 
        ? { ...c, status: 'disconnected' as const, messagesToday: 0, activeChats: 0 }
        : c
    ));
  };

  const connectedChannels = channels.filter(c => c.status === 'connected').length;
  const totalMessages = channels.reduce((sum, c) => sum + c.messagesToday, 0);
  const totalActiveChats = channels.reduce((sum, c) => sum + c.activeChats, 0);
  const widgetChannels = channels.filter(c => c.widgetEnabled).length;

  return (
    <PageContainer title="Contact Channels" description="Manage customer communication channels">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Contact Channels
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Connect Sakura with your customer communication channels and embed widgets
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                label={`${connectedChannels}/${channels.length} Connected`} 
                color="success" 
                variant="outlined"
              />
              <Button variant="contained">
                Bulk Settings
              </Button>
            </Box>
          </Box>

          {/* Widget Code Section */}
          <Card sx={{ mb: 4 }}>
            <CardHeader 
              title="Widget Integration Code"
              subheader="Copy this code to embed Sakura chat widget on your website"
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={widgetCode}
                onChange={(e) => setWidgetCode(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => navigator.clipboard.writeText(widgetCode)}>
                        <CopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<CopyIcon />}>
                  Copy Code
                </Button>
                <Button variant="outlined">
                  Preview Widget
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Channel Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {channels.map((channel) => (
              <Card key={channel.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: channel.color }}>
                      {channel.icon}
                    </Avatar>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(channel.status)}
                      <Chip 
                        label={channel.status} 
                        color={getStatusColor(channel.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  title={channel.name}
                  subheader={channel.description}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Today&apos;s Activity
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="body2">
                        {channel.messagesToday} messages
                      </Typography>
                      <Typography variant="body2">
                        {channel.activeChats} active chats
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Features
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {channel.features.slice(0, 2).map((feature, index) => (
                        <Chip 
                          key={index}
                          label={feature} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {channel.features.length > 2 && (
                        <Chip 
                          label={`+${channel.features.length - 2} more`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Last sync: {channel.lastSync}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant={channel.status === 'connected' ? 'outlined' : 'contained'}
                      size="small" 
                      fullWidth
                      onClick={() => channel.status === 'connected' ? handleDisconnect(channel.id) : handleConnect(channel.id)}
                    >
                      {channel.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      disabled={channel.status !== 'connected'}
                    >
                      Configure
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ContactChannelsPage;