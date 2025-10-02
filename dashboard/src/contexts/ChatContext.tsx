"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Types for chat system
export interface ChatMessage {
  id: string;
  sender: "user" | "customer";
  content: string;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  isLink?: boolean;
  linkUrl?: string;
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedChat, setSelectedChat] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: ChatMessage[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users?skip=0&limit=100`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Map backend data to Customer interface
      const mapped: Customer[] = data.users.map((u: any) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        location: u.location || "",
        avatar: u.name.charAt(0),
        status: u.last_seen ? computeStatus(u.last_seen) : "offline",
        lastMessage: u.lastMessage || "",
        lastMessageTime: u.lastMessageTime ? new Date(u.lastMessageTime) : undefined,
        chatId: u.chat_id,
        category: u.category,
        chatDuration: u.chat_duration,
        visitedPages: u.visitedPages,
        totalMessages: u.totalMessages,
        tags: u.tags || [],
      }));
      setCustomers(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific chat
  const fetchChatMessages = async (chatId: string) => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
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
      const res = await fetch(`${API_BASE_URL}/chats/${chatId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        mode: "cors",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
      // Optimistically add message to state
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send message");
    }
  };

  // Utility: compute online/offline/away status based on last_seen
  const computeStatus = (lastSeen: string | Date): "online" | "away" | "offline" => {
    const last = new Date(lastSeen).getTime();
    const now = Date.now();
    const diff = now - last;
    if (diff < 5 * 60 * 1000) return "online"; // last 5 min
    if (diff < 30 * 60 * 1000) return "away"; // last 30 min
    return "offline";
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
