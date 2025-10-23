import { useState, useEffect } from 'react';
import { dummyData } from '../data/dummyData';

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

export const useUnifiedChatData = ({ inboxType, userEmail, section }: UseUnifiedChatDataProps) => {
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChats = () => {
      try {
        setLoading(true);
        setError(null);

        // Filter data based on inboxType and section
        let filteredData = dummyData;

        if (inboxType === "human") {
          filteredData = dummyData.filter(chat => chat.inboxType === "my-inbox");
          
          if (section) {
            switch (section) {
              case "my-inbox-chats":
                filteredData = filteredData.filter(chat => chat.chatCategory === "my-chats");
                break;
              case "my-inbox-escalated":
                filteredData = filteredData.filter(chat => chat.chatCategory === "escalated");
                break;
              case "my-inbox-resolved":
                filteredData = filteredData.filter(chat => chat.chatCategory === "resolved");
                break;
            }
          }
        } else if (inboxType === "agent") {
          filteredData = dummyData.filter(chat => chat.inboxType === "agent-inbox");
          
          if (section) {
            switch (section) {
              case "agent-inbox-active":
                filteredData = filteredData.filter(chat => chat.chatCategory === "active");
                break;
              case "agent-inbox-resolved":
                filteredData = filteredData.filter(chat => chat.chatCategory === "resolved");
                break;
            }
          }
        }

        // Transform the data to match the expected ChatInstance format
        const transformedChats: ChatInstance[] = filteredData.map(chat => ({
          chat: {
            id: chat.id,
            name: chat.name,
            lastMessage: chat.lastMessage,
            timestamp: chat.timestamp,
            unreadCount: chat.unreadCount,
            avatar: chat.avatar,
            status: chat.status === "active" ? "online" : "offline",
            section: chat.section,
          },
          messages: chat.chat.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            isRead: true,
            avatar: msg.sender === chat.name ? chat.avatar : "A", // Agent avatar
          })),
          contactInfo: {
            name: chat.name,
            email: chat.email,
            location: `${chat.location.city}, ${chat.location.country}`,
            avatar: chat.avatar,
            status: chat.status === "active" ? "Online" : "Offline",
            chatId: chat.id,
            chatDuration: chat.chat.duration,
            totalMessages: chat.chat.totalMessages,
            archivedCount: 0,
            visitedPagesCount: 0,
            tags: chat.chat.tags,
            visitedPages: [
              { url: chat.referrer, title: "Landing Page", timestamp: "2m ago" },
              { url: "https://app.example.com/dashboard", title: "Dashboard", timestamp: "5m ago" }
            ],
          },
          backendUserData: {
            name: chat.name,
            email: chat.email,
            ip: "192.168.1.1", // Mock IP
            location: chat.location,
            device: chat.device,
            referrer: chat.referrer,
            utm: chat.utm,
          },
        }));

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
