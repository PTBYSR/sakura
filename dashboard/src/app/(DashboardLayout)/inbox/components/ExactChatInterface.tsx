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
  ArrowLeft,
  MoreVertical,
  Paperclip,
  ChevronRight,
  CheckCheck,
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
  const [isLgUp, setIsLgUp] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showContactModal, setShowContactModal] = useState(false);
  useEffect(() => {
    const checkLgUp = () => setIsLgUp(window.innerWidth >= 1024);
    checkLgUp();
    window.addEventListener("resize", checkLgUp);
    return () => window.removeEventListener("resize", checkLgUp);
  }, []);

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

  // Date header formatter (e.g., "Fri, Jul 26")
  const formatDateHeader = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
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

  const handleSendMessage = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault(); // Prevent form submission
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  // Whenever the selected chat changes, mark it as read to clear the badge
  useEffect(() => {
    if (selectedChat?.chat.id) {
      markAsRead(selectedChat.chat.id);
    }
  }, [selectedChat?.chat.id, markAsRead]);

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
      className="flex flex-col bg-[#1a1a1a] overflow-hidden"
      style={
        isLgUp
          ? {
              width: `calc(100vw - ${currentSidebarWidth}px)`,
              position: "fixed",
              top: "70px",
              left: `${currentSidebarWidth}px`,
              right: 0,
              bottom: 0,
              height: "calc(100vh - 70px)",
              transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
              zIndex: 1100,
            }
          : {
              width: "100vw",
              position: "fixed",
              top: "70px",
              left: 0,
              right: 0,
              bottom: 0,
              height: "calc(100vh - 70px)",
              zIndex: 1100,
            }
      }
    >
      {/* Top Global Navigation Bar - hide during chat on mobile to maximize space */}
      {(isLgUp || mobileView === 'list') && (
        <div className="h-[52px] bg-[#2a2a2a] border-b border-[#333] flex items-center justify-between px-3.5 z-50">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  placeholder="Search"
                  className="w-40 sm:w-60 md:w-72 pl-9 text-sm"
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
      )}

      {/* Main Content Area */}
      <div
        className="flex flex-col lg:flex-row flex-1 overflow-hidden"
        style={isLgUp ? { height: "calc(100% - 52px)" } : {}}
      >
        {/* Left Sidebar - Chat List */}
        <div className={`w-full lg:w-[300px] bg-[#2a2a2a] border-b lg:border-b-0 lg:border-r border-[#333] flex flex-col overflow-hidden flex-shrink-0 ${!isLgUp && mobileView === 'chat' ? 'hidden' : ''}`}>
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
                    Debug: Section=&quot;{section}&quot;, Chats={chats.length}, Loading={loading ? 'Yes' : 'No'}, Error={error || 'None'}
                  </div>
                )}
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = selectedChat?.chat.id === chat.chat.id;
                const isUnread = chat.chat.unreadCount > 0;
                return (
                  <button
                    key={chat.chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      markAsRead(chat.chat.id);
                      if (!isLgUp) {
                        setMobileView('chat');
                      }
                    }}
                    className={`w-full px-3 py-5 lg:py-3 min-h-[88px] border-b border-[#2b2b2b] text-left transition-colors ${isActive ? 'bg-[#333333]' : 'hover:bg-[#2a2a2a]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Badge content={chat.chat.unreadCount} invisible={chat.chat.unreadCount === 0}>
                          <Avatar size={46} fallback={chat.chat.avatar} />
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-1 min-w-0">
                            <div className={`text-white text-[0.95rem] leading-tight ${isUnread ? 'font-semibold' : 'font-medium'} truncate`}>
                              {chat.chat.name}
                            </div>
                          </div>
                          <div className="ml-2 shrink-0 text-[0.7rem] text-[#9aa0a6]">
                            {chat.chat.timestamp}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[0.85rem] text-[#a7adb3]">
                          {chat.chat.unreadCount === 0 && (
                            <CheckCheck className="w-4 h-4 text-[#6fa8ff]" />
                          )}
                          <span className="truncate">{chat.chat.lastMessage}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#555]" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Panel - Chat Messages */}
        <div className={`flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden ${!isLgUp && mobileView === 'list' ? 'hidden' : ''}`}>
          {/* Chat Header */}
          <div className="px-2 h-14 lg:h-[52px] border-b border-[#333] bg-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {!isLgUp && (
                <button
                  onClick={() => setMobileView('list')}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-300 hover:bg-[#3a3a3a]"
                  aria-label="Back to chats"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0">
                <div className="text-white font-semibold text-sm truncate">{currentContactInfo?.name || "Select a chat"}</div>
                {currentContactInfo?.email && (
                  <div className="text-[#999] text-[0.75rem] truncate">{currentContactInfo.email}</div>
                )}
              </div>
            </div>
            {selectedChat ? (
              <div className="ml-2 flex items-center gap-1">
                {!isLgUp && (
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-300 hover:bg-[#3a3a3a]"
                    aria-label="Show contact info"
                  >
                    <Avatar size={20} fallback={currentContactInfo?.avatar || 'C'} />
                  </button>
                )}
                <button
                  className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-300 hover:bg-[#3a3a3a]"
                  title={aiAgentEnabled ? "AI Agent is responding automatically" : "AI Agent responses are disabled"}
                >
                  <TSwitch
                    checked={aiAgentEnabled}
                    onChange={(checked) => handleToggleAiAgent(checked)}
                    disabled={loading}
                    size="sm"
                  />
                </button>
                <button
                  className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-300 hover:bg-[#3a3a3a]"
                  aria-label="More"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="ml-2" />
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
            {selectedChat?.messages.map((message, idx, arr) => {
              const isAI = isAIMessage(message);
              const isHumanAgent = isHumanAgentMessage(message);
              const isAgentMessage = isAI || isHumanAgent;
              const isCustomerMessage = !isAgentMessage;
              const formattedTime = formatTimestamp(message.timestamp);
              const currentHeader = formatDateHeader(message.timestamp);
              const prevHeader = idx > 0 ? formatDateHeader(arr[idx - 1].timestamp) : undefined;
              const showHeader = !prevHeader || prevHeader !== currentHeader;

              const bubbleBg = isAI ? '#2f6f3a' : isHumanAgent ? '#1f4b79' : '#232323';
              const bubbleBorder = isAI ? '#3f8a4a' : isHumanAgent ? '#2c6aa3' : '#343434';

              return (
                <React.Fragment key={message.id}>
                  {showHeader && (
                    <div className="flex justify-center my-2">
                      <div className="px-3 py-1 rounded-full text-[0.75rem] bg-[#2a2a2a] text-[#c9c9c9] border border-[#3a3a3a]">
                        {currentHeader}
                      </div>
                    </div>
                  )}
                  <div className={`flex ${isAgentMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`max-w-[88%] lg:max-w-[70%] flex flex-col ${isAgentMessage ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`text-white shadow border`}
                        style={{
                          backgroundColor: bubbleBg,
                          borderColor: bubbleBorder,
                          borderRadius: 18,
                        }}
                      >
                        <div
                          className={`px-3.5 py-2.5 text-[1rem] leading-relaxed break-words ${
                            isAgentMessage ? 'rounded-tl-2xl rounded-tr-md rounded-br-2xl rounded-bl-2xl' : 'rounded-tr-2xl rounded-tl-md rounded-bl-2xl rounded-br-2xl'
                          }`}
                        >
                          {message.content}
                          <div className="mt-1.5 flex justify-end items-center gap-1 text-[0.7rem] text-[#b3c1cc] opacity-90">
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Message Input Area - sticky and safe-area aware on mobile */}
          <div className="border-t border-[#333] bg-[#2a2a2a] px-2 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-end gap-2 py-2">
              <button
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-300 hover:bg-[#3a3a3a]"
                aria-label="Attach"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <Input
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleSendMessage(e);
                    }
                  }}
                  className="bg-[#1f1f1f] border-[#444] placeholder:text-[#888] h-14 md:h-12"
                />
              </div>
              <button
                onClick={(e) => handleSendMessage(e)}
                disabled={!newMessage.trim()}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${newMessage.trim() ? 'bg-[#1976d2] text-white hover:brightness-110' : 'bg-[#333] text-[#777]'}`}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Contact Info */}
        <div className="w-full lg:w-[300px] bg-[#2a2a2a] border-t lg:border-t-0 lg:border-l border-[#333] p-2 pb-6 lg:pb-6 overflow-y-auto overflow-x-hidden flex-shrink-0 hidden lg:block mb-3">
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

      {/* Mobile Contact Modal */}
      {!isLgUp && showContactModal && (
        <div
          className="fixed inset-0 z-[1600] bg-black/60 flex items-end justify-center px-3 pb-[env(safe-area-inset-bottom)]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowContactModal(false);
          }}
        >
          <div className="w-full max-w-md">
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl overflow-hidden mb-2">
              <div className="py-3 px-4 text-center border-b border-[#3a3a3a]">
                <div className="text-white font-medium text-[0.95rem]">Contact details</div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
                {currentContactInfo ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar size={40} colorClassName="bg-[#ff6b35] text-white" fallback={currentContactInfo.avatar} className="text-[0.95rem]" />
                      <div>
                        <div className="text-white font-semibold text-[0.95rem]">{currentContactInfo.name}</div>
                        <div className="text-[#999] text-[0.8rem]">{currentContactInfo.status}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#999]" />
                        <div className="text-[#cfcfcf] text-[0.85rem]">{currentContactInfo.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[#999]" />
                        <div className="text-[#cfcfcf] text-[0.85rem]">{currentContactInfo.totalMessages} messages</div>
                      </div>
                      {currentContactInfo.visitedPagesCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Globe2 className="h-4 w-4 text-[#999]" />
                          <div className="text-[#cfcfcf] text-[0.85rem]">{currentContactInfo.visitedPagesCount} pages</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-[#999] text-[0.85rem]">No contact selected</div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full bg-[#2a2a2a] text-white rounded-2xl py-3 border border-[#3a3a3a] mb-[env(safe-area-inset-bottom)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExactChatInterface;
