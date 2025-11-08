"use client";
import React, { useEffect, useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapse } from "@/components/ui/collapse";
import { Switch as TSwitch } from "@/components/ui/switch";
import {
  Send,
  MessageSquare,
  Globe2,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Bot,
  Search,
  Mail,
  User as PersonIcon,
} from "lucide-react";
import { useUnifiedChatData } from "../hooks/useUnifiedChatData";
import { useSidebar } from "@/contexts/SidebarContext";

// Types
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead?: boolean;
  avatar?: string;
  role?: string; // "assistant" for AI, "agent" for human agent, "user" for customer
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  status: "online" | "offline" | "away";
  section: string;
}

interface ContactInfo {
  name: string;
  email: string;
  location: string;
  avatar: string;
  status: string;
  chatId: string;
  chatDuration: string;
  totalMessages: number;
  archivedCount: number;
  visitedPagesCount: number;
  tags: string[];
  visitedPages: { url: string; title: string; timestamp: string }[];
}

interface ChatInterfaceProps {
  inboxType: "agent" | "human";
  userEmail?: string;
  userId?: string | null;
  section?: string;
  contactInfo?: ContactInfo;
  suggestedReplies?: string[];
}

const ExactChatInterface: React.FC<ChatInterfaceProps> = ({
  inboxType,
  userEmail = "agent@heirs.com",
  userId = null,
  section,
  contactInfo: defaultContactInfo,
  suggestedReplies = [],
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [aiAgentEnabled, setAiAgentEnabled] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    chatInfo: false,
    visitedPages: false,
  });

  // Format timestamp function
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // If less than 1 minute ago
      if (diffMins < 1) {
        return "Just now";
      }
      // If less than 1 hour ago
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      }
      // If less than 24 hours ago
      if (diffHours < 24) {
        return `${diffHours}h ago`;
      }
      // If less than 7 days ago
      if (diffDays < 7) {
        return `${diffDays}d ago`;
      }
      // Otherwise, show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Just now";
    }
  };

  // Determine if message is from AI Agent or Human Agent
  // Check both sender name and role indicator
  const isAIMessage = (message: Message): boolean => {
    // First check role (most reliable)
    if (message.role === "assistant") {
      return true;
    }
    // Fallback to sender name check
    const senderLower = message.sender.toLowerCase();
    return senderLower === "ai agent" || senderLower.includes("ai") || senderLower.includes("bot");
  };

  const isHumanAgentMessage = (message: Message): boolean => {
    // If it's AI, it's not human
    if (isAIMessage(message)) {
      return false;
    }
    // Check role first (most reliable)
    if (message.role === "agent") {
      return true;
    }
    // Fallback to sender name check
    const senderLower = message.sender.toLowerCase();
    return senderLower === "you" || senderLower === "agent" || (senderLower.includes("agent") && !senderLower.includes("ai"));
  };

  const {
    chats,
    selectedChat,
    setSelectedChat,
    sendMessage,
    markAsRead,
    loading,
    error,
  } = useUnifiedChatData({ inboxType, userEmail, userId, section: section || "" });

  const { isSidebarCollapsed, sidebarWidth, collapsedSidebarWidth } = useSidebar();
  const currentSidebarWidth = isSidebarCollapsed ? collapsedSidebarWidth : sidebarWidth;

  // Fetch AI agent status when chat is selected
  useEffect(() => {
    const fetchAiAgentStatus = async () => {
      if (!selectedChat?.chat.id) {
        setAiAgentEnabled(true); // Default to enabled
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : "https://sakura-backend.onrender.com");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/chats/${selectedChat.chat.id}/ai-agent`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAiAgentEnabled(data.ai_agent_enabled ?? true);
        } else {
          // Default to enabled if fetch fails
          setAiAgentEnabled(true);
        }
      } catch (error) {
        console.error("Error fetching AI agent status:", error);
        setAiAgentEnabled(true); // Default to enabled on error
      }
    };

    fetchAiAgentStatus();
  }, [selectedChat?.chat.id]);

  const handleToggleAiAgent = async (enabled: boolean) => {
    if (!selectedChat?.chat.id) return;

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8000"
        : "https://sakura-backend.onrender.com");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/chats/${selectedChat.chat.id}/ai-agent`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setAiAgentEnabled(enabled);
      } else {
        console.error("Failed to update AI agent status");
        // Revert the toggle on error
        setAiAgentEnabled(!enabled);
      }
    } catch (error) {
      console.error("Error updating AI agent status:", error);
      // Revert the toggle on error
      setAiAgentEnabled(!enabled);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const currentContactInfo = selectedChat?.contactInfo || defaultContactInfo;

  if (loading) {
    return (
      <div className="flex h-screen bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#1a1a1a] overflow-hidden"
      style={{
        width: `calc(100vw - ${currentSidebarWidth}px)`,
        position: "fixed",
        top: 0,
        left: `${currentSidebarWidth}px`,
        right: 0,
        bottom: 0,
        transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
        zIndex: 1100,
      }}
    >
      {/* Top Global Navigation Bar */}
      <div className="h-[52px] bg-[#2a2a2a] border-b border-[#333] flex items-center justify-between px-3.5 z-50">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <Input
                placeholder="Search"
                className="w-72 pl-9 text-sm"
              />
            </div>
            <Chip size="small" className="text-[0.65rem] h-5 bg-gray-800 text-gray-300">ctrl K</Chip>
          </div>
        </div>
        {/* Right side - Logo */}
        <div className="flex items-center gap-3">
          <div className="text-white font-semibold text-base">páse</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 52px)" }}>
        {/* Left Sidebar - Chat List */}
        <div className="w-[300px] bg-[#2a2a2a] border-r border-[#333] flex flex-col overflow-hidden flex-shrink-0">
          {/* Header */}
          <div className="p-2 border-b border-[#333]">
            <div className="text-white font-semibold text-[0.95rem] mb-1">All chats</div>
            <div className="text-[#999] text-[0.8rem] font-normal">{chats.length} {chats.length === 1 ? 'chat' : 'chats'}</div>
          </div>
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {chats.length === 0 ? (
              <div className="p-2 text-center">
                <div className="text-[#888] text-[0.8rem]">
                  No active chats found. {loading ? "Loading..." : "Chats will appear here when customers start conversations."}
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="text-[#666] text-[0.7rem] mt-1.5">
                    Debug: Section="{section}", Chats={chats.length}, Loading={loading ? "Yes" : "No"}, Error={error || "None"}
                  </div>
                )}
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full flex items-start gap-3 px-2.5 py-1.5 hover:bg-[#3a3a3a] ${selectedChat?.chat.id === chat.chat.id ? 'bg-[#3a3a3a]' : ''}`}
                >
                  <div className="min-w-[44px]">
                    <Badge content={chat.chat.unreadCount} invisible={chat.chat.unreadCount === 0}>
                      <Avatar size={36} fallback={chat.chat.avatar} />
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[0.875rem] font-medium mb-0.5">{chat.chat.name}</div>
                    <div className="text-[#999] text-[0.8rem] truncate mb-0.5">{chat.chat.lastMessage}</div>
                    <div className="text-[#666] text-[0.7rem] font-normal">{chat.chat.timestamp}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Panel - Chat Messages */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
          {/* Chat Header */}
          <div className="p-2 border-b border-[#333] bg-[#2a2a2a] flex items-start justify-between">
            <div className="flex-1">
              <div className="text-white font-semibold text-[0.95rem] mb-1">{currentContactInfo?.name || "Select a chat"}</div>
              {currentContactInfo?.email && (
                <div className="mt-1 text-[#999] text-[0.8rem]">
                  E-mail: <span className="text-[#2196f3] cursor-pointer font-normal">{currentContactInfo.email}</span>
                </div>
              )}
            </div>
            {selectedChat && (
              <div className="ml-4 flex items-center">
                <div className="flex items-center gap-2" title={aiAgentEnabled ? "AI Agent is responding automatically" : "AI Agent responses are disabled"}>
                  <TSwitch
                    checked={aiAgentEnabled}
                    onChange={(checked) => handleToggleAiAgent(checked)}
                    disabled={loading}
                    size="sm"
                  />
                  <div className="flex items-center gap-1">
                    <Bot className={`h-4 w-4 ${aiAgentEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-[#999] text-[0.8rem]">AI Agent</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
            {selectedChat?.messages.map((message) => {
              const isAI = isAIMessage(message);
              const isHumanAgent = isHumanAgentMessage(message);
              const isAgentMessage = isAI || isHumanAgent;
              const isCustomerMessage = !isAgentMessage;
              const formattedTime = formatTimestamp(message.timestamp);

              const bubbleBg = isAI ? '#4caf50' : isHumanAgent ? '#1976d2' : '#2a2a2a';
              const bubbleBorder = isAI ? '#66bb6a' : isHumanAgent ? '#42a5f5' : '#333';

              return (
                <div key={message.id} className={`flex ${isAgentMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-[70%] flex flex-col ${isAgentMessage ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      {isCustomerMessage && (
                        <Avatar size={20} colorClassName="bg-[#ff6b35] text-white" fallback={message.avatar} className="text-[0.7rem]" />
                      )}
                      {isAgentMessage && (
                        <div className="flex items-center gap-1">
                          {isAI ? (
                            <Chip size="small" className="h-5 text-[0.7rem] bg-green-600 text-white">
                              <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" /> AI Agent</span>
                            </Chip>
                          ) : (
                            <Chip size="small" className="h-5 text-[0.7rem] bg-blue-600 text-white">
                              <span className="inline-flex items-center gap-1"><PersonIcon className="h-3 w-3" /> Agent</span>
                            </Chip>
                          )}
                        </div>
                      )}
                      <span className="text-[#999] text-[0.75rem] font-normal">{formattedTime}</span>
                    </div>
                    <div
                      className="text-white rounded-xl shadow"
                      style={{ backgroundColor: bubbleBg, border: `1px solid ${bubbleBorder}` }}
                    >
                      <div className="p-3 text-[0.85rem] leading-relaxed font-normal">{message.content}</div>
                    </div>
                    <div className="text-[0.65rem] text-[#666] mt-1 font-normal">
                      {isAgentMessage ? (message.isRead !== false ? "Read" : "Sent") : (message.isRead !== false ? "Read" : "Unread")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Area */}
          <div className="p-2 border-t border-[#333] bg-[#2a2a2a]">
            <Input
              placeholder="Enter message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="mb-3"
            />
            <div className="flex items-center justify-end">
              <Button onClick={handleSendMessage} size="small" disabled={!newMessage.trim()} className="px-3 py-1.5 text-sm bg-[#333] hover:bg-[#444] disabled:bg-[#222] disabled:text-[#666]">
                <span className="inline-flex items-center gap-2">
                  Send <Send className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Contact Info */}
        <div className="w-[300px] bg-[#2a2a2a] border-l border-[#333] p-2 overflow-y-auto overflow-x-hidden flex-shrink-0">
          {currentContactInfo ? (
            <>
              {/* Contact Profile */}
              <div className="flex items-center gap-4 mb-2">
                <Avatar size={40} colorClassName="bg-[#ff6b35] text-white" fallback={currentContactInfo.avatar} className="text-[0.95rem]" />
                <div>
                  <div className="text-white font-semibold text-[0.95rem] mb-0.5">{currentContactInfo.name}</div>
                  <div className="text-[#999] text-[0.8rem] font-normal">{currentContactInfo.status}</div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Mail className="h-4 w-4 text-[#999]" />
                  <div className="text-[#999] text-[0.8rem] font-normal">{currentContactInfo.email}</div>
                </div>
                {/* Stats */}
                <div className="flex gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#999]" />
                    <div className="text-white text-[0.8rem] font-medium">{currentContactInfo.totalMessages} messages</div>
                  </div>
                  {currentContactInfo.visitedPagesCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-[#999]" />
                      <div className="text-white text-[0.8rem] font-medium">{currentContactInfo.visitedPagesCount} pages</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Info Section */}
              <div className="mb-2">
                <button onClick={() => toggleSection('chatInfo')} className="w-full flex items-center justify-between text-white text-[0.85rem] font-medium py-1 px-2 hover:bg-white/5 rounded">
                  <span>Chat info</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.chatInfo ? 'rotate-180' : ''}`} />
                </button>
                <Collapse in={expandedSections.chatInfo}>
                  <div className="pl-3 mt-2">
                    <div className="text-[#999] text-[0.75rem] mb-2">Chat ID {currentContactInfo.chatId}</div>
                    <div className="text-[#999] text-[0.75rem]">Chat duration {currentContactInfo.chatDuration}</div>
                  </div>
                </Collapse>
              </div>

              {/* Visited Pages Section */}
              {currentContactInfo.visitedPages && currentContactInfo.visitedPages.length > 0 && (
                <div className="mb-2">
                  <button onClick={() => toggleSection('visitedPages')} className="w-full flex items-center justify-between text-white text-[0.85rem] font-medium py-1 px-2 hover:bg-white/5 rounded">
                    <span>Visited pages</span>
                    <span className="inline-flex items-center gap-2">
                      <Badge content={currentContactInfo.visitedPagesCount} />
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.visitedPages ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  <Collapse in={expandedSections.visitedPages}>
                    <div className="pl-3 mt-2">
                      {currentContactInfo.visitedPages.map((page, index) => (
                        <div key={index} className="mb-2 flex items-start gap-2">
                          <Globe2 className="h-4 w-4 text-[#999] mt-0.5" />
                          <div>
                            <div className="text-white text-[0.75rem]">{typeof page === 'string' ? page : page.title}</div>
                            {typeof page !== 'string' && page.timestamp && (
                              <div className="text-[#999] text-[0.65rem]">{page.timestamp}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </div>
              )}
            </>
          ) : (
            <div className="text-center mt-3">
              <div className="text-[#999] text-[0.8rem] font-normal">Select a chat to view contact information</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExactChatInterface;
