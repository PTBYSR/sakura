"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'customer';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isLink?: boolean;
  linkUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  location: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  chatId: string;
  category: 'human-chats' | 'escalated' | 'resolved' | 'ai-active' | 'ai-resolved';
  chatDuration: string;
  visitedPages: number;
  totalMessages: number;
  tags: string[];
}

export interface ChatDetails {
  chatId: string;
  duration: string;
  tags: string[];
  visitedPages: number;
  totalMessages: number;
}

interface ChatContextType {
  customers: Customer[];
  selectedChat: Customer | null;
  setSelectedChat: (customer: Customer | null) => void;
  getCustomersByCategory: (category: string) => Customer[];
  getChatMessages: (chatId: string) => ChatMessage[];
  sendMessage: (chatId: string, content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Generate dummy data
const generateDummyCustomers = (): Customer[] => {
  const names = [
    'Paul Eme', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Brown',
    'Lisa Garcia', 'Tom Anderson', 'Anna Martinez', 'John Smith', 'Maria Rodriguez'
  ];
  
  const locations = [
    'The Netherlands', 'United States', 'Canada', 'United Kingdom', 'Germany',
    'France', 'Australia', 'Japan', 'Brazil', 'India'
  ];

  const categories: Customer['category'][] = [
    'human-chats', 'human-chats', 'escalated', 'escalated', 'resolved',
    'ai-active', 'ai-active', 'ai-active', 'ai-resolved', 'ai-resolved'
  ];

  const lastMessages = [
    'Hello', 'How can I help you?', 'I need assistance', 'Thank you for your help',
    'Can you check my order?', 'I have a question', 'Is this available?', 'Great service!',
    'Need more info', 'Perfect, thanks!'
  ];

  return names.map((name, index) => ({
    id: `customer-${index + 1}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    location: locations[index],
    avatar: name.charAt(0),
    status: index % 3 === 0 ? 'online' : index % 3 === 1 ? 'away' : 'offline',
    lastMessage: lastMessages[index],
    lastMessageTime: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
    unreadCount: Math.floor(Math.random() * 5),
    chatId: `T${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    category: categories[index],
    chatDuration: `${Math.floor(Math.random() * 60)}m ${Math.floor(Math.random() * 60)}s`,
    visitedPages: Math.floor(Math.random() * 10),
    totalMessages: Math.floor(Math.random() * 50) + 10,
    tags: index % 2 === 0 ? ['VIP', 'Premium'] : ['Standard'],
  }));
};

const generateDummyMessages = (): { [chatId: string]: ChatMessage[] } => {
  const messages: { [chatId: string]: ChatMessage[] } = {};
  
  // Generate messages for each customer
  for (let i = 1; i <= 10; i++) {
    const chatId = `T${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    messages[chatId] = [
      {
        id: '1',
        sender: 'customer',
        content: 'E-mail: customer@example.com',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        isLink: true,
        linkUrl: 'mailto:customer@example.com',
      },
      {
        id: '2',
        sender: 'user',
        content: 'Hello. How may I help you?',
        timestamp: new Date(Date.now() - 1800000),
        status: 'read',
      },
      {
        id: '3',
        sender: 'customer',
        content: 'Hello',
        timestamp: new Date(Date.now() - 900000),
        status: 'read',
      },
    ];
  }
  
  return messages;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [customers] = useState<Customer[]>(generateDummyCustomers());
  const [selectedChat, setSelectedChat] = useState<Customer | null>(null);
  const [messages] = useState<{ [chatId: string]: ChatMessage[] }>(generateDummyMessages());

  const getCustomersByCategory = (category: string): Customer[] => {
    return customers.filter(customer => customer.category === category);
  };

  const getChatMessages = (chatId: string): ChatMessage[] => {
    return messages[chatId] || [];
  };

  const sendMessage = (chatId: string, content: string) => {
    // In a real app, this would send to a backend
    console.log(`Sending message to ${chatId}: ${content}`);
  };

  return (
    <ChatContext.Provider value={{
      customers,
      selectedChat,
      setSelectedChat,
      getCustomersByCategory,
      getChatMessages,
      sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

