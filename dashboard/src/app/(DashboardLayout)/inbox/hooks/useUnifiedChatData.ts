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

// Chat categorization mapping - maps section names to category/status filters
const CHAT_CATEGORIZATION: Record<string, { category?: string; status?: string }> = {
  "unified-inbox": {}, // Show all chats regardless of category/status
  "agent-inbox-active": { category: "agent-inbox", status: "active" },
  "agent-inbox-resolved": { category: "agent-inbox", status: "resolved" },
  "my-inbox-chats": { category: "human-chats", status: "active" }, // Active human chats
  "my-inbox-escalated": { category: "human-chats", status: "escalated" },
  "my-inbox-resolved": { category: "human-chats", status: "resolved" },
} as const;

// Helper function to check if a chat matches the categorization criteria
const matchesCategorization = (user: any, chat: any, categorization: { category?: string; status?: string }) => {
  // If no filters specified (unified inbox), show all
  if (!categorization.category && !categorization.status) {
    return true;
  }

  // Category is stored on the user document
  const categoryMatch = !categorization.category || user.category === categorization.category;
  
  // Status: Use USER status for chat status (user.status determines the chat's status)
  // This means if user.status === "active", the chat is considered "active"
  let statusMatch = true;
  if (categorization.status) {
    // Use user.status as the chat's status
    if (user.status) {
      statusMatch = user.status.toLowerCase() === categorization.status.toLowerCase();
    } else {
      statusMatch = false;
    }
  }
  
  // Both category and status must match
  return categoryMatch && statusMatch;
};

export const useUnifiedChatData = ({ inboxType, userEmail, section }: UseUnifiedChatDataProps) => {
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend (same endpoint as bank page)
  const fetchBackendData = async () => {
    try {
      console.log("🔄 Fetching live data from backend...");
      console.log(`📍 API URL: ${API_BASE_URL}/api/debug/users-chats`);
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/debug/users-chats`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("📊 Received backend data:", {
        usersCount: data.users?.length || 0,
        firstUser: data.users?.[0] ? {
          name: data.users[0].name,
          email: data.users[0].email,
          category: data.users[0].category,
          status: data.users[0].status,
          chatsCount: data.users[0].chats?.length || 0
        } : null
      });
      return data.users || [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ Request timed out, using dummy data');
      } else {
        console.warn('⚠️ Failed to fetch backend data, using dummy data:', error);
      }
      return null;
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!section) {
          console.warn('⚠️ No section provided, cannot load chats');
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }

        // Get categorization criteria for this section
        const categorization = CHAT_CATEGORIZATION[section as keyof typeof CHAT_CATEGORIZATION] || {};
        console.log(`📋 Filtering chats for section: ${section}`, categorization);
        console.log(`🌐 API Base URL: ${API_BASE_URL}`);

        // Try to fetch real backend data first
        const backendUsers = await fetchBackendData();
        let sourceData = backendUsers || dummyData;
        
        if (!backendUsers) {
          console.log('📦 Using dummy data as fallback');
        }

        console.log(`📦 Source data: ${sourceData.length} users`);
        if (sourceData.length > 0) {
          console.log(`📝 First user sample:`, {
            name: sourceData[0].name,
            email: sourceData[0].email,
            category: sourceData[0].category,
            status: sourceData[0].status,
            chatsCount: sourceData[0].chats?.length || 0
          });
        }

        // Filter users based on category and status
        const filteredUsers = sourceData.filter((user: any) => {
          // Check if user has chats that match the categorization criteria
          if (!user.chats || user.chats.length === 0) {
            console.log(`⏭️  Skipping user ${user.email} - no chats`);
            return false;
          }
          
          const hasMatchingChats = user.chats.some((chat: any) => {
            const matches = matchesCategorization(user, chat, categorization);
            if (!matches) {
              console.log(`❌ User ${user.email} chat ${chat.chat_id} doesn't match:`, {
                userCategory: user.category,
                userStatus: user.status,
                requiredCategory: categorization.category,
                requiredStatus: categorization.status
              });
            }
            return matches;
          });

          if (hasMatchingChats) {
            console.log(`✅ User ${user.email} matches criteria`);
          }

          return hasMatchingChats;
        });

        console.log(`✅ Filtered ${filteredUsers.length} users matching criteria`);

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
                      ? (chat.messages[chat.messages.length - 1].text || 
                         chat.messages[chat.messages.length - 1].content || 
                         "No messages")
                      : "No messages",
                    timestamp: chat.last_activity || chat.created_at || new Date().toISOString(),
                    unreadCount: chat.messages?.filter((m: any) => !m.read).length || 0,
                    avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                    status: chat.status === "active" ? "online" : "offline",
                    section: section,
                  },
                  messages: (chat.messages || []).map((msg: any, index: number) => ({
                    id: msg._id || msg.id || `msg-${index}`,
                    content: msg.text || msg.content || "",
                    sender: msg.role === "assistant" || msg.role === "agent" ? "Agent" : user.name || "User",
                    timestamp: msg.timestamp || new Date().toISOString(),
                    isRead: msg.read !== undefined ? msg.read : true,
                    avatar: msg.role === "assistant" || msg.role === "agent" ? "A" : user.name?.charAt(0).toUpperCase() || "U",
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
                    location: user.location || { 
                      city: "Unknown", 
                      region: "Unknown", 
                      country: "Unknown", 
                      timezone: "Unknown" 
                    },
                    device: user.device || { 
                      type: user.device?.type || user.device?.platform || "Unknown", 
                      os: user.device?.os || user.device?.platform || "Unknown", 
                      browser: user.device?.browser || user.device?.userAgent || "Unknown" 
                    },
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
        } else {
          setSelectedChat(null);
        }

        console.log(`🎉 Loaded ${transformedChats.length} chat instance(s)`);
      } catch (err) {
        console.error('❌ Error loading chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chats');
        setChats([]);
        setSelectedChat(null);
      } finally {
        setLoading(false);
        console.log('✅ Loading complete');
      }
    };

    loadChats();

    // Set up polling for real-time updates (every 10 seconds)
    const pollingInterval = setInterval(() => {
      console.log('🔄 Polling for new chat updates...');
      loadChats();
    }, 10000); // 10 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(pollingInterval);
    };
  }, [inboxType, userEmail, section]);

  // Debug: Log when loading state changes
  useEffect(() => {
    console.log(`🔄 Loading state changed: ${loading}, Error: ${error}, Chats: ${chats.length}`);
  }, [loading, error, chats.length]);

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