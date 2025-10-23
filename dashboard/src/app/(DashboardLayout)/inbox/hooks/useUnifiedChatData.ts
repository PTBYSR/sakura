import { useState, useEffect } from 'react';
import { dummyData } from '../data/dummyData';

// Dynamically switch between local and production backend URLs
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://sakura-backend.onrender.com");

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead?: boolean;
  avatar?: string;
}

export interface ContactInfo {
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
  visitedPages: { url: string; title: string; timestamp: string; }[];
}

export interface BackendUserData {
  name: string;
  email: string;
  ip: string;
  location: {
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  device: {
    type: string;
    os: string;
    browser: string;
  };
  referrer: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
}

export interface ChatInstance {
  chat: {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    avatar: string;
    status: "online" | "offline" | "away";
    section: string;
  };
  messages: ChatMessage[];
  contactInfo: ContactInfo;
  backendUserData: BackendUserData;
}

export interface UseUnifiedChatDataProps {
  inboxType: "human" | "agent";
  userEmail: string;
  section: string;
}

// Chat categorization mapping
const CHAT_CATEGORIZATION = {
  "agent-inbox-active": { category: "agent-inbox", status: "active" },
  "agent-inbox-resolved": { category: "agent-inbox", status: "resolved" },
  "my-inbox-chats": { category: "my-inbox", status: "pending-human" },
  "my-inbox-escalated": { category: "my-inbox", status: "escalated" },
  "my-inbox-resolved": { category: "my-inbox", status: "resolved" },
} as const;

// Helper function to check if a chat matches the categorization criteria
const matchesCategorization = (user: any, chat: any, categorization: { category: string; status: string }) => {
  // Check user-level category and status
  const userMatches = user.category === categorization.category && user.status === categorization.status;
  
  // Check chat-level category and status (if they exist)
  const chatMatches = chat.category === categorization.category && chat.status === categorization.status;
  
  // Return true if either user or chat matches (for flexibility)
  return userMatches || chatMatches;
};

export const useUnifiedChatData = ({ inboxType, userEmail, section }: UseUnifiedChatDataProps) => {
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  const fetchBackendData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/debug/users-chats`);
      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.warn('Failed to fetch backend data, using dummy data:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get categorization criteria for this section
        const categorization = CHAT_CATEGORIZATION[section as keyof typeof CHAT_CATEGORIZATION];
        if (!categorization) {
          console.warn(`Unknown section: ${section}`);
          setChats([]);
          setLoading(false);
          return;
        }

        // Try to fetch real backend data first
        const backendUsers = await fetchBackendData();
        let sourceData = backendUsers || dummyData;

        // Filter users based on category and status
        const filteredUsers = sourceData.filter((user: any) => {
          // Check if user has chats that match the categorization criteria
          const hasMatchingChats = user.chats && user.chats.some((chat: any) => {
            return matchesCategorization(user, chat, categorization);
          });

          return hasMatchingChats;
        });

        // Transform the filtered data to ChatInstance format
        const transformedChats: ChatInstance[] = [];

        filteredUsers.forEach((user: any) => {
          if (user.chats && user.chats.length > 0) {
            user.chats.forEach((chat: any) => {
              // Only include chats that match the categorization criteria
              if (matchesCategorization(user, chat, categorization)) {
                const chatInstance: ChatInstance = {
                  chat: {
                    id: chat.chat_id || chat.id,
                    name: user.name || "Unknown User",
                    lastMessage: chat.messages && chat.messages.length > 0 
                      ? chat.messages[chat.messages.length - 1].text || "No messages"
                      : "No messages",
                    timestamp: chat.last_activity || chat.created_at || new Date().toISOString(),
                    unreadCount: chat.total_messages || 0,
                    avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                    status: chat.status === "active" ? "online" : "offline",
                    section: section,
                  },
                  messages: (chat.messages || []).map((msg: any, index: number) => ({
                    id: msg.id || `msg-${index}`,
                    content: msg.text || msg.content || "",
                    sender: msg.role === "assistant" ? "Agent" : user.name || "User",
                    timestamp: msg.timestamp || new Date().toISOString(),
                    isRead: true,
                    avatar: msg.role === "assistant" ? "A" : user.name?.charAt(0).toUpperCase() || "U",
                  })),
                  contactInfo: {
                    name: user.name || "Unknown User",
                    email: user.email || "",
                    location: user.location 
                      ? `${user.location.city || "Unknown"}, ${user.location.country || "Unknown"}`
                      : "Unknown Location",
                    avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                    status: chat.status === "active" ? "Online" : "Offline",
                    chatId: chat.chat_id || chat.id,
                    chatDuration: "0m", // Calculate from timestamps if needed
                    totalMessages: chat.total_messages || chat.messages?.length || 0,
                    archivedCount: 0,
                    visitedPagesCount: 0,
                    tags: chat.tags || [],
                    visitedPages: [
                      { url: user.referrer || "https://example.com", title: "Landing Page", timestamp: "2m ago" }
                    ],
                  },
                  backendUserData: {
                    name: user.name || "Unknown User",
                    email: user.email || "",
                    ip: user.ip || "Unknown",
                    location: user.location || { city: "Unknown", region: "Unknown", country: "Unknown", timezone: "Unknown" },
                    device: user.device || { type: "Unknown", os: "Unknown", browser: "Unknown" },
                    referrer: user.referrer || "https://example.com",
                    utm: user.utm || { source: "", medium: "", campaign: "", term: "", content: "" },
                  },
                };

                transformedChats.push(chatInstance);
              }
            });
          }
        });

        setChats(transformedChats);
        
        // Set the first chat as selected by default
        if (transformedChats.length > 0) {
          setSelectedChat(transformedChats[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [inboxType, userEmail, section]);

  const sendMessage = async (message: string) => {
    if (!selectedChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      sender: userEmail.includes('agent') ? 'Agent' : 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      avatar: userEmail.includes('agent') ? 'A' : selectedChat.contactInfo.avatar,
    };

    // Update the selected chat with the new message
    setSelectedChat(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        chat: {
          ...prev.chat,
          lastMessage: message,
          timestamp: 'now',
        },
      };
    });

    // Update the chat in the chats list
    setChats(prev => 
      prev.map(chat => 
        chat.chat.id === selectedChat.chat.id 
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              chat: {
                ...chat.chat,
                lastMessage: message,
                timestamp: 'now',
              },
            }
          : chat
      )
    );
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => 
      prev.map(chat => 
        chat.chat.id === chatId 
          ? { ...chat, chat: { ...chat.chat, unreadCount: 0 } }
          : chat
      )
    );
  };

  return {
    chats,
    selectedChat,
    setSelectedChat,
    sendMessage,
    markAsRead,
    loading,
    error,
  };
};