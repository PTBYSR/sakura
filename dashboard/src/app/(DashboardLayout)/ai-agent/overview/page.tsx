"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Brain,
  XCircle,
  Loader2,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

export const dynamic = 'force-dynamic';

interface AgentStats {
  chats_responded_to: number;
  model: string;
  status: string;
  initialized: boolean;
}

const AIAgentOverviewPage = () => {
  const { agent } = useAgents();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://sakura-backend.onrender.com");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/agent/stats`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          setStats({
            chats_responded_to: data.chats_responded_to || 0,
            model: data.model || "Unknown",
            status: data.status || "offline",
            initialized: data.initialized || false,
          });
        }
      } catch (err: any) {
        console.error("Error fetching agent stats:", err);
        setError(err.message || "Failed to load agent statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-4">
            <div className="p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="AI Agent Overview" description="Overview of AI agent performance and activity">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h5 className="text-xl font-semibold text-white mb-1">
                AI Agent Overview
              </h5>
              <p className="text-sm text-gray-300">
                Current Agent: {agent.name} ({agent.type})
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats?.status === "online" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <Chip 
                label={stats?.status === "online" ? "Online" : "Offline"} 
                color={stats?.status === "online" ? "success" : "error"} 
                variant="outlined"
                size="small"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="text-center p-4">
                <MessageSquare className="text-[#EE66AA] w-8 h-8 mx-auto mb-2" />
                <h6 className="text-lg font-semibold text-white mb-1">
                  {stats?.chats_responded_to.toLocaleString() || 0}
                </h6>
                <p className="text-xs text-gray-300">
                  Chats AI Agent Has Responded To
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <Brain className="text-blue-500 w-8 h-8 mx-auto mb-2" />
                <h6 className="text-lg font-semibold text-white mb-1">
                  {stats?.model || "Unknown"}
                </h6>
                <p className="text-xs text-gray-300">
                  AI Model
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-4">
                <CheckCircle2 
                  className={`w-8 h-8 mx-auto mb-2 ${
                    stats?.status === "online" ? "text-green-500" : "text-red-500"
                  }`}
                />
                <h6 className="text-lg font-semibold text-white mb-1">
                  {stats?.status === "online" ? "Online" : "Offline"}
                </h6>
                <p className="text-xs text-gray-300">
                  Live Status
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Agent Information */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Brain size={16} />
                </div>
                <h6 className="text-base font-semibold text-white">Agent Information</h6>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <h6 className="text-base font-semibold text-white mb-2">
                    {agent.name}
                  </h6>
                  <p className="text-sm text-gray-300 mb-3">
                    {agent.description || "AI customer support agent"}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Chip color="primary" size="small" className="text-xs">
                      {agent.type}
                    </Chip>
                    <Chip 
                      color={stats?.status === "online" ? "success" : "secondary"} 
                      size="small" 
                      className="text-xs"
                    >
                      {stats?.status === "online" ? "Active" : "Inactive"}
                    </Chip>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white mb-2">
                    System Status
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {stats?.status === "online" ? (
                        <CheckCircle2 className="text-green-500 w-4 h-4" />
                      ) : (
                        <XCircle className="text-red-500 w-4 h-4" />
                      )}
                      <p className="text-sm text-gray-300">
                        AI Engine: {stats?.status === "online" ? "Running" : "Stopped"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${stats?.initialized ? "text-green-500" : "text-gray-500"}`} />
                      <p className="text-sm text-gray-300">
                        Service Initialized: {stats?.initialized ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="text-[#EE66AA] w-4 h-4" />
                      <p className="text-sm text-gray-300">
                        Model: {stats?.model || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AIAgentOverviewPage;
