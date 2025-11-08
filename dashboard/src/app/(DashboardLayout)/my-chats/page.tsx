"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

interface ChatInstance {
  chat_id: string;
  status: string;
  created_at: string;
  last_activity: string;
  total_messages: number;
  messages: Array<{
    role: string;
    text: string;
    content: string;
    timestamp: string;
    read: boolean;
  }>;
}

interface UserChatsResponse {
  user_id: string;
  user_name: string;
  user_email: string;
  chats: ChatInstance[];
  total_chats: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function MyChatsPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; id: string } | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/authentication/login");
      return;
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchMyChats = async () => {
      if (!session?.user?.id) {
        console.log("No session or user ID available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userId = session.user.id;
        console.log("Fetching chats for user ID:", userId);
        
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/chats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            console.log("User not found in database, showing empty state");
            setChats([]);
            setUserInfo({
              name: session.user.name || "User",
              email: session.user.email || "",
              id: userId,
            });
            setLoading(false);
            return;
          }
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch chats: ${response.status} - ${errorText}`);
        }

        const data: UserChatsResponse = await response.json();
        console.log("Fetched chats data:", data);
        setChats(data.chats || []);
        setUserInfo({
          name: data.user_name,
          email: data.user_email,
          id: data.user_id,
        });
      } catch (err: any) {
        console.error("Error fetching chats:", err);
        setError(err.message || "Failed to load your chats");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchMyChats();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [session, isPending]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getLastMessage = (chat: ChatInstance) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "No messages yet";
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.text || lastMsg.content || "No message content";
  };

  if (isPending || (loading && !session)) {
    return (
      <PageContainer title="My Chats" description="View your chat history">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#EE66AA]" />
          <p className="mt-4 text-sm text-gray-300">Loading...</p>
        </div>
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer title="My Chats" description="View your chat history">
        <div className="p-6">
          <div className="p-4 bg-yellow-600/20 border border-yellow-500 rounded-lg text-yellow-400 mb-4">
            Please log in to view your chats.
          </div>
          <p className="text-base text-gray-300">
            You need to be logged in to view your chat history.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Chats" description="View your chat history">
      <div className="p-6">
        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400 text-xs">
            Debug: Session: {session ? "✓" : "✗"} | User ID: {session?.user?.id || "N/A"} | Loading: {loading ? "Yes" : "No"}
          </div>
        )}

        {/* User Info */}
        {userInfo ? (
          <div className="mb-6">
            <h5 className="text-xl font-semibold text-white mb-1">
              Welcome, {userInfo.name}!
            </h5>
            <p className="text-sm text-gray-300 mb-3">
              {userInfo.email}
            </p>
            <Chip
              label={`${chats.length} ${chats.length === 1 ? "chat" : "chats"}`}
              color="primary"
              size="small"
            />
          </div>
        ) : session?.user ? (
          <div className="mb-6">
            <h5 className="text-xl font-semibold text-white mb-1">
              Welcome, {session.user.name || session.user.email || "User"}!
            </h5>
            <p className="text-sm text-gray-300 mb-3">
              {session.user.email}
            </p>
            <Chip
              label="Loading your chats..."
              color="primary"
              size="small"
            />
          </div>
        ) : null}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Widget Link */}
        {userInfo ? (
          <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
            <p className="text-sm mb-1">
              Your unique widget link:{" "}
              <strong>
                {typeof window !== "undefined" && `http://localhost:3000/widget/${userInfo.id}`}
              </strong>
            </p>
            <p className="text-xs text-gray-300 mt-2">
              Copy this link to share with customers or embed on your website
            </p>
          </div>
        ) : session?.user?.id ? (
          <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400">
            <p className="text-sm mb-1">
              Your unique widget link:{" "}
              <strong>
                {typeof window !== "undefined" && `http://localhost:3000/widget/${session.user.id}`}
              </strong>
            </p>
            <p className="text-xs text-gray-300 mt-2">
              Copy this link to share with customers or embed on your website
            </p>
          </div>
        ) : null}

        {/* Chats List */}
        <Card>
          <CardContent className="p-6">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-base text-gray-300 mb-2">
                  No chats yet. Start a conversation using your widget!
                </p>
              </div>
            ) : (
              <>
                <h6 className="text-lg font-semibold text-white mb-4">
                  Your Chat History
                </h6>
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.chat_id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors mb-2 ${
                        selectedChat?.chat_id === chat.chat_id
                          ? "border-[#EE66AA] bg-[#EE66AA]/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedChat(selectedChat?.chat_id === chat.chat_id ? null : chat)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="text-base font-semibold text-white">
                          Chat {chat.chat_id.substring(0, 8)}
                        </h6>
                        <Chip
                          label={chat.status}
                          size="small"
                          color={chat.status === "open" ? "success" : "secondary"}
                          className="text-xs"
                        />
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {getLastMessage(chat)}
                      </p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{formatDate(chat.last_activity)}</span>
                        <span>{chat.total_messages} {chat.total_messages === 1 ? "message" : "messages"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Chat Messages */}
                {selectedChat && (
                  <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg max-h-[400px] overflow-auto">
                    <h6 className="text-lg font-semibold text-white mb-4">
                      Messages
                    </h6>
                    <div className="space-y-4">
                      {selectedChat.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-[#EE66AA] text-white"
                                : "bg-[#2a2a2a] text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.text || msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDate(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
