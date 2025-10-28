"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

// Types
export interface ChatMessage {
  id: string;
  sender: "user" | "customer" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  isLink?: boolean;
  linkUrl?: string;
  tags?: string[];
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  location?: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  chatId?: string;
  category?: "human-chats" | "escalated" | "resolved" | "ai-active" | "ai-resolved";
  chatDuration?: string;
  visitedPages?: number;
  totalMessages?: number;
  tags?: string[];
}

interface ChatContextType {
  customers: Customer[];
  selectedChat: Customer | null;
  setSelectedChat: (customer: Customer | null) => void;
  getCustomersByCategory: (category: string) => Customer[];
  getChatMessages: (chatId: string) => ChatMessage[];
  sendMessage: (chatId: string, content: string) => void;
  loading: boolean;
  error: string | null;
  refreshCustomer: (customerId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};

// Dynamically switch between local and production backend URLs
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://sakura-backend.onrender.com");

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedChat, setSelectedChat] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: ChatMessage[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute user status based on last seen
  const computeStatus = (lastSeen: string | Date): "online" | "away" | "offline" => {
    const last = new Date(lastSeen).getTime();
    const now = Date.now();
    const diff = now - last;
    if (diff < 5 * 60 * 1000) return "online";
    if (diff < 30 * 60 * 1000) return "away";
    return "offline";
  };

  // Aggregate chat categories per user
  const getUserCategory = (chats: any[]): Customer["category"] => {
    if (!chats || chats.length === 0) return "human-chats";
    if (chats.some(c => c.category === "escalated")) return "escalated";
    if (chats.some(c => c.category === "ai-active")) return "ai-active";
    if (chats.every(c => c.category === "ai-resolved")) return "ai-resolved";
    if (chats.every(c => c.status === "closed")) return "resolved";
    return "human-chats";
  };

  // Fetch all users
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users?skip=0&limit=100`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const mapped: Customer[] = data.users.map((u: any) => {
        const chats = u.chats || [];
        const latestChat = chats[chats.length - 1] || {};
        const latestMsg = latestChat.messages?.[latestChat.messages.length - 1];

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          location: u.location || "",
          avatar: u.name.charAt(0),
          status: u.last_seen ? computeStatus(u.last_seen) : "offline",
          lastMessage: latestMsg?.text || "",
          lastMessageTime: latestMsg?.timestamp ? new Date(latestMsg.timestamp) : undefined,
          chatId: latestChat.chat_id,
          category: getUserCategory(chats),
          chatDuration: u.chat_duration,
          visitedPages: u.visitedPages,
          totalMessages: u.totalMessages,
          tags: u.tags || [],
        };
      });

      setCustomers(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh single customer
  const refreshCustomer = async (customerId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${customerId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const u = await res.json();

      const chats = u.chats || [];
      const latestChat = chats[chats.length - 1] || {};
      const latestMsg = latestChat.messages?.[latestChat.messages.length - 1];

      setCustomers(prev =>
        prev.map(c =>
          c._id === u._id
            ? {
                ...c,
                category: getUserCategory(chats),
                tags: u.tags || [],
                totalMessages: u.totalMessages,
                lastMessage: latestMsg?.text || "",
                lastMessageTime: latestMsg?.timestamp ? new Date(latestMsg.timestamp) : undefined,
                chatId: latestChat.chat_id,
              }
            : c
        )
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  // Fetch messages for a chat
  const fetchChatMessages = async (chatId: string) => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const mapped: ChatMessage[] = data.messages.map((m: any) => ({
        id: m._id,
        sender: m.sender,
        content: m.content,
        timestamp: new Date(m.timestamp),
        status: m.status,
        isLink: m.isLink,
        linkUrl: m.linkUrl,
        tags: m.tags || [],
      }));

      setMessages(prev => ({ ...prev, [chatId]: mapped }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch chat messages");
    } finally {
      setLoading(false);
    }
  };

  const getCustomersByCategory = (category: string): Customer[] => {
    return customers.filter(c => c.category === category);
  };

  const getChatMessages = (chatId: string): ChatMessage[] => {
    if (!messages[chatId]) {
      fetchChatMessages(chatId);
      return [];
    }
    return messages[chatId];
  };

  const sendMessage = async (chatId: string, content: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);

      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: "user",
        content,
        timestamp: new Date(),
        status: "sent",
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMsg],
      }));

      const customer = customers.find(c => c.chatId === chatId);
      if (customer) refreshCustomer(customer._id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send message");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <ChatContext.Provider
      value={{
        customers,
        selectedChat,
        setSelectedChat,
        getCustomersByCategory,
        getChatMessages,
        sendMessage,
        loading,
        error,
        refreshCustomer,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
