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
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Public as PublicIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface TopAgent {
  id: string;
  name: string;
  conversations: number;
  satisfaction: number;
  avatar: string;
}

const ReportsOverviewPage = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const metrics: MetricCard[] = [
    {
      title: "Total Conversations",
      value: "12,847",
      change: 12.5,
      changeType: 'increase',
      icon: <ChatIcon />,
      color: "#1976d2"
    },
    {
      title: "Active Users",
      value: "3,421",
      change: 8.2,
      changeType: 'increase',
      icon: <PeopleIcon />,
      color: "#388e3c"
    },
    {
      title: "AI Agents",
      value: "15",
      change: 2,
      changeType: 'increase',
      icon: <PsychologyIcon />,
      color: "#7b1fa2"
    },
    {
      title: "Knowledge Sources",
      value: "247",
      change: 15.3,
      changeType: 'increase',
      icon: <StorageIcon />,
      color: "#f57c00"
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      change: -18.5,
      changeType: 'decrease',
      icon: <SpeedIcon />,
      color: "#d32f2f"
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: 2.1,
      changeType: 'increase',
      icon: <CheckCircleIcon />,
      color: "#388e3c"
    }
  ];

  const topAgents: TopAgent[] = [
    {
      id: "1",
      name: "Customer Support Bot",
      conversations: 3247,
      satisfaction: 96.2,
      avatar: "CS"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      conversations: 2891,
      satisfaction: 92.8,
      avatar: "SA"
    },
    {
      id: "3",
      name: "Technical Helper",
      conversations: 2156,
      satisfaction: 89.4,
      avatar: "TH"
    }
  ];

  const recentActivity = [
    { type: "conversation", message: "New conversation started with Customer Support Bot", time: "2 min ago", status: "success" },
    { type: "agent", message: "Sales Assistant completed training session", time: "15 min ago", status: "success" },
    { type: "knowledge", message: "New knowledge source added: Product Manual v2.1", time: "1 hour ago", status: "success" },
    { type: "error", message: "Technical Helper encountered processing error", time: "2 hours ago", status: "error" },
    { type: "conversation", message: "High satisfaction conversation completed", time: "3 hours ago", status: "success" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" fontSize="small" />;
      case 'error': return <ErrorIcon color="error" fontSize="small" />;
      default: return <ScheduleIcon color="action" fontSize="small" />;
    }
  };

  return (
    <PageContainer title="Reports Overview" description="View comprehensive reports and analytics">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Reports & Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive overview of Sakura&apos;s performance and usage metrics
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Key Metrics Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {metrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: metric.color, mr: 2 }}>
                        {metric.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {metric.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metric.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {metric.changeType === 'increase' ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                      <Typography 
                        variant="body2" 
                        color={metric.changeType === 'increase' ? 'success.main' : 'error.main'}
                        sx={{ ml: 0.5 }}
                      >
                        {Math.abs(metric.change)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Top Performing Agents */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Top Performing Agents"
                  subheader="Based on conversation volume and satisfaction"
                />
                <CardContent>
                  <List>
                    {topAgents.map((agent, index) => (
                      <ListItem key={agent.id} divider={index < topAgents.length - 1}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {agent.avatar}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={agent.name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {agent.conversations.toLocaleString()} conversations
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={agent.satisfaction} 
                                  sx={{ width: 100, mr: 1 }}
                                />
                                <Typography variant="caption">
                                  {agent.satisfaction}% satisfaction
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Recent Activity"
                  subheader="Latest system events and updates"
                />
                <CardContent>
                  <List>
                    {recentActivity.map((activity, index) => (
                      <ListItem key={index} divider={index < recentActivity.length - 1}>
                        <ListItemIcon>
                          {getStatusIcon(activity.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.message}
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Knowledge Base Overview */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Knowledge Base Overview"
                  subheader="Content sources and usage statistics"
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <PublicIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">23</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Websites
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <DescriptionIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">89</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Documents
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Total Knowledge Chunks
                        </Typography>
                        <LinearProgress variant="determinate" value={75} sx={{ mb: 1 }} />
                        <Typography variant="caption">
                          15,247 chunks indexed
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* System Health */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="System Health"
                  subheader="Current system status and performance"
                />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">API Response Time</Typography>
                      <Typography variant="body2">1.2s</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="success" />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Database Performance</Typography>
                      <Typography variant="body2">98.5%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={98.5} color="success" />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">AI Processing</Typography>
                      <Typography variant="body2">94.2%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={94.2} color="success" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip label="All Systems Operational" color="success" size="small" />
                    <Chip label="No Issues Detected" color="success" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ReportsOverviewPage;
