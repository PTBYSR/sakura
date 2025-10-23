"use client";
import { useState, useEffect } from "react";
import { sectionedDummyChatInstances } from "../data/sectionedDummyChatInstances";

// Types
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  status: "online" | "offline" | "away";
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

interface UseChatDataProps {
  inboxType: "agent" | "human";
  userEmail?: string;
}

export const useChatData = ({ inboxType, userEmail }: UseChatDataProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const getRandomMessageTime = (offsetMinutes: number) => {
    const date = new Date(Date.now() - offsetMinutes * 60 * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getAvatarInitial = (name: string) => name.charAt(0).toUpperCase();

  // Initialize data with dummy instances
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Use dummy data instead of API calls
      const initialChats: Chat[] = sectionedDummyChatInstances.map(instance => instance.chat);
      setChats(initialChats);

      // Select the first chat by default if none is selected
      if (initialChats.length > 0 && !selectedChatId) {
        setSelectedChatId(initialChats[0].id);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load initial chat data.");
      setLoading(false);
    }
  }, [inboxType, userEmail, selectedChatId]);

  // Update messages and contact info when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      const selectedInstance = sectionedDummyChatInstances.find(
        (instance) => instance.chat.id === selectedChatId
      );

      if (selectedInstance) {
        setMessages(selectedInstance.messages);
        setContactInfo(selectedInstance.contactInfo);
      } else {
        setMessages([]);
        setContactInfo(null);
      }
    } else {
      setMessages([]);
      setContactInfo(null);
    }
  }, [selectedChatId]);

  // Send a message (simulated)
  const sendMessage = async (content: string) => {
    if (!selectedChatId) return;

    const newMessage: Message = {
      id: uuidv4(),
      content,
      sender: "You", // Assuming the agent is sending the message
      timestamp: getRandomMessageTime(0),
      isRead: true,
      avatar: getAvatarInitial("You"),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const responses = [
        "I understand your concern. Let me help you with that.",
        "That's a great question! Here's what I can tell you...",
        "I&apos;ll look into this for you right away.",
        "Thank you for bringing this to my attention.",
        "I can definitely help you with that. Let me check...",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMessage: Message = {
        id: uuidv4(),
        content: randomResponse,
        sender: "Assistant",
        timestamp: getRandomMessageTime(0),
        isRead: false,
        avatar: getAvatarInitial("Assistant"),
      };

      setMessages((prevMessages) => [...prevMessages, responseMessage]);
    }, 1000);

    console.log(`Sending message to chat ${selectedChatId}: ${content}`);
  };

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return {
    chats,
    messages,
    contactInfo,
    selectedChatId,
    loading,
    error,
    sendMessage,
    handleChatSelect,
    refreshChats: () => {
      // Refresh with dummy data
      const initialChats: Chat[] = sectionedDummyChatInstances.map(instance => instance.chat);
      setChats(initialChats);
    },
  };
};

