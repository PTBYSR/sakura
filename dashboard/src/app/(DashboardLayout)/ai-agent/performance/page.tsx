"use client";
import React, { useState } from "react";

// Force dynamic rendering to avoid SSG issues with MUI theme
export const dynamic = 'force-dynamic';
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const AIAgentPerformancePage = () => {
  const { agent } = useAgents();
  const [activeTab, setActiveTab] = useState(0);

  // Mock performance data
  const performanceMetrics = {
    responseTime: {
      average: "2.3s",
      median: "1.8s",
      p95: "4.2s",
      trend: "+5%"
    },
    accuracy: {
      rate: 94.2,
      trend: "+2.1%"
    },
    satisfaction: {
      score: 4.8,
      trend: "+0.3"
    },
    resolution: {
      rate: 87.5,
      trend: "+1.2%"
    }
  };

  const hourlyData = [
    { hour: "00:00", conversations: 12, resolved: 10, avgTime: "2.1s" },
    { hour: "01:00", conversations: 8, resolved: 7, avgTime: "1.9s" },
    { hour: "02:00", conversations: 5, resolved: 5, avgTime: "1.7s" },
    { hour: "03:00", conversations: 3, resolved: 3, avgTime: "1.5s" },
    { hour: "04:00", conversations: 4, resolved: 4, avgTime: "1.8s" },
    { hour: "05:00", conversations: 7, resolved: 6, avgTime: "2.0s" },
    { hour: "06:00", conversations: 15, resolved: 13, avgTime: "2.2s" },
    { hour: "07:00", conversations: 28, resolved: 24, avgTime: "2.4s" },
    { hour: "08:00", conversations: 45, resolved: 38, avgTime: "2.6s" },
    { hour: "09:00", conversations: 52, resolved: 46, avgTime: "2.8s" },
    { hour: "10:00", conversations: 48, resolved: 42, avgTime: "2.5s" },
    { hour: "11:00", conversations: 41, resolved: 36, avgTime: "2.3s" },
  ];

  const topIssues = [
    { issue: "Product Information", count: 45, resolution: 89 },
    { issue: "Order Status", count: 32, resolution: 94 },
    { issue: "Technical Support", count: 28, resolution: 82 },
    { issue: "Billing Questions", count: 21, resolution: 95 },
    { issue: "Returns & Refunds", count: 18, resolution: 88 },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer title="AI Agent Performance" description="Detailed performance metrics and analytics">
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                AI Agent Performance
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Detailed analytics for {agent.name}
              </Typography>
            </Box>
            <Chip 
              label="Last 24 Hours" 
              color="primary" 
              variant="outlined"
            />
          </Box>

          {/* Key Performance Indicators */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SpeedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{performanceMetrics.responseTime.average}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                  <Typography variant="caption" color="error">
                    {performanceMetrics.responseTime.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{performanceMetrics.accuracy.rate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy Rate
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {performanceMetrics.accuracy.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{performanceMetrics.satisfaction.score}/5.0</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Satisfaction Score
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {performanceMetrics.satisfaction.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6">{performanceMetrics.resolution.rate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resolution Rate
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {performanceMetrics.resolution.trend}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Performance Tabs */}
          <Card sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Hourly Analytics" />
                <Tab label="Issue Analysis" />
                <Tab label="Response Times" />
                <Tab label="Quality Metrics" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Hourly Performance Breakdown
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Hour</TableCell>
                          <TableCell align="right">Conversations</TableCell>
                          <TableCell align="right">Resolved</TableCell>
                          <TableCell align="right">Avg Response Time</TableCell>
                          <TableCell align="right">Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {hourlyData.map((row) => (
                          <TableRow key={row.hour}>
                            <TableCell>{row.hour}</TableCell>
                            <TableCell align="right">{row.conversations}</TableCell>
                            <TableCell align="right">{row.resolved}</TableCell>
                            <TableCell align="right">{row.avgTime}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`${Math.round((row.resolved / row.conversations) * 100)}%`}
                                color={row.resolved / row.conversations > 0.8 ? "success" : "warning"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Top Issues & Resolution Rates
                  </Typography>
                  <List>
                    {topIssues.map((issue, index) => (
                      <React.Fragment key={issue.issue}>
                        <ListItem>
                          <ListItemIcon>
                            <AssessmentIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={issue.issue}
                            secondary={`${issue.count} conversations`}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 100 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={issue.resolution} 
                                color={issue.resolution > 90 ? "success" : issue.resolution > 80 ? "warning" : "error"}
                              />
                            </Box>
                            <Typography variant="body2">{issue.resolution}%</Typography>
                          </Box>
                        </ListItem>
                        {index < topIssues.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Response Time Analysis
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Average Response Time
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {performanceMetrics.responseTime.average}
                          </Typography>
                          <Typography variant="caption" color="error">
                            {performanceMetrics.responseTime.trend} vs yesterday
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Median Response Time
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {performanceMetrics.responseTime.median}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Most common response time
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            95th Percentile
                          </Typography>
                          <Typography variant="h4" color="warning.main">
                            {performanceMetrics.responseTime.p95}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Slowest 5% of responses
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Quality Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                      <Card variant="outlined">
                        <CardHeader 
                          title="Accuracy Metrics"
                          avatar={<Avatar sx={{ bgcolor: 'success.main' }}><CheckCircleIcon /></Avatar>}
                        />
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Correct Responses
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={performanceMetrics.accuracy.rate} 
                              color="success"
                            />
                            <Typography variant="caption">
                              {performanceMetrics.accuracy.rate}% accuracy
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            The AI agent correctly understands and responds to customer inquiries
                            {performanceMetrics.accuracy.rate}% of the time.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
                      <Card variant="outlined">
                        <CardHeader 
                          title="Customer Satisfaction"
                          avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><StarIcon /></Avatar>}
                        />
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Satisfaction Rating
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(performanceMetrics.satisfaction.score / 5) * 100} 
                              color="warning"
                            />
                            <Typography variant="caption">
                              {performanceMetrics.satisfaction.score}/5.0 stars
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Customers rate their experience with the AI agent an average of
                            {performanceMetrics.satisfaction.score} out of 5 stars.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default AIAgentPerformancePage;
