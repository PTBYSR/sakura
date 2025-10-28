"use client";
import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const AIAgentOverviewPage = () => {
  const { agent } = useAgents();

  // Mock data for demonstration
  const stats = {
    totalConversations: 1247,
    activeConversations: 23,
    resolvedToday: 89,
    averageResponseTime: "2.3s",
    satisfactionRating: 4.8,
    uptime: 99.9
  };

  const recentActivity = [
    { id: 1, action: "Resolved customer inquiry", time: "2 minutes ago", type: "success" },
    { id: 2, action: "Started new conversation", time: "5 minutes ago", type: "info" },
    { id: 3, action: "Escalated complex issue", time: "8 minutes ago", type: "warning" },
    { id: 4, action: "Completed training session", time: "1 hour ago", type: "success" },
    { id: 5, action: "Updated knowledge base", time: "2 hours ago", type: "info" },
  ];

  return (
    <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                AI Agent Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Current Agent: {agent.name} ({agent.type})
              </Typography>
            </Box>
            <Chip 
              label="Online" 
              color="success" 
              variant="outlined"
              icon={<CheckCircleIcon />}
            />
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MessageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{stats.totalConversations.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Conversations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{stats.activeConversations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Conversations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{stats.resolvedToday}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolved Today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SpeedIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{stats.averageResponseTime}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Performance Metrics"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><AssessmentIcon /></Avatar>}
                />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Customer Satisfaction</Typography>
                      <Typography variant="body2">{stats.satisfactionRating}/5.0</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.satisfactionRating / 5) * 100} 
                      color="success"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">System Uptime</Typography>
                      <Typography variant="body2">{stats.uptime}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.uptime} 
                      color="success"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="warning" />
                    <Typography variant="body2">
                      Excellent performance rating
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Recent Activity"
                  avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><ScheduleIcon /></Avatar>}
                />
                <CardContent>
                  <List dense>
                    {recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            {activity.type === 'success' && <CheckCircleIcon color="success" fontSize="small" />}
                            {activity.type === 'info' && <MessageIcon color="info" fontSize="small" />}
                            {activity.type === 'warning' && <ScheduleIcon color="warning" fontSize="small" />}
                          </ListItemIcon>
                          <ListItemText 
                            primary={activity.action}
                            secondary={activity.time}
                          />
                        </ListItem>
                        {index < recentActivity.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Agent Information */}
          <Card>
            <CardHeader 
              title="Agent Information"
              avatar={<Avatar sx={{ bgcolor: 'info.main' }}><TrendingUpIcon /></Avatar>}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {agent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {agent.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={agent.type} color="primary" size="small" />
                    <Chip label="Active" color="success" size="small" />
                    <Chip label="Trained" color="info" size="small" />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    System Status
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="AI Engine" secondary="Running" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Knowledge Base" secondary="Connected" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Integrations" secondary="Active" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentOverviewPage;
