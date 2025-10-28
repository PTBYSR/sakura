"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  InputAdornment,
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
} from "@mui/material";
import {
  MoreVert,
  Send,
  AttachFile,
  Tag,
  Bolt,
  KeyboardArrowDown,
  Add,
  Search,
  Email,
  LocationOn,
  Computer,
  Language,
} from "@mui/icons-material";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatarIcon: string;
  avatarType: "whatsapp" | "instagram" | "email" | "facebook";
  status: "online" | "offline";
}

interface ContactInfo {
  email: string;
  ipAddress: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  device: {
    type: string;
    os: string;
    browser: string;
  };
  chatDuration: string;
  totalMessages: number;
  referrer: string;
  timezone: string;
}

interface ChatInstance {
  chat: Chat;
  messages: Message[];
  contactInfo: ContactInfo;
}

// Dummy chat data with 9 instances
const dummyChats: ChatInstance[] = [
  {
    chat: {
      id: "1",
      name: "Sarah Johnson",
      lastMessage: "Thanks for your help!",
      timestamp: "2m ago",
      unreadCount: 1,
      avatarIcon: "/images/integration-logo/whatsapp.png",
      avatarType: "whatsapp",
      status: "online",
    },
    messages: [
      { id: "1", content: "Hello, I need help with my order", sender: "Sarah Johnson", timestamp: "10:15 AM", isRead: true },
      { id: "2", content: "Hello! I'd be happy to help you with your order.", sender: "Agent", timestamp: "10:16 AM", isRead: true },
      { id: "3", content: "Thanks for your help!", sender: "Sarah Johnson", timestamp: "10:20 AM", isRead: true },
    ],
    contactInfo: {
      email: "sarah.johnson@example.com",
      ipAddress: "192.168.1.45",
      location: { city: "New York", region: "New York", country: "USA" },
      device: { type: "Desktop", os: "Windows 11", browser: "Chrome 120" },
      chatDuration: "5m 10s",
      totalMessages: 3,
      referrer: "https://google.com/search",
      timezone: "America/New_York",
    },
  },
  {
    chat: {
      id: "2",
      name: "Michael Chen",
      lastMessage: "Can you send me more details?",
      timestamp: "5m ago",
      unreadCount: 2,
      avatarIcon: "/images/integration-logo/instagram.png",
      avatarType: "instagram",
      status: "online",
    },
    messages: [
      { id: "1", content: "Hi, I'm interested in your products", sender: "Michael Chen", timestamp: "10:10 AM", isRead: true },
      { id: "2", content: "Great! Which products are you interested in?", sender: "Agent", timestamp: "10:11 AM", isRead: true },
      { id: "3", content: "Can you send me more details?", sender: "Michael Chen", timestamp: "10:12 AM", isRead: true },
    ],
    contactInfo: {
      email: "michael.chen@example.com",
      ipAddress: "10.0.0.123",
      location: { city: "Los Angeles", region: "California", country: "USA" },
      device: { type: "Mobile", os: "iOS 17.2", browser: "Safari" },
      chatDuration: "2m 45s",
      totalMessages: 3,
      referrer: "https://instagram.com",
      timezone: "America/Los_Angeles",
    },
  },
  {
    chat: {
      id: "3",
      name: "Emma Rodriguez",
      lastMessage: "That sounds perfect!",
      timestamp: "8m ago",
      unreadCount: 0,
      avatarIcon: "/images/integration-logo/whatsapp.png",
      avatarType: "whatsapp",
      status: "offline",
    },
    messages: [
      { id: "1", content: "I'd like to schedule a demo", sender: "Emma Rodriguez", timestamp: "10:00 AM", isRead: true },
      { id: "2", content: "I can schedule you for tomorrow at 2 PM. Does that work?", sender: "Agent", timestamp: "10:05 AM", isRead: true },
      { id: "3", content: "That sounds perfect!", sender: "Emma Rodriguez", timestamp: "10:06 AM", isRead: true },
    ],
    contactInfo: {
      email: "emma.rodriguez@example.com",
      ipAddress: "172.16.0.89",
      location: { city: "Miami", region: "Florida", country: "USA" },
      device: { type: "Desktop", os: "macOS Sonoma", browser: "Firefox 121" },
      chatDuration: "6m 10s",
      totalMessages: 3,
      referrer: "https://linkedin.com",
      timezone: "America/New_York",
    },
  },
  {
    chat: {
      id: "4",
      name: "David Park",
      lastMessage: "What are your business hours?",
      timestamp: "12m ago",
      unreadCount: 1,
      avatarIcon: "/images/integration-logo/facebook.png",
      avatarType: "facebook",
      status: "online",
    },
    messages: [
      { id: "1", content: "Hi there!", sender: "David Park", timestamp: "09:50 AM", isRead: true },
      { id: "2", content: "Hello! How can I assist you today?", sender: "Agent", timestamp: "09:51 AM", isRead: true },
      { id: "3", content: "What are your business hours?", sender: "David Park", timestamp: "09:52 AM", isRead: true },
    ],
    contactInfo: {
      email: "david.park@example.com",
      ipAddress: "203.0.113.42",
      location: { city: "London", region: "England", country: "UK" },
      device: { type: "Mobile", os: "Android 14", browser: "Chrome Mobile" },
      chatDuration: "2m 15s",
      totalMessages: 3,
      referrer: "https://facebook.com",
      timezone: "Europe/London",
    },
  },
  {
    chat: {
      id: "5",
      name: "Lisa Anderson",
      lastMessage: "I'll check and get back to you.",
      timestamp: "15m ago",
      unreadCount: 0,
      avatarIcon: "/images/integration-logo/email.png",
      avatarType: "email",
      status: "online",
    },
    messages: [
      { id: "1", content: "I have a technical question", sender: "Lisa Anderson", timestamp: "09:40 AM", isRead: true },
      { id: "2", content: "I'll check and get back to you.", sender: "Agent", timestamp: "09:45 AM", isRead: true },
    ],
    contactInfo: {
      email: "lisa.anderson@example.com",
      ipAddress: "198.51.100.37",
      location: { city: "Toronto", region: "Ontario", country: "Canada" },
      device: { type: "Desktop", os: "Windows 10", browser: "Edge 120" },
      chatDuration: "5m 20s",
      totalMessages: 2,
      referrer: "Direct",
      timezone: "America/Toronto",
    },
  },
  {
    chat: {
      id: "6",
      name: "James Wilson",
      lastMessage: "Perfect! Looking forward to it.",
      timestamp: "20m ago",
      unreadCount: 1,
      avatarIcon: "/images/integration-logo/whatsapp.png",
      avatarType: "whatsapp",
      status: "offline",
    },
    messages: [
      { id: "1", content: "Can I get pricing information?", sender: "James Wilson", timestamp: "09:30 AM", isRead: true },
      { id: "2", content: "I'll send you a detailed pricing sheet shortly.", sender: "Agent", timestamp: "09:35 AM", isRead: true },
      { id: "3", content: "Perfect! Looking forward to it.", sender: "James Wilson", timestamp: "09:36 AM", isRead: true },
    ],
    contactInfo: {
      email: "james.wilson@example.com",
      ipAddress: "10.52.18.207",
      location: { city: "Sydney", region: "NSW", country: "Australia" },
      device: { type: "Mobile", os: "iOS 16.7", browser: "Safari" },
      chatDuration: "6m 35s",
      totalMessages: 3,
      referrer: "https://whatsapp.com",
      timezone: "Australia/Sydney",
    },
  },
  {
    chat: {
      id: "7",
      name: "Maria Garcia",
      lastMessage: "Thanks so much!",
      timestamp: "25m ago",
      unreadCount: 0,
      avatarIcon: "/images/integration-logo/instagram.png",
      avatarType: "instagram",
      status: "online",
    },
    messages: [
      { id: "1", content: "Your service looks amazing!", sender: "Maria Garcia", timestamp: "09:15 AM", isRead: true },
      { id: "2", content: "Thank you! Is there anything specific you'd like to know?", sender: "Agent", timestamp: "09:20 AM", isRead: true },
      { id: "3", content: "Thanks so much!", sender: "Maria Garcia", timestamp: "09:25 AM", isRead: true },
    ],
    contactInfo: {
      email: "maria.garcia@example.com",
      ipAddress: "185.220.101.15",
      location: { city: "Barcelona", region: "Catalonia", country: "Spain" },
      device: { type: "Mobile", os: "Android 13", browser: "Chrome Mobile" },
      chatDuration: "10m 5s",
      totalMessages: 3,
      referrer: "https://instagram.com",
      timezone: "Europe/Madrid",
    },
  },
  {
    chat: {
      id: "8",
      name: "Robert Lee",
      lastMessage: "That works for me.",
      timestamp: "30m ago",
      unreadCount: 2,
      avatarIcon: "/images/integration-logo/email.png",
      avatarType: "email",
      status: "online",
    },
    messages: [
      { id: "1", content: "I need to update my account information", sender: "Robert Lee", timestamp: "09:00 AM", isRead: true },
      { id: "2", content: "I can help with that. Can we schedule a time?", sender: "Agent", timestamp: "09:10 AM", isRead: true },
      { id: "3", content: "That works for me.", sender: "Robert Lee", timestamp: "09:15 AM", isRead: true },
    ],
    contactInfo: {
      email: "robert.lee@example.com",
      ipAddress: "203.161.58.230",
      location: { city: "Tokyo", region: "Tokyo", country: "Japan" },
      device: { type: "Desktop", os: "macOS Ventura", browser: "Safari 17" },
      chatDuration: "15m 30s",
      totalMessages: 3,
      referrer: "Email Campaign",
      timezone: "Asia/Tokyo",
    },
  },
  {
    chat: {
      id: "9",
      name: "Jennifer Brown",
      lastMessage: "I'm very interested in learning more.",
      timestamp: "35m ago",
      unreadCount: 0,
      avatarIcon: "/images/integration-logo/facebook.png",
      avatarType: "facebook",
      status: "offline",
    },
    messages: [
      { id: "1", content: "Hello, I saw your website", sender: "Jennifer Brown", timestamp: "08:50 AM", isRead: true },
      { id: "2", content: "Welcome! How can I help you today?", sender: "Agent", timestamp: "08:55 AM", isRead: true },
      { id: "3", content: "I'm very interested in learning more.", sender: "Jennifer Brown", timestamp: "09:00 AM", isRead: true },
    ],
    contactInfo: {
      email: "jennifer.brown@example.com",
      ipAddress: "172.217.22.46",
      location: { city: "Berlin", region: "Berlin", country: "Germany" },
      device: { type: "Desktop", os: "Windows 11", browser: "Chrome 120" },
      chatDuration: "10m 15s",
      totalMessages: 3,
      referrer: "https://facebook.com",
      timezone: "Europe/Berlin",
    },
  },
];

