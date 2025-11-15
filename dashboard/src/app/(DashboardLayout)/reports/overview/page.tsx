"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  MessageCircle,
  Instagram,
  Globe,
  Loader2,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent } from "@/components/ui/card";

interface ReportsStats {
  total_chats: number;
  agent_chats: number;
  channels: {
    whatsapp: number;
    instagram: number;
    website: number;
  };
}

const ReportsOverviewPage = () => {
  const [stats, setStats] = useState<ReportsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:8000"
      : "https://api.sakurasupport.live");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/reports/stats`, {
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
            total_chats: data.total_chats || 0,
            agent_chats: data.agent_chats || 0,
            channels: {
              whatsapp: data.channels?.whatsapp || 0,
              instagram: data.channels?.instagram || 0,
              website: data.channels?.website || 0,
            },
          });
        }
      } catch (err: any) {
        console.error("Error fetching reports stats:", err);
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <PageContainer title="Reports Overview" description="View chat statistics and metrics">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Reports Overview" description="View chat statistics and metrics">
        <div className="max-w-6xl mx-auto px-4">
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
    <PageContainer title="Reports Overview" description="View chat statistics and metrics">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4">
          {/* Header */}
          <div className="mb-6">
            <h5 className="text-xl font-semibold text-slate-900 mb-1">
              Reports
            </h5>
            <p className="text-sm text-gray-300">
              Basic chat statistics and metrics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Total Chats */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-[#EE66AA] flex items-center justify-center">
                    <MessageSquare className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-semibold text-white">
                      {stats?.total_chats.toLocaleString() || 0}
                    </h4>
                    <p className="text-sm text-gray-300">
                      Total Chats
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Chats */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                    <Users className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-semibold text-white">
                      {stats?.agent_chats.toLocaleString() || 0}
                    </h4>
                    <p className="text-sm text-gray-300">
                      Agent Chats
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Channel Breakdown Header Card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Globe className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-semibold text-white">
                      {((stats?.channels.whatsapp || 0) + (stats?.channels.instagram || 0) + (stats?.channels.website || 0)).toLocaleString()}
                    </h4>
                    <p className="text-sm text-gray-300">
                      Total Channels
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Breakdown */}
          <Card>
            <CardContent className="p-5">
              <h6 className="text-lg font-semibold text-white mb-4">
                Chats by Channel
              </h6>
              <div className="flex flex-col gap-3">
                {/* WhatsApp */}
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="text-[#25D366] w-6 h-6" />
                    <p className="text-base font-medium text-white">
                      WhatsApp
                    </p>
                  </div>
                  <h6 className="text-lg font-semibold text-white">
                    {stats?.channels.whatsapp.toLocaleString() || 0}
                  </h6>
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Instagram className="text-[#E4405F] w-6 h-6" />
                    <p className="text-base font-medium text-white">
                      Instagram
                    </p>
                  </div>
                  <h6 className="text-lg font-semibold text-white">
                    {stats?.channels.instagram.toLocaleString() || 0}
                  </h6>
                </div>

                {/* Website */}
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="text-[#EE66AA] w-6 h-6" />
                    <p className="text-base font-medium text-white">
                      Website
                    </p>
                  </div>
                  <h6 className="text-lg font-semibold text-white">
                    {stats?.channels.website.toLocaleString() || 0}
                  </h6>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportsOverviewPage;
