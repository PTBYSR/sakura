"use client";
import React, { useState } from "react";

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';
import {
  TrendingUp,
  BarChart3,
  Gauge,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Star,
  Activity,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

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

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer title="AI Agent Performance" description="Detailed performance metrics and analytics">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-2">
                AI Agent Performance
              </h4>
              <p className="text-gray-300">
                Detailed analytics for {agent.name}
              </p>
            </div>
            <Chip 
              label="Last 24 Hours" 
              color="primary" 
              variant="outlined"
            />
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="text-center py-6">
                <Gauge className="text-[#EE66AA] w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{performanceMetrics.responseTime.average}</h6>
                <p className="text-sm text-gray-300 mb-1">
                  Avg Response Time
                </p>
                <p className="text-xs text-red-400">
                  {performanceMetrics.responseTime.trend}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <CheckCircle2 className="text-green-500 w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{performanceMetrics.accuracy.rate}%</h6>
                <p className="text-sm text-gray-300 mb-1">
                  Accuracy Rate
                </p>
                <p className="text-xs text-green-400">
                  {performanceMetrics.accuracy.trend}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <Star className="text-yellow-500 w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{performanceMetrics.satisfaction.score}/5.0</h6>
                <p className="text-sm text-gray-300 mb-1">
                  Satisfaction Score
                </p>
                <p className="text-xs text-green-400">
                  {performanceMetrics.satisfaction.trend}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <TrendingUp className="text-blue-500 w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{performanceMetrics.resolution.rate}%</h6>
                <p className="text-sm text-gray-300 mb-1">
                  Resolution Rate
                </p>
                <p className="text-xs text-green-400">
                  {performanceMetrics.resolution.trend}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tabs */}
          <Card className="mb-8">
            <div className="border-b border-gray-700">
              <div className="flex">
                {["Hourly Analytics", "Issue Analysis", "Response Times", "Quality Metrics"].map((label, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabChange(index)}
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
            <div className="p-6">
              {activeTab === 0 && (
                <div>
                  <h6 className="text-lg font-semibold text-white mb-4">
                    Hourly Performance Breakdown
                  </h6>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Hour</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Conversations</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Resolved</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Avg Response Time</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-300">Success Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hourlyData.map((row) => (
                          <tr key={row.hour} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="py-3 px-4 text-sm text-white">{row.hour}</td>
                            <td className="py-3 px-4 text-sm text-white text-right">{row.conversations}</td>
                            <td className="py-3 px-4 text-sm text-white text-right">{row.resolved}</td>
                            <td className="py-3 px-4 text-sm text-white text-right">{row.avgTime}</td>
                            <td className="py-3 px-4 text-right">
                              <Chip
                                label={`${Math.round((row.resolved / row.conversations) * 100)}%`}
                                color={row.resolved / row.conversations > 0.8 ? "success" : "warning"}
                                size="small"
                                className="text-xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <h6 className="text-lg font-semibold text-white mb-4">
                    Top Issues & Resolution Rates
                  </h6>
                  <div className="space-y-0">
                    {topIssues.map((issue, index) => (
                      <div key={issue.issue}>
                        <div className="flex items-center gap-4 py-4">
                          <BarChart3 className="text-gray-400 w-5 h-5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-white">{issue.issue}</p>
                            <p className="text-sm text-gray-400">{issue.count} conversations</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    issue.resolution > 90 ? "bg-green-500" : issue.resolution > 80 ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${issue.resolution}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-sm text-white w-12 text-right">{issue.resolution}%</p>
                          </div>
                        </div>
                        {index < topIssues.length - 1 && (
                          <div className="border-t border-gray-700" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <h6 className="text-lg font-semibold text-white mb-4">
                    Response Time Analysis
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400 mb-2">Average Response Time</p>
                        <h4 className="text-2xl font-semibold text-[#EE66AA] mb-1">
                          {performanceMetrics.responseTime.average}
                        </h4>
                        <p className="text-xs text-red-400">
                          {performanceMetrics.responseTime.trend} vs yesterday
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400 mb-2">Median Response Time</p>
                        <h4 className="text-2xl font-semibold text-green-500 mb-1">
                          {performanceMetrics.responseTime.median}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Most common response time
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400 mb-2">95th Percentile</p>
                        <h4 className="text-2xl font-semibold text-yellow-500 mb-1">
                          {performanceMetrics.responseTime.p95}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Slowest 5% of responses
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div>
                  <h6 className="text-lg font-semibold text-white mb-4">
                    Quality Metrics
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <CheckCircle2 size={16} />
                          </div>
                          <h6 className="text-base font-semibold text-white">Accuracy Metrics</h6>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="mb-4">
                          <p className="text-sm text-gray-300 mb-2">Correct Responses</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${performanceMetrics.accuracy.rate}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400">
                            {performanceMetrics.accuracy.rate}% accuracy
                          </p>
                        </div>
                        <p className="text-sm text-gray-300">
                          The AI agent correctly understands and responds to customer inquiries
                          {performanceMetrics.accuracy.rate}% of the time.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                            <Star size={16} />
                          </div>
                          <h6 className="text-base font-semibold text-white">Customer Satisfaction</h6>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="mb-4">
                          <p className="text-sm text-gray-300 mb-2">Satisfaction Rating</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${(performanceMetrics.satisfaction.score / 5) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400">
                            {performanceMetrics.satisfaction.score}/5.0 stars
                          </p>
                        </div>
                        <p className="text-sm text-gray-300">
                          Customers rate their experience with the AI agent an average of
                          {performanceMetrics.satisfaction.score} out of 5 stars.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AIAgentPerformancePage;