const MyInboxPage = () => {
  const [chats, setChats] = useState<ChatInstance[]>(dummyChats);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(chats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [simulationTimer, setSimulationTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentSimulationIndex, setCurrentSimulationIndex] = useState(0);
  const [isSimulationPaused, setIsSimulationPaused] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Conversations for all 9 chat instances
  const conversations: Record<string, string[]> = {
    "1": ["Hi! I'm looking for help with my recent purchase.", "Hello Sarah! I'd be happy to help you with your purchase. What seems to be the issue?", "I received my order yesterday but one item is missing.", "I'm sorry to hear that. Could you please provide your order number so I can look into this immediately?", "Sure! My order number is ORD-12345.", "Thank you! I've located your order and I can see that item wasn't included in the shipment. I'll process a replacement for you right away. Is the shipping address the same as your original order?", "Yes, please ship it to the same address. How long will it take?", "Perfect! The replacement item will be shipped within 24 hours and you should receive it in 3-5 business days. You'll receive a tracking email once it ships. Is there anything else I can help you with today?", "No, that's all. Thank you so much for the quick resolution!", "You're very welcome, Sarah! I'm glad I could help. If you need anything else, don't hesitate to reach out. Have a great day!"],
    "2": ["Hey, I'm looking at your product catalog.", "Hi Michael! I'd be happy to help you find what you're looking for. What type of products are you interested in?", "I'm specifically interested in the premium packages.", "Great! We have several premium packages available. What's your main use case?", "I need something for my startup with about 20 employees.", "Perfect! Our Business Pro plan would be ideal for you. It includes all the premium features plus dedicated support. Would you like to schedule a demo to see it in action?", "Yes, that would be great! When can we do that?", "I have availability tomorrow at 2 PM or Friday at 10 AM. Which works better for you?", "Friday at 10 AM sounds perfect.", "Excellent! I'll send you a calendar invite with the meeting details. Looking forward to showing you the platform!"],
    "3": ["Hello! I heard great things about your service.", "Hi Emma! Thank you for reaching out. What would you like to know about our services?", "I'm interested in the enterprise solutions.", "Great to hear! Our enterprise solutions are designed for larger organizations. What size is your company?", "We're about 150 employees.", "Perfect! Our Enterprise Plus package would be a great fit. It includes advanced security, custom integrations, and 24/7 priority support. Would you like to see a detailed breakdown?", "Yes, please! Can you send me a proposal?", "Absolutely! I'll have a customized proposal sent to your email within the hour. Is there anything specific you'd like me to include?", "Just the pricing and implementation timeline would be great.", "Perfect! I'll include those details in the proposal. You should receive it shortly!"],
    "4": ["Good morning! I have a few questions about your services.", "Good morning David! I'm here to help. What questions do you have?", "What are your business hours for support?", "We offer 24/7 support for all our customers! You can reach us anytime via chat, email, or phone.", "That's great! What about response times?", "For premium customers, our average response time is under 5 minutes during business hours. For urgent issues, we guarantee response within 15 minutes.", "Perfect! And do you offer training sessions?", "Yes! We provide comprehensive onboarding, training sessions for your team, and ongoing support. It's all included in our packages.", "That sounds excellent. I'll discuss with my team and get back to you.", "Sounds great! Feel free to reach out anytime if you have more questions. I'm here to help!"],
    "5": ["Hi there, I have a technical question about integration.", "Hello Lisa! I'd be happy to help with your integration questions. What specifically are you looking to integrate?", "We need to integrate with our existing CRM system.", "We support integrations with most major CRM systems including Salesforce, HubSpot, and many others. Which CRM are you currently using?", "We use Salesforce.", "Perfect! We have a native Salesforce integration that should work seamlessly. Our integration typically takes about 30 minutes to set up. Would you like me to walk you through it?", "That would be helpful! Can we schedule that for this week?", "Absolutely! I have availability tomorrow afternoon or Thursday morning. What works better for your schedule?", "Thursday morning would be perfect.", "Great! I'll send you a meeting link and we can walk through the integration step by step. See you Thursday!"],
    "6": ["Hello, I'm interested in learning about your pricing options.", "Hi James! I'd be happy to discuss our pricing options. What's your company size and main use case?", "We're a team of about 50 people, focused on customer support.", "Perfect! Based on your team size, I'd recommend our Business plan which includes advanced support features and can accommodate up to 75 users. The pricing starts at $299/month.", "That sounds reasonable. What's included in that plan?", "You get unlimited messaging, advanced analytics, team collaboration tools, AI-powered insights, and priority support. We also offer a 14-day free trial with no credit card required.", "Great! Can I start the trial today?", "Absolutely! I can set that up for you right now. I'll just need your email address to create the account.", "Perfect, my email is james.wilson@example.com", "Excellent! I've sent you an email with your account details and login instructions. You should receive it within a minute. Welcome aboard!"],
    "7": ["Hi! I saw your service and I'm very intrigued!", "Hello Maria! I'm so glad you're interested in our service. What caught your attention?", "The AI features look really impressive.", "Thank you! Our AI capabilities are a game-changer. They can automate responses, provide intelligent insights, and learn from your customer interactions to improve over time.", "That sounds amazing! Do you have any case studies I could review?", "Absolutely! I can send you several case studies showing ROI improvements. Some of our clients have seen a 40% increase in efficiency and 60% reduction in response times. Would you like me to send those over?", "Yes please! I'd love to share them with my team.", "Perfect! I'll email you the case studies along with a product demo video. You should receive everything within the next hour.", "Thank you so much! I'll review them and get back to you.", "You're very welcome, Maria! I'm here whenever you're ready to discuss further or have any questions."],
    "8": ["Hi, I need help updating my account information.", "Hello Robert! I can definitely help you update your account information. What changes do you need to make?", "I need to update my email address and add a new team member.", "No problem! For the email update, I'll need to verify your identity first for security purposes. Can you confirm your current email?", "My current email is robert.lee@example.com", "Perfect! I've sent a verification code to that email. Once you confirm it, we can update your email and add the new team member.", "Great, I just received the code. It's 482967.", "Excellent! Email updated successfully. Now for the new team member - I'll need their name and email address to send them an invitation.", "The new member is John Smith, email is john.smith@example.com", "Perfect! I've sent an invitation to john.smith@example.com. They should receive it shortly and can join the team. Is there anything else you need help with today?"],
    "9": ["Hello! I found your website and wanted to learn more.", "Hi Jennifer! Welcome! I'm excited to tell you more about what we offer. What sparked your interest?", "I'm looking for a solution to improve our customer communication.", "That's exactly what we specialize in! Our platform helps businesses streamline customer communication across multiple channels - email, chat, social media, and more - all in one place.", "That sounds like what we need! How long does implementation typically take?", "Great question! Most teams are up and running within 24-48 hours. We provide full onboarding support and training. For more complex setups, it typically takes about a week.", "What kind of training do you provide?", "We offer comprehensive training including live sessions with our experts, video tutorials, documentation, and ongoing support. Your whole team will feel confident using the platform quickly.", "That's perfect! I'd like to discuss this with my team. Can you send me some more information?", "Absolutely! I'll send you a detailed information package including features, pricing, and implementation details. You should receive it within the hour. Feel free to reach out with any questions!"]
  };

  const startSimulation = () => {
    if (!selectedChat?.chat.id) return;
    const chatId = selectedChat.chat.id;
    const simulationMessages = conversations[chatId];
    if (!simulationMessages) return;
    setIsSimulationPaused(false);

    const sendNextMessage = (index: number) => {
      if (index >= simulationMessages.length) {
        setIsSimulationPaused(true);
        return;
      }

      const isAgentMessage = index % 2 === 1;
      const message: Message = {
        id: Date.now().toString() + index,
        content: simulationMessages[index],
        sender: isAgentMessage ? "Agent" : selectedChat.chat.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
      };

      setIsAITyping(!isAgentMessage);

      const typingTimer = setTimeout(() => {
        setIsAITyping(false);

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  chat: { ...chat.chat, lastMessage: message.content, timestamp: "now" },
                }
              : chat
          )
        );

        setSelectedChat((prev) => {
          if (!prev || prev.chat.id !== chatId) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message],
            chat: { ...prev.chat, lastMessage: message.content, timestamp: "now" },
          };
        });

        setCurrentSimulationIndex(index + 1);

        const nextTimer = setTimeout(() => {
          sendNextMessage(index + 1);
        }, 2000);
        simulationTimerRef.current = nextTimer;
      }, 1500);
      typingTimerRef.current = typingTimer;
    };

    sendNextMessage(currentSimulationIndex);
  };

  const stopSimulation = () => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (simulationTimer) {
      clearTimeout(simulationTimer);
      setSimulationTimer(null);
    }
    setIsSimulationPaused(true);
    setIsAITyping(false);
  };

  useEffect(() => {
    return () => {
      if (simulationTimer) {
        clearTimeout(simulationTimer);
      }
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [simulationTimer]);

  useEffect(() => {
    if (selectedChat?.chat.id && isSimulationPaused && currentSimulationIndex === 0 && selectedChat.messages.length <= 3) {
      const timer = setTimeout(() => {
        startSimulation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages, isAITyping]);

  const handleSendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "Agent",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.chat.id === selectedChat.chat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              chat: { ...chat.chat, lastMessage: newMessage, timestamp: "now" },
            }
          : chat
      )
    );

    setSelectedChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, message],
            chat: { ...prev.chat, lastMessage: newMessage, timestamp: "now" },
          }
        : null
    );

    setNewMessage("");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#1a1a1a", width: "100%" }}>
      {/* Top Global Navigation Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: "#2a2a2a",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            placeholder="Search"
            size="small"
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1a1a1a",
                color: "white",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#555" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputBase-input::placeholder": { color: "#ccc" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#ccc" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip label="ctrl K" size="small" sx={{ backgroundColor: "#333", color: "#ccc", fontSize: "0.7rem" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.2rem" }}>
            páse
          </Typography>
          <Badge badgeContent={2} color="error">
            <IconButton sx={{ color: "white" }}>
              <Add />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", height: "100vh", pt: 7.5, width: "100%" }}>
        {/* Left Sidebar - Chat List */}
        <Box sx={{ width: 350, backgroundColor: "#2a2a2a", borderRight: "1px solid #333", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #333" }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
              All chats
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>My chats {chats.length}</Typography>
              <Button endIcon={<KeyboardArrowDown />} sx={{ color: "#ccc", textTransform: "none", fontSize: "0.9rem" }}>
                Oldest
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            {chats.map((chat) => (
              <ListItemButton
                key={chat.chat.id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  backgroundColor: selectedChat?.chat.id === chat.chat.id ? "#3a3a3a" : "transparent",
                  borderRadius: 0,
                  px: 3,
                  py: 2,
                  "&:hover": { backgroundColor: "#3a3a3a" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 50 }}>
                  <Badge badgeContent={chat.chat.unreadCount} color="error" invisible={chat.chat.unreadCount === 0}>
                    <Box sx={{ position: "relative", width: 40, height: 40 }}>
                      <Image
                        src={chat.chat.avatarIcon}
                        alt={chat.chat.avatarType}
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%" }}
                      />
                    </Box>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ color: "white", fontSize: "0.95rem", fontWeight: "bold" }}>{chat.chat.name}</Typography>}
                  secondary={
                    <Box>
                      <Typography sx={{ color: "#ccc", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.chat.lastMessage}
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.75rem" }}>{chat.chat.timestamp}</Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </Box>
        </Box>

        {/* Center Panel - Chat Messages */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#1a1a1a" }}>
          {selectedChat ? (
            <>
              <Box sx={{ p: 3, borderBottom: "1px solid #333", backgroundColor: "#2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {selectedChat.chat.name}
                </Typography>
                {!isSimulationPaused && (
                  <Button
                    variant="contained"
                    onClick={stopSimulation}
                    sx={{
                      backgroundColor: "#f44336",
                      color: "white",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#da190b" },
                    }}
                  >
                    ⏹ Stop Agent
                  </Button>
                )}
              </Box>

              <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                {selectedChat.messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: message.sender === "Agent" ? "flex-end" : "flex-start",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ maxWidth: "70%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                        <Typography sx={{ color: "#ccc", fontSize: "0.8rem" }}>
                          {message.sender} {message.timestamp}
                        </Typography>
                      </Box>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: message.sender === "Agent" ? "#1976d2" : "#2a2a2a",
                          color: "white",
                          borderRadius: 2,
                          border: "1px solid #333",
                        }}
                      >
                        <Typography sx={{ fontSize: "0.9rem" }}>{message.content}</Typography>
                      </Paper>
                      <Typography sx={{ fontSize: "0.7rem", color: "#888", mt: 0.5 }}>
                        {message.sender === "Agent" ? "Read • Now" : "Now"}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {isAITyping && (
                  <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
                    <Box sx={{ maxWidth: "70%" }}>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: "#2a2a2a",
                          color: "white",
                          borderRadius: 2,
                          border: "1px solid #333",
                        }}
                      >
                        <Typography sx={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                          {selectedChat?.chat.name} is typing...
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ p: 3, borderTop: "1px solid #333", backgroundColor: "#2a2a2a" }}>
                <TextField
                  fullWidth
                  placeholder="Enter message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#1a1a1a",
                      color: "white",
                      "& fieldset": { borderColor: "#333" },
                      "&:hover fieldset": { borderColor: "#555" },
                      "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                    },
                    "& .MuiInputBase-input": { color: "white" },
                    "& .MuiInputBase-input::placeholder": { color: "#ccc" },
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button endIcon={<KeyboardArrowDown />} sx={{ color: "#ccc", textTransform: "none", fontSize: "0.9rem" }}>
                      Message
                    </Button>
                    <IconButton sx={{ color: "#ccc" }}>
                      <Bolt />
                    </IconButton>
                    <IconButton sx={{ color: "#ccc" }}>
                      <Tag />
                    </IconButton>
                    <IconButton sx={{ color: "#ccc" }}>
                      <AttachFile />
                    </IconButton>
                  </Box>
                  <Button
                    onClick={handleSendMessage}
                    sx={{
                      backgroundColor: "#333",
                      color: "white",
                      px: 3,
                      "&:hover": { backgroundColor: "#444" },
                    }}
                    endIcon={<Send />}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Typography sx={{ color: "#ccc" }}>Select a chat to start messaging</Typography>
            </Box>
          )}
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ width: 350, backgroundColor: "#2a2a2a", borderLeft: "1px solid #333", p: 3, overflow: "auto" }}>
          {selectedChat && selectedChat.contactInfo ? (
            <>
              {/* Top Icons */}
              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <IconButton sx={{ color: "#ccc" }}>
                  <MoreVert />
                </IconButton>
              </Box>

              {/* Contact Profile */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ position: "relative", width: 48, height: 48 }}>
                  <Image
                    src={selectedChat.chat.avatarIcon}
                    alt={selectedChat.chat.avatarType}
                    width={48}
                    height={48}
                    style={{ borderRadius: "50%" }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>
                    {selectedChat.chat.name}
                  </Typography>
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {selectedChat.chat.status === "online" ? "Online" : "Offline"}
                  </Typography>
                </Box>
              </Box>

              {/* Contact Details */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Email sx={{ color: "#ccc", fontSize: "1rem" }} />
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {selectedChat.contactInfo.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LocationOn sx={{ color: "#ccc", fontSize: "1rem" }} />
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {selectedChat.contactInfo.location.city}, {selectedChat.contactInfo.location.country}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Computer sx={{ color: "#ccc", fontSize: "1rem" }} />
                  <Typography sx={{ color: "#ccc", fontSize: "0.9rem" }}>
                    {selectedChat.contactInfo.ipAddress}
                  </Typography>
                </Box>
              </Box>

              {/* Stats Section */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: "#1a1a1a", borderRadius: 2 }}>
                <Typography sx={{ color: "white", fontWeight: "bold", mb: 2, fontSize: "0.9rem" }}>
                  Chat Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>Chat ID</Typography>
                    <Typography sx={{ color: "white", fontSize: "0.85rem" }}>{selectedChat.chat.id}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>Duration</Typography>
                    <Typography sx={{ color: "white", fontSize: "0.85rem" }}>{selectedChat.contactInfo.chatDuration}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>Messages</Typography>
                    <Typography sx={{ color: "white", fontSize: "0.85rem" }}>{selectedChat.contactInfo.totalMessages}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>Timezone</Typography>
                    <Typography sx={{ color: "white", fontSize: "0.85rem" }}>{selectedChat.contactInfo.timezone}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Device Info */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: "#1a1a1a", borderRadius: 2 }}>
                <Typography sx={{ color: "white", fontWeight: "bold", mb: 2, fontSize: "0.9rem" }}>
                  Device Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>Type: {selectedChat.contactInfo.device.type}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>OS: {selectedChat.contactInfo.device.os}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#ccc", fontSize: "0.85rem" }}>Browser: {selectedChat.contactInfo.device.browser}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Referrer */}
              <Box sx={{ p: 2, backgroundColor: "#1a1a1a", borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Language sx={{ color: "#ccc", fontSize: "1rem" }} />
                  <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "0.9rem" }}>
                    Referrer
                  </Typography>
                </Box>
                <Typography sx={{ color: "#ccc", fontSize: "0.85rem", wordBreak: "break-all" }}>
                  {selectedChat.contactInfo.referrer}
                </Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography sx={{ color: "#ccc" }}>Select a chat to view contact information</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MyInboxPage;