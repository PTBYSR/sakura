// lib/api.ts - API service for your Next.js frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions
export interface User {
  _id: string;
  name: string;
  email: string;
  created_at: string;
  last_seen: string;
}

export interface UserStats {
  email: string;
  name: string;
  total_chats: number;
  open_chats: number;
  closed_chats: number;
  total_messages: number;
  created_at: string;
  last_seen: string;
}

export interface Message {
  role: string;
  content: string;
  timestamp: string;
  msg_type?: string;
}

export interface Chat {
  chat_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  state?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  processing_time: number;
}

// API Service
export const apiService = {
  // Send a chat message
  async sendMessage(message: string, email: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        email,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  },

  // Save user data
  async saveUser(userData: any): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to save user: ${response.statusText}`);
    }

    return response.json();
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const data = await response.json();
    return data.user;
  },

  // Get all users
  async getAllUsers(skip: number = 0, limit: number = 100): Promise<{
    users: User[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/users?skip=${skip}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  },

  // Get user statistics
  async getUserStats(email: string): Promise<UserStats> {
    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(email)}/stats`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user stats: ${response.statusText}`);
    }

    return response.json();
  },

  // Get all chats for a user
  async getUserChats(email: string): Promise<Chat[]> {
    const response = await fetch(
      `${API_BASE_URL}/chats?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chats: ${response.statusText}`);
    }

    const data = await response.json();
    return data.chats;
  },

  // Get a specific chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch chat: ${response.statusText}`);
    }

    const data = await response.json();
    return data.chat;
  },
};

export default apiService;