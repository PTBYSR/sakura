"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Gauge,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  Timer,
  Star,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

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
      icon: <MessageSquare size={20} />,
      color: "#1976d2"
    },
    {
      title: "Avg Response Time",
      value: "0.8s",
      change: -12.5,
      changeType: 'decrease',
      icon: <Gauge size={20} />,
      color: "#388e3c"
    },
    {
      title: "Satisfaction Rate",
      value: "96.2%",
      change: 3.1,
      changeType: 'increase',
      icon: <ThumbsUp size={20} />,
      color: "#7b1fa2"
    },
    {
      title: "Success Rate",
      value: "98.7%",
      change: 1.2,
      changeType: 'increase',
      icon: <CheckCircle2 size={20} />,
      color: "#f57c00"
    },
    {
      title: "Avg Session Duration",
      value: "4.2m",
      change: 8.3,
      changeType: 'increase',
      icon: <Timer size={20} />,
      color: "#d32f2f"
    },
    {
      title: "Messages per Session",
      value: "12.4",
      change: -2.1,
      changeType: 'decrease',
      icon: <MessageSquare size={20} />,
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
      <Star
        key={i} 
        size={16}
        className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}
      />
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-green-500 w-4 h-4" />;
      case 'in_progress': return <Clock className="text-blue-500 w-4 h-4" />;
      case 'failed': return <XCircle className="text-red-500 w-4 h-4" />;
      default: return <Clock className="text-gray-500 w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'failed': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <PageContainer title="AI Agent Reports" description="Detailed analytics for AI agents">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-2">
                AI Agent Analytics
              </h4>
              <p className="text-gray-300">
                Detailed performance metrics and insights for your AI agents
              </p>
            </div>
            <div className="flex gap-3">
              <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                className="px-3 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#EE66AA]"
                >
                  {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                        {agent.name}
                  </option>
                ))}
              </select>
              <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#EE66AA]"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button variant="outlined" color="primary" size="small">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
              <Button variant="outlined" color="primary" size="small">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Agent Selection */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h6 className="text-lg font-semibold text-white mb-4">
                Selected Agent: Customer Support Bot
              </h6>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EE66AA] flex items-center justify-center text-white font-semibold">
                  CS
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Customer Support Bot</p>
                  <p className="text-sm text-gray-300">
                    Active since Jan 15, 2024 • Last updated 2 hours ago
                  </p>
                </div>
                <Chip color="success" size="small">Active</Chip>
                <Chip color="primary" size="small">High Performance</Chip>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {agentMetrics.map((metric, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: metric.color }}>
                        {metric.icon}
                    </div>
                    <div>
                      <h6 className="text-lg font-semibold text-white">
                          {metric.value}
                      </h6>
                      <p className="text-xs text-gray-300">
                          {metric.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                      {metric.changeType === 'increase' ? (
                      <TrendingUp className="text-green-500 w-4 h-4" />
                    ) : (
                      <TrendingDown className="text-red-500 w-4 h-4" />
                    )}
                    <p className={`text-xs ${metric.changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(metric.change)}%
                    </p>
                  </div>
                  </CardContent>
                </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <div className="flex">
              {["Performance Overview", "Conversation History", "Hourly Analytics", "Quality Metrics"].map((label, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === index
                      ? "text-[#EE66AA] border-b-2 border-[#EE66AA]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance Chart Placeholder */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <h6 className="text-lg font-semibold text-white">Conversation Trends</h6>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-800 rounded-lg">
                      <p className="text-gray-400">Chart visualization would go here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <h6 className="text-lg font-semibold text-white">Quick Stats</h6>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Peak Hour Performance</p>
                      <h6 className="text-xl font-semibold text-white mb-1">2:00 PM</h6>
                      <p className="text-sm text-gray-400">
                        92 conversations, 4.7 avg satisfaction
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Most Common Query Type</p>
                      <h6 className="text-xl font-semibold text-white mb-1">Account Issues</h6>
                      <p className="text-sm text-gray-400">
                        34% of all conversations
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-300 mb-2">Resolution Rate</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }} />
                      </div>
                      <p className="text-sm text-white">87% first-contact resolution</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-center">
                  <h6 className="text-lg font-semibold text-white">Recent Conversations</h6>
                  <Button variant="outlined" color="primary" size="small">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">User</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Duration</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Satisfaction</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Messages</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Time</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentConversations.map((conversation) => (
                        <tr key={conversation.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-sm text-white">{conversation.user}</td>
                          <td className="py-3 px-4 text-sm text-white">{conversation.duration}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getSatisfactionStars(conversation.satisfaction)}
                              {conversation.satisfaction > 0 && (
                                <span className="text-xs text-gray-400 ml-1">
                                  {conversation.satisfaction}/5
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{conversation.messages}</td>
                          <td className="py-3 px-4">
                            <Chip 
                              label={conversation.status} 
                              color={getStatusColor(conversation.status)}
                              size="small"
                              className="text-xs"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{conversation.timestamp}</td>
                          <td className="py-3 px-4">
                            <button className="p-1 text-gray-400 hover:text-white transition-colors" title="View Details">
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                <CardHeader className="pb-2 pt-4">
                  <h6 className="text-lg font-semibold text-white">Hourly Conversation Volume</h6>
                </CardHeader>
                  <CardContent>
                  <div className="space-y-0">
                      {hourlyPerformance.map((data, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between py-4">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white mb-1">{data.hour}</p>
                            <p className="text-xs text-gray-400 mb-2">
                                  {data.conversations} conversations
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-[#EE66AA] h-2 rounded-full"
                                style={{ width: `${(data.conversations / 100) * 100}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-white ml-4">
                            {data.satisfaction.toFixed(1)}★
                          </p>
                        </div>
                        {index < hourlyPerformance.length - 1 && (
                          <div className="border-t border-gray-700" />
                        )}
                      </div>
                    ))}
                  </div>
                  </CardContent>
                </Card>
              
                <Card>
                <CardHeader className="pb-2 pt-4">
                  <h6 className="text-lg font-semibold text-white">Performance Insights</h6>
                </CardHeader>
                  <CardContent>
                  <div className="mb-6">
                    <h6 className="text-base font-semibold text-white mb-4">Top Performing Hours</h6>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Star className="text-yellow-500 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">2:00 PM - 3:00 PM</p>
                          <p className="text-xs text-gray-400">Peak performance: 92 conversations, 4.7★ satisfaction</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="text-yellow-500 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">10:00 AM - 11:00 AM</p>
                          <p className="text-xs text-gray-400">High volume: 67 conversations, 4.6★ satisfaction</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="text-base font-semibold text-white mb-4">Recommendations</h6>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">Consider scaling resources during peak hours</p>
                          <p className="text-xs text-gray-400">2:00 PM shows highest demand</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">Low activity periods could be used for training</p>
                          <p className="text-xs text-gray-400">4:00 AM - 6:00 AM shows minimal usage</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
            </div>
          )}

          {activeTab === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                <CardHeader className="pb-2 pt-4">
                  <h6 className="text-lg font-semibold text-white">Quality Metrics</h6>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Response Accuracy</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }} />
                    </div>
                    <p className="text-sm text-white">94% accurate responses</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Intent Recognition</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="bg-[#EE66AA] h-2 rounded-full" style={{ width: '89%' }} />
                    </div>
                    <p className="text-sm text-white">89% correct intent detection</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Escalation Rate</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '12%' }} />
                    </div>
                    <p className="text-sm text-white">12% require human intervention</p>
                  </div>
                  </CardContent>
                </Card>
              
                <Card>
                <CardHeader className="pb-2 pt-4">
                  <h6 className="text-lg font-semibold text-white">Training Recommendations</h6>
                </CardHeader>
                  <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="text-[#EE66AA] w-5 h-5 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Improve billing-related responses</p>
                        <p className="text-xs text-gray-400">Low satisfaction scores detected in billing queries</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="text-[#EE66AA] w-5 h-5 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Enhance technical troubleshooting</p>
                        <p className="text-xs text-gray-400">Higher escalation rate for technical issues</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="text-[#EE66AA] w-5 h-5 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Update product knowledge base</p>
                        <p className="text-xs text-gray-400">Recent product updates not reflected in responses</p>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AIAgentReportsPage;
