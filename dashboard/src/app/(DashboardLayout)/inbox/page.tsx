"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const InboxPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stats] = useState({
    totalChats: 24,
    activeChats: 8,
    resolvedToday: 16,
    avgResponseTime: "2m 30s",
    satisfaction: 4.8,
  });

  const [recentChats] = useState([
    {
      id: "1",
      name: "Paul Eme",
      lastMessage: "Hello",
      timestamp: "21s",
      unreadCount: 1,
      avatar: "P",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      lastMessage: "I need help with my policy",
      timestamp: "2m",
      unreadCount: 0,
      avatar: "S",
      status: "resolved",
    },
    {
      id: "3",
      name: "Mike Chen",
      lastMessage: "Thank you for your assistance",
      timestamp: "5m",
      unreadCount: 0,
      avatar: "M",
      status: "resolved",
    },
  ]);

  const [quickActions] = useState([
    {
      title: "My Inbox",
      description: "Manage your personal conversations",
      icon: <User size={20} />,
      color: "#4caf50",
      href: "/inbox/my-inbox",
    },
    {
      title: "Agent Inbox",
      description: "Monitor AI agent conversations",
      icon: <Bot size={20} />,
      color: "#ff6b35",
      href: "/inbox/agent-inbox",
    },
  ]);

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <PageContainer title="Inbox" description="Manage your conversations">
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-8 flex justify-center items-center min-h-[400px]">
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Inbox" description="Manage your conversations">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Inbox Dashboard
            </h1>
            <p className="text-gray-300">
              Overview of all conversations and support metrics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex-1 min-w-[200px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="text-center py-6">
                  <MessageSquare className="text-green-500 w-10 h-10 mx-auto mb-2" />
                  <h4 className="text-2xl font-bold text-white">
                    {stats.totalChats}
                  </h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Total Chats
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="text-center py-6">
                  <AlertCircle className="text-orange-500 w-10 h-10 mx-auto mb-2" />
                  <h4 className="text-2xl font-bold text-white">
                    {stats.activeChats}
                  </h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Active Chats
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="text-center py-6">
                  <CheckCircle2 className="text-green-500 w-10 h-10 mx-auto mb-2" />
                  <h4 className="text-2xl font-bold text-white">
                    {stats.resolvedToday}
                  </h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Resolved Today
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="text-center py-6">
                  <Clock className="text-blue-500 w-10 h-10 mx-auto mb-2" />
                  <h4 className="text-2xl font-bold text-white">
                    {stats.avgResponseTime}
                  </h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Avg Response
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="text-center py-6">
                  <TrendingUp className="text-purple-500 w-10 h-10 mx-auto mb-2" />
                  <h4 className="text-2xl font-bold text-white">
                    {stats.satisfaction}
                  </h4>
                  <p className="text-sm text-gray-300 mt-1">
                    Satisfaction
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex-1 min-w-[400px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="p-6">
                  <h6 className="text-lg font-semibold text-white mb-4">
                    Quick Actions
                  </h6>
                  <div className="flex flex-col gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        color="primary"
                        onClick={() => router.push(action.href)}
                        className="justify-start text-left border-2 hover:bg-opacity-20 transition-colors"
                        style={{
                          borderColor: action.color,
                          color: action.color,
                        }}
                      >
                        <div className="flex items-center gap-3 text-left w-full">
                          {action.icon}
                          <div>
                            <p className="font-medium">{action.title}</p>
                            <p className="text-sm text-gray-300">{action.description}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 min-w-[400px]">
              <Card className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="p-6">
                  <h6 className="text-lg font-semibold text-white mb-4">
                    Recent Chats
                  </h6>
                  <div className="space-y-0">
                    {recentChats.map((chat, index) => (
                      <React.Fragment key={chat.id}>
                        <div
                          className="flex items-center gap-4 p-3 cursor-pointer hover:bg-[#3a3a3a] rounded-lg transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              chat.status === "active" ? "bg-[#ff6b35]" : "bg-green-500"
                            }`}
                          >
                            {chat.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-base text-white font-medium truncate">
                                {chat.name}
                              </p>
                              <Chip
                                size="small"
                                color={chat.status === "active" ? "error" : "success"}
                                className="text-xs"
                              >
                                {chat.status}
                              </Chip>
                            </div>
                            <p className="text-sm text-gray-300 truncate">
                              {chat.lastMessage}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-xs text-gray-300">
                              {chat.timestamp}
                            </p>
                            {chat.unreadCount > 0 && (
                              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        {index < recentChats.length - 1 && (
                          <div className="border-t border-gray-700 my-2" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <Card
                className="bg-[#2a2a2a] border border-gray-700 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
              >
                <div onClick={() => router.push("/inbox/my-inbox")}>
                <CardContent className="text-center py-6">
                  <User className="text-green-500 w-15 h-15 mx-auto mb-4" size={60} />
                  <h5 className="text-xl font-semibold text-white mb-2">
                    My Inbox
                  </h5>
                  <p className="text-sm text-gray-300">
                    Manage your personal conversations and handle customer inquiries
                  </p>
                </CardContent>
                </div>
              </Card>
            </div>
            <div className="flex-1 min-w-[300px]">
              <Card
                className="bg-[#2a2a2a] border border-gray-700 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
              >
                <div onClick={() => router.push("/inbox/agent-inbox")}>
                <CardContent className="text-center py-6">
                  <Bot className="text-orange-500 w-15 h-15 mx-auto mb-4" size={60} />
                  <h5 className="text-xl font-semibold text-white mb-2">
                    Agent Inbox
                  </h5>
                  <p className="text-sm text-gray-300">
                    Monitor AI agent conversations and automated workflows
                  </p>
                </CardContent>
                </div>
              </Card>
            </div>
            <div className="flex-1 min-w-[300px]">
              <Card
                className="bg-[#2a2a2a] border border-gray-700 cursor-pointer hover:bg-[#3a3a3a] transition-colors"
              >
                <div onClick={() => router.push("/reports")}>
                <CardContent className="text-center py-6">
                  <TrendingUp className="text-blue-500 w-15 h-15 mx-auto mb-4" size={60} />
                  <h5 className="text-xl font-semibold text-white mb-2">
                    Reports
                  </h5>
                  <p className="text-sm text-gray-300">
                    View analytics and performance metrics for your conversations
                  </p>
                </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default InboxPage;