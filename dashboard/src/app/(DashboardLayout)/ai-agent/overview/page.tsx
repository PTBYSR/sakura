"use client";
import React from "react";
import {
  Box,
  Typography,
  Container,
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
        <Box sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, fontSize: "1.25rem", mb: 0.5 }}>
                AI Agent Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Current Agent: {agent.name} ({agent.type})
              </Typography>
            </Box>
            <Chip 
              label="Online" 
              color="success" 
              variant="outlined"
              size="small"
              icon={<CheckCircleIcon sx={{ fontSize: "1rem" }} />}
            />
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <MessageIcon color="primary" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>{stats.totalConversations.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Total Conversations
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <PersonIcon color="success" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>{stats.activeConversations}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Active Conversations
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircleIcon color="info" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>{stats.resolvedToday}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Resolved Today
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <SpeedIcon color="warning" sx={{ fontSize: 32, mb: 0.75 }} />
                  <Typography variant="h6" sx={{ fontSize: "1.125rem", fontWeight: 600, mb: 0.5 }}>{stats.averageResponseTime}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Performance Metrics */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
              <Card>
                <CardHeader 
                  title="Performance Metrics"
                  titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
                  avatar={<Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><AssessmentIcon sx={{ fontSize: "1rem" }} /></Avatar>}
                  sx={{ pb: 1, pt: 2 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>Customer Satisfaction</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{stats.satisfactionRating}/5.0</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.satisfactionRating / 5) * 100} 
                      color="success"
                      sx={{ height: 6 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>System Uptime</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>{stats.uptime}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.uptime} 
                      color="success"
                      sx={{ height: 6 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <StarIcon color="warning" sx={{ fontSize: "1rem" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      Excellent performance rating
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
              <Card>
                <CardHeader 
                  title="Recent Activity"
                  titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
                  avatar={<Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}><ScheduleIcon sx={{ fontSize: "1rem" }} /></Avatar>}
                  sx={{ pb: 1, pt: 2 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <List dense sx={{ py: 0 }}>
                    {recentActivity.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ px: 0, py: 0.75 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {activity.type === 'success' && <CheckCircleIcon color="success" sx={{ fontSize: "1rem" }} />}
                            {activity.type === 'info' && <MessageIcon color="info" sx={{ fontSize: "1rem" }} />}
                            {activity.type === 'warning' && <ScheduleIcon color="warning" sx={{ fontSize: "1rem" }} />}
                          </ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{activity.action}</Typography>}
                            secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>{activity.time}</Typography>}
                          />
                        </ListItem>
                        {index < recentActivity.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Agent Information */}
          <Card>
            <CardHeader 
              title="Agent Information"
              titleTypographyProps={{ variant: "h6", sx: { fontSize: "0.95rem", fontWeight: 600 } }}
              avatar={<Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}><TrendingUpIcon sx={{ fontSize: "1rem" }} /></Avatar>}
              sx={{ pb: 1, pt: 2 }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, mb: 0.75 }}>
                    {agent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mb: 1.5 }}>
                    {agent.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={agent.type} color="primary" size="small" sx={{ fontSize: "0.75rem", height: 24 }} />
                    <Chip label="Active" color="success" size="small" sx={{ fontSize: "0.75rem", height: 24 }} />
                    <Chip label="Trained" color="info" size="small" sx={{ fontSize: "0.75rem", height: 24 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 1 }}>
                    System Status
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon color="success" sx={{ fontSize: "1rem" }} /></ListItemIcon>
                      <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>AI Engine</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Running</Typography>} />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon color="success" sx={{ fontSize: "1rem" }} /></ListItemIcon>
                      <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Knowledge Base</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Connected</Typography>} />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon color="success" sx={{ fontSize: "1rem" }} /></ListItemIcon>
                      <ListItemText primary={<Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Integrations</Typography>} secondary={<Typography variant="caption" sx={{ fontSize: "0.75rem" }}>Active</Typography>} />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentOverviewPage;
