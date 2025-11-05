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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Psychology as PsychologyIcon,
  Chat as ChatIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Message as MessageIcon,
  Timer as TimerIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

interface AgentMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface Conversation {
  id: string;
  user: string;
  duration: string;
  satisfaction: number;
  messages: number;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed';
}

interface PerformanceData {
  hour: string;
  conversations: number;
  satisfaction: number;
}

const AIAgentReportsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  const agents = [
    { id: 'all', name: 'All Agents', avatar: 'ALL' },
    { id: 'cs', name: 'Customer Support Bot', avatar: 'CS' },
    { id: 'sa', name: 'Sales Assistant', avatar: 'SA' },
    { id: 'th', name: 'Technical Helper', avatar: 'TH' },
  ];

  const agentMetrics: AgentMetric[] = [
    {
      title: "Total Conversations",
      value: "3,247",
      change: 15.2,
      changeType: 'increase',
      icon: <ChatIcon />,
      color: "#1976d2"
    },
    {
      title: "Avg Response Time",
      value: "0.8s",
      change: -12.5,
      changeType: 'decrease',
      icon: <SpeedIcon />,
      color: "#388e3c"
    },
    {
      title: "Satisfaction Rate",
      value: "96.2%",
      change: 3.1,
      changeType: 'increase',
      icon: <ThumbUpIcon />,
      color: "#7b1fa2"
    },
    {
      title: "Success Rate",
      value: "98.7%",
      change: 1.2,
      changeType: 'increase',
      icon: <CheckCircleIcon />,
      color: "#f57c00"
    },
    {
      title: "Avg Session Duration",
      value: "4.2m",
      change: 8.3,
      changeType: 'increase',
      icon: <TimerIcon />,
      color: "#d32f2f"
    },
    {
      title: "Messages per Session",
      value: "12.4",
      change: -2.1,
      changeType: 'decrease',
      icon: <MessageIcon />,
      color: "#5e35b1"
    }
  ];

  const recentConversations: Conversation[] = [
    {
      id: "1",
      user: "john.doe@company.com",
      duration: "3m 24s",
      satisfaction: 5,
      messages: 8,
      timestamp: "2 minutes ago",
      status: "completed"
    },
    {
      id: "2",
      user: "sarah.wilson@company.com",
      duration: "5m 12s",
      satisfaction: 4,
      messages: 12,
      timestamp: "8 minutes ago",
      status: "completed"
    },
    {
      id: "3",
      user: "mike.chen@company.com",
      duration: "1m 45s",
      satisfaction: 5,
      messages: 6,
      timestamp: "15 minutes ago",
      status: "completed"
    },
    {
      id: "4",
      user: "lisa.garcia@company.com",
      duration: "2m 18s",
      satisfaction: 3,
      messages: 9,
      timestamp: "22 minutes ago",
      status: "completed"
    },
    {
      id: "5",
      user: "david.brown@company.com",
      duration: "0m 0s",
      satisfaction: 0,
      messages: 2,
      timestamp: "35 minutes ago",
      status: "failed"
    }
  ];

  const hourlyPerformance: PerformanceData[] = [
    { hour: "00:00", conversations: 12, satisfaction: 4.2 },
    { hour: "02:00", conversations: 8, satisfaction: 4.5 },
    { hour: "04:00", conversations: 5, satisfaction: 4.8 },
    { hour: "06:00", conversations: 15, satisfaction: 4.1 },
    { hour: "08:00", conversations: 45, satisfaction: 4.3 },
    { hour: "10:00", conversations: 67, satisfaction: 4.6 },
    { hour: "12:00", conversations: 89, satisfaction: 4.4 },
    { hour: "14:00", conversations: 92, satisfaction: 4.7 },
    { hour: "16:00", conversations: 78, satisfaction: 4.5 },
    { hour: "18:00", conversations: 56, satisfaction: 4.3 },
    { hour: "20:00", conversations: 34, satisfaction: 4.6 },
    { hour: "22:00", conversations: 23, satisfaction: 4.4 },
  ];

  const getSatisfactionStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        sx={{ 
          fontSize: 16, 
          color: i < rating ? '#ffc107' : '#e0e0e0' 
        }} 
      />
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" fontSize="small" />;
      case 'in_progress': return <ScheduleIcon color="primary" fontSize="small" />;
      case 'failed': return <ErrorIcon color="error" fontSize="small" />;
      default: return <ScheduleIcon color="action" fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <PageContainer title="AI Agent Reports" description="Detailed analytics for AI agents">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                AI Agent Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Detailed performance metrics and insights for your AI agents
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Agent</InputLabel>
                <Select
                  value={selectedAgent}
                  label="Agent"
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                          {agent.avatar}
                        </Avatar>
                        {agent.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                Refresh
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export
              </Button>
            </Box>
          </Box>

          {/* Agent Selection */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Agent: Customer Support Bot
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>CS</Avatar>
                <Box>
                  <Typography variant="subtitle1">Customer Support Bot</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active since Jan 15, 2024 • Last updated 2 hours ago
                  </Typography>
                </Box>
                <Chip label="Active" color="success" size="small" />
                <Chip label="High Performance" color="primary" size="small" />
              </Box>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {agentMetrics.map((metric, index) => (
              <Grid sx={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
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

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Performance Overview" />
              <Tab label="Conversation History" />
              <Tab label="Hourly Analytics" />
              <Tab label="Quality Metrics" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Performance Chart Placeholder */}
              <Grid sx={{ xs: 12, md: 8 }}>
                <Card>
                  <CardHeader title="Conversation Trends" />
                  <CardContent>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="body1" color="text.secondary">
                        Chart visualization would go here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Stats */}
              <Grid sx={{ xs: 12, md: 4 }}>
                <Card>
                  <CardHeader title="Quick Stats" />
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Peak Hour Performance
                      </Typography>
                      <Typography variant="h6">2:00 PM</Typography>
                      <Typography variant="body2" color="text.secondary">
                        92 conversations, 4.7 avg satisfaction
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Most Common Query Type
                      </Typography>
                      <Typography variant="h6">Account Issues</Typography>
                      <Typography variant="body2" color="text.secondary">
                        34% of all conversations
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Resolution Rate
                      </Typography>
                      <LinearProgress variant="determinate" value={87} sx={{ mb: 1 }} />
                      <Typography variant="body2">87% first-contact resolution</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Card>
              <CardHeader 
                title="Recent Conversations"
                action={
                  <Button variant="outlined" size="small">
                    View All
                  </Button>
                }
              />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Satisfaction</TableCell>
                        <TableCell>Messages</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentConversations.map((conversation) => (
                        <TableRow key={conversation.id}>
                          <TableCell>{conversation.user}</TableCell>
                          <TableCell>{conversation.duration}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getSatisfactionStars(conversation.satisfaction)}
                              {conversation.satisfaction > 0 && (
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                  {conversation.satisfaction}/5
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{conversation.messages}</TableCell>
                          <TableCell>
                            <Chip 
                              label={conversation.status} 
                              color={getStatusColor(conversation.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{conversation.timestamp}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="Hourly Conversation Volume" />
                  <CardContent>
                    <List>
                      {hourlyPerformance.map((data, index) => (
                        <ListItem key={index} divider={index < hourlyPerformance.length - 1}>
                          <ListItemText
                            primary={data.hour}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {data.conversations} conversations
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(data.conversations / 100) * 100} 
                                  sx={{ mt: 1 }}
                                />
                              </Box>
                            }
                          />
                          <Typography variant="body2">
                            {data.satisfaction.toFixed(1)}★
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid sx={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="Performance Insights" />
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Top Performing Hours
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <StarIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="2:00 PM - 3:00 PM"
                            secondary="Peak performance: 92 conversations, 4.7★ satisfaction"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <StarIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="10:00 AM - 11:00 AM"
                            secondary="High volume: 67 conversations, 4.6★ satisfaction"
                          />
                        </ListItem>
                      </List>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Recommendations
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Consider scaling resources during peak hours"
                            secondary="2:00 PM shows highest demand"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Low activity periods could be used for training"
                            secondary="4:00 AM - 6:00 AM shows minimal usage"
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid sx={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="Quality Metrics" />
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Response Accuracy
                      </Typography>
                      <LinearProgress variant="determinate" value={94} color="success" sx={{ mb: 1 }} />
                      <Typography variant="body2">94% accurate responses</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Intent Recognition
                      </Typography>
                      <LinearProgress variant="determinate" value={89} color="primary" sx={{ mb: 1 }} />
                      <Typography variant="body2">89% correct intent detection</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Escalation Rate
                      </Typography>
                      <LinearProgress variant="determinate" value={12} color="warning" sx={{ mb: 1 }} />
                      <Typography variant="body2">12% require human intervention</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid sx={{ xs: 12, md: 6 }}>
                <Card>
                  <CardHeader title="Training Recommendations" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <AssessmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Improve billing-related responses"
                          secondary="Low satisfaction scores detected in billing queries"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssessmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Enhance technical troubleshooting"
                          secondary="Higher escalation rate for technical issues"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssessmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Update product knowledge base"
                          secondary="Recent product updates not reflected in responses"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentReportsPage;
