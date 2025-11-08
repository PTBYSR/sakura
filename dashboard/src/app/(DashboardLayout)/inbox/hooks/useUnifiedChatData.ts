import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

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
  role?: string; // 'user', 'agent', or 'assistant'
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
  userId?: string | null;
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
  // Default to "agent-inbox" if category is not set (to match backend default)
  const userCategory = user.category || "agent-inbox";
  const categoryMatch = !categorization.category || userCategory === categorization.category;
  
  // Status: Use USER status for chat status (user.status determines the chat's status)
  // Default to "active" if status is not set (to match backend default)
  const userStatus = user.status || "active";
  let statusMatch = true;
  if (categorization.status) {
    statusMatch = userStatus.toLowerCase() === categorization.status.toLowerCase();
  }
  
  
  // Both category and status must match
  return categoryMatch && statusMatch;
};

export const useUnifiedChatData = ({ inboxType, userEmail, userId, section }: UseUnifiedChatDataProps) => {
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, isConnected } = useWebSocket();

  // Fetch real data from backend (same endpoint as bank page)
  const fetchBackendData = async () => {
    try {
      // Add timeout to prevent infinite loading (increased to 30 seconds to account for MongoDB connection delays)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/debug/users-chats`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Backend error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          // If not JSON, use the text as-is
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      const users = data.users || [];
      return users;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timed out after 30 seconds');
        console.error('   The backend may be slow or unresponsive. Please check:', API_BASE_URL);
        console.error('   Possible causes:');
        console.error('   1. MongoDB is not running');
        console.error('   2. Backend server is hanging on database queries');
        console.error('   3. Network connectivity issues');
        // Return a special marker for timeout
        return { __error: 'Request timed out after 30 seconds. Please ensure MongoDB is running and the backend server is responsive.' };
      } else {
        console.error('❌ Failed to fetch backend data:', error);
        console.error('   Error message:', error.message);
        console.error('   Please check backend connection and endpoint:', `${API_BASE_URL}/api/debug/users-chats`);
        // Return error info
        return { __error: error.message || 'Failed to connect to backend. Please ensure the backend server is running and MongoDB is connected.' };
      }
    }
  };

  const loadChats = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        if (!section) {
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }

        // Get categorization criteria for this section
        const categorization = CHAT_CATEGORIZATION[section as keyof typeof CHAT_CATEGORIZATION] || {};

        // Try to fetch real backend data first
        const backendUsers = await fetchBackendData();
        
        // Check if fetchBackendData returned an error object
        if (backendUsers && typeof backendUsers === 'object' && '__error' in backendUsers) {
          setError(backendUsers.__error);
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }
        
        // Check for null or invalid response
        if (!backendUsers || !Array.isArray(backendUsers)) {
          setError('Failed to load chats from backend. Please check backend connection.');
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }
        
        // Empty array is OK - just means no users/chats exist yet
        if (backendUsers.length === 0) {
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }

        const sourceData = backendUsers;
        
        // Filter by dashboard_user_id (widget owner) if userId provided, otherwise fallback to email
        let ownerFilteredUsers = sourceData;
        if (userEmail && userEmail !== "admin@heirs.com" && userEmail !== "agent@heirs.com") {
          if (userId) {
            // Primary filter: Match by dashboard_user_id (widget owner)
            ownerFilteredUsers = sourceData.filter((user: any) => {
              const userDashboardUserId = user.dashboard_user_id?.toString();
              const loggedInUserId = userId.toString();
              return userDashboardUserId === loggedInUserId;
            });
            
          } else {
            // No userId available, fallback to email filtering
            ownerFilteredUsers = sourceData.filter((user: any) => {
              const userEmailLower = user.email?.toLowerCase() || '';
              const loggedInEmailLower = userEmail.toLowerCase();
              return userEmailLower === loggedInEmailLower;
            });
          }
        }
        
        const filteredUsers = ownerFilteredUsers.filter((user: any) => {
          // Check if user has chats that match the categorization criteria
          if (!user.chats || user.chats.length === 0) {
            return false;
          }
          
          const hasMatchingChats = user.chats.some((chat: any) => {
            return matchesCategorization(user, chat, categorization);
          });

          return hasMatchingChats;
        });

        // Transform the filtered data to ChatInstance format
        // Use a Map to deduplicate chats by chat ID (same chat can be linked to multiple users)
        const chatMap = new Map<string, ChatInstance>();

        filteredUsers.forEach((user: any) => {
          if (user.chats && user.chats.length > 0) {
            user.chats.forEach((chat: any) => {
              // Only include chats that match the categorization criteria
              if (matchesCategorization(user, chat, categorization)) {
                const chatId = chat.chat_id || chat.id;
                
                // If this chat already exists, merge or update it
                // Prefer keeping the chat with more messages or the most recent user data
                const existingChat = chatMap.get(chatId);
                const chatMessagesCount = (chat.messages || []).length;
                const existingMessagesCount = existingChat?.messages?.length || 0;
                
                // Only replace if this chat has more messages, or if it doesn't exist yet
                if (!existingChat || chatMessagesCount > existingMessagesCount) {
                const chatInstance: ChatInstance = {
                  chat: {
                      id: chatId,
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

                chatMap.set(chatId, chatInstance);
                }
              }
            });
          }
        });

        // Convert Map to array (deduplicated chats)
        const transformedChats = Array.from(chatMap.values());

        setChats(transformedChats);
        
        // Set the first chat as selected by default
        if (transformedChats.length > 0) {
          setSelectedChat(transformedChats[0]);
        } else {
          setSelectedChat(null);
        }
      } catch (err) {
        console.error('❌ Error loading chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chats');
        setChats([]);
        setSelectedChat(null);
      } finally {
        setLoading(false);
      }
    }, [section, userId, userEmail, inboxType]);

    // Always load chats on mount/change, regardless of WebSocket status
    useEffect(() => {
      loadChats();
    }, [loadChats]);

    // Subscribe to WebSocket updates for real-time changes
    // This effect re-runs whenever isConnected changes, ensuring we subscribe when connection is established
    useEffect(() => {
      if (!isConnected) {
        console.log('⏳ WebSocket not connected, skipping subscription');
        return;
      }

      console.log('✅ WebSocket connected, subscribing to chat_updates...');
      const unsubscribe = subscribe('chat_updates', (data: any) => {
        console.log('📨 Received WebSocket update:', JSON.stringify(data, null, 2));
        
        // Handle lightweight notification - trigger refetch
        if (data?.type === 'chat_message_notification') {
          console.log('🔔 New message notification received, refetching chats...');
          console.log('📊 Notification details:', {
            chat_id: data.chat_id,
            message_role: data.message_role,
            timestamp: data.timestamp
          });
          loadChats();
          return;
        }
        
        if (data?.users) {
          // Process the WebSocket data similar to loadChats
          try {
            const categorization = CHAT_CATEGORIZATION[section as keyof typeof CHAT_CATEGORIZATION] || {};
            
            // Filter users based on dashboard_user_id (primary) or email (fallback), category and status
            const filteredUsers = data.users.filter((user: any) => {
              // Filter by dashboard_user_id first (if userId provided)
              if (userId && userEmail !== "admin@heirs.com" && userEmail !== "agent@heirs.com") {
                const userDashboardUserId = user.dashboard_user_id || '';
                if (userDashboardUserId !== userId && String(userDashboardUserId) !== String(userId)) {
                  // Fallback to email if dashboard_user_id doesn't match
                  if (user.email?.toLowerCase() !== userEmail.toLowerCase()) {
                    return false;
                  }
                }
              } else if (userEmail && userEmail !== "admin@heirs.com" && userEmail !== "agent@heirs.com") {
                // Fallback to email filtering if userId not provided
                if (user.email?.toLowerCase() !== userEmail.toLowerCase()) {
                  return false;
                }
              }
              
              if (!user.chats || user.chats.length === 0) {
                return false;
              }
              
              const hasMatchingChats = user.chats.some((chat: any) => {
                return matchesCategorization(user, chat, categorization);
              });

              return hasMatchingChats;
            });

            // Transform the filtered data to ChatInstance format
            // Use a Map to deduplicate chats by chat ID (same chat can be linked to multiple users)
            const chatMap = new Map<string, ChatInstance>();

            filteredUsers.forEach((user: any) => {
              if (user.chats && user.chats.length > 0) {
                user.chats.forEach((chat: any) => {
                  if (matchesCategorization(user, chat, categorization)) {
                    const chatId = chat.chat_id || chat.id;
                    
                    // If this chat already exists, merge or update it
                    // Prefer keeping the chat with more messages or the most recent user data
                    const existingChat = chatMap.get(chatId);
                    const chatMessagesCount = (chat.messages || []).length;
                    const existingMessagesCount = existingChat?.messages?.length || 0;
                    
                    // Only replace if this chat has more messages, or if it doesn't exist yet
                    if (!existingChat || chatMessagesCount > existingMessagesCount) {
                      const chatInstance: ChatInstance = {
                        chat: {
                          id: chatId,
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
                        sender: msg.role === "assistant" 
                          ? "AI Agent" 
                          : msg.role === "agent" 
                          ? "Agent" 
                          : user.name || "User",
                        timestamp: msg.timestamp || new Date().toISOString(),
                        isRead: msg.read !== undefined ? msg.read : true,
                        avatar: msg.role === "assistant" || msg.role === "agent" ? "A" : user.name?.charAt(0).toUpperCase() || "U",
                        role: msg.role, // Preserve role for UI differentiation
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
                        chatDuration: "0m",
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

                    chatMap.set(chatId, chatInstance);
                    }
                  }
                });
              }
            });

            // Convert Map to array (deduplicated chats)
            const transformedChats = Array.from(chatMap.values());

            setChats(transformedChats);
            
            // Keep selected chat if it still exists
            if (selectedChat) {
              const stillExists = transformedChats.find(c => c.chat.id === selectedChat.chat.id);
              if (stillExists) {
                setSelectedChat(stillExists);
              } else if (transformedChats.length > 0) {
                setSelectedChat(transformedChats[0]);
              } else {
                setSelectedChat(null);
              }
            } else if (transformedChats.length > 0) {
              setSelectedChat(transformedChats[0]);
            }
          } catch (err) {
            console.error('Error processing WebSocket chat update:', err);
          }
        } else {
          console.log('⚠️ Received WebSocket update with unknown format:', data);
        }
      });

      return () => {
        console.log('🔌 Unsubscribing from chat_updates');
        unsubscribe();
      };
    }, [isConnected, subscribe, loadChats, section, userId, userEmail]);


  const sendMessage = async (message: string) => {
    if (!message || message.trim().length === 0) {
      return;
    }
    
    if (!selectedChat) {
      return;
    }

    const chatId = selectedChat.chat.id;
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8000"
        : "https://sakura-backend.onrender.com");

    // Optimistically update UI first
    // All messages sent from dashboard inbox are from human agents
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      sender: 'Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      avatar: 'A',
      role: 'agent', // Always 'agent' for dashboard messages to customers
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

    // Send message to backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/chats/${chatId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          role: 'agent', // Always 'agent' since this is from dashboard (human agent)
        }),
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to send message: ${response.status} - ${errorText}`);
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      // Optionally refresh the chat to get the latest messages from backend
      // This ensures we have the exact message structure from the database
      
    } catch (error: any) {
      console.error("❌ Error sending message to backend:", error);
      // The message is already in the UI, but we could show an error notification
      // or revert the optimistic update if desired
    }
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