"use client";
import React, { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapse } from "@/components/ui/collapse";
import { IconButton } from "@/components/ui/icon-button";
import {
  MoreVertical,
  Link as LinkIcon,
  Send,
  Paperclip,
  Tag,
  MessageSquare,
  Archive,
  Globe2,
  ChevronDown,
  Plus,
} from "lucide-react";

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

interface ChatInterfaceProps {
  chats: Chat[];
  messages: Message[];
  contactInfo: ContactInfo;
  suggestedReplies?: string[];
  onSendMessage: (message: string) => void;
  onChatSelect: (chatId: string) => void;
  selectedChatId: string;
  inboxType: "agent" | "human";
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chats,
  messages,
  contactInfo,
  suggestedReplies = [],
  onSendMessage,
  onChatSelect,
  selectedChatId,
  inboxType,
}) => {
  const [message, setMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    chatInfo: true,
    chatTags: true,
    visitedPages: true,
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChatId);

  const getAvatarColor = (status: string) => {
    switch (status) {
      case "online":
        return "#4caf50";
      case "away":
        return "#ff9800";
      case "offline":
        return "#757575";
      default:
        return inboxType === "agent" ? "#ff6b35" : "#4caf50";
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col md:flex-row bg-[#1a1a1a] rounded-lg overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-full md:w-[300px] bg-[#2a2a2a] border-b md:border-b-0 md:border-r border-[#333] flex flex-col">
        {/* Chat List Header */}
        <div className="p-2 border-b border-[#333]">
          <div className="text-white font-bold">All chats</div>
          <div className="flex items-center justify-between mt-1 text-[#ccc] text-sm">
            <div>My chats {chats.length}</div>
            <div className="flex items-center">Oldest</div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full text-left p-2 border-b border-[#333] hover:bg-[#3a3a3a] ${selectedChatId === chat.id ? 'bg-[#3a3a3a]' : ''}`}
            >
              <div className="flex items-center">
                <Avatar size={40} className="mr-2" style={{ backgroundColor: getAvatarColor(chat.status), color: 'white' }} fallback={chat.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{chat.name}</div>
                  <div className="text-[#ccc] text-sm truncate">{chat.lastMessage}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[#ccc] text-xs">{chat.timestamp}</div>
                  {chat.unreadCount > 0 && (
                    <div className="mt-1"><Badge content={chat.unreadCount} /></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Central Panel - Chat Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-2 border-b border-[#333] flex items-center justify-between">
          <div className="text-white font-bold">{selectedChatData?.name}</div>
          <div className="flex items-center gap-2">
            <IconButton className="text-[#ccc]"><LinkIcon className="h-5 w-5" /></IconButton>
            <IconButton className="text-[#ccc]"><MoreVertical className="h-5 w-5" /></IconButton>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className="max-w-[70%]">
                <div className="text-[#ccc] text-xs ml-1">{msg.sender} {msg.timestamp}</div>
                <div className={`mt-1 rounded-lg text-white p-3 ${msg.sender === 'You' ? 'bg-[#1976d2]' : 'bg-[#3a3a3a]'}`}>
                  <div className="text-sm">{msg.content}</div>
                </div>
                <div className="text-[#ccc] text-xs ml-1">{msg.sender === 'You' ? 'Read • Now' : msg.isRead ? 'Read' : 'Unread'}</div>
              </div>
              {msg.sender === 'You' && (
                <Avatar size={24} className="ml-1 mt-2" style={{ backgroundColor: '#9c27b0', color: 'white' }} fallback="A" />
              )}
            </div>
          ))}
        </div>

        {/* Suggested Replies */}
        {suggestedReplies.length > 0 && (
          <div className="p-2 border-t border-[#333]">
            <div className="flex gap-2 mb-2">
              {suggestedReplies.map((reply, index) => (
                <Chip
                  key={index}
                  size="small"
                  style={{ backgroundColor: '#3a3a3a', color: '#ccc' }}
                  className="text-gray-300 hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  {reply}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-2 border-t border-[#333]">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-[#3a3a3a] border-[#555] placeholder:text-[#ccc]"
            />
            <IconButton className="text-[#ccc]"><Tag className="h-5 w-5" /></IconButton>
            <IconButton className="text-[#ccc]"><Paperclip className="h-5 w-5" /></IconButton>
            <Button onClick={handleSendMessage} size="small" className="bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]">Send</Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Contact Details */}
      <div className="w-full md:w-[300px] bg-[#2a2a2a] border-t md:border-t-0 md:border-l border-[#333] flex flex-col">
        {/* Contact Header */}
        <div className="p-2 border-b border-[#333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar size={40} className="mr-2" style={{ backgroundColor: getAvatarColor(contactInfo.status), color: 'white' }} fallback={contactInfo.avatar} />
              <div>
                <div className="text-white font-bold">{contactInfo.name}</div>
                <div className="text-[#ccc] text-sm">{contactInfo.status}</div>
              </div>
            </div>
            <IconButton className="text-[#ccc]"><ChevronDown className="h-5 w-5" /></IconButton>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-2 border-b border-[#333]">
          <div className="flex items-center mb-1">
            <span className="text-[#ccc] mr-2">📧</span>
            <span className="text-white">{contactInfo.email}</span>
          </div>
          <div className="flex items-center">
            <span className="text-[#ccc] mr-2">📍</span>
            <span className="text-white">{contactInfo.location}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-2 border-b border-[#333]">
          <div className="flex justify-around text-center text-white">
            <div>
              <MessageSquare className="h-5 w-5 text-[#ccc] mx-auto mb-1" />
              <div>{contactInfo.totalMessages}</div>
            </div>
            <div>
              <Archive className="h-5 w-5 text-[#ccc] mx-auto mb-1" />
              <div>{contactInfo.archivedCount}</div>
            </div>
            <div>
              <Globe2 className="h-5 w-5 text-[#ccc] mx-auto mb-1" />
              <div>{contactInfo.visitedPagesCount}</div>
            </div>
          </div>
        </div>

        {/* Chat Info Section */}
        <div className="p-2 border-b border-[#333]">
          <button onClick={() => toggleSection('chatInfo')} className="w-full flex items-center justify-between text-white font-medium hover:bg-white/5 rounded px-2 py-1">
            <span>Chat info</span>
            <ChevronDown className={`h-5 w-5 text-[#ccc] transition-transform ${expandedSections.chatInfo ? 'rotate-180' : ''}`} />
          </button>
          <Collapse in={expandedSections.chatInfo}>
            <div className="mt-2">
              <div className="mb-1">
                <div className="text-[#ccc] text-sm">Chat ID</div>
                <div className="text-white">{contactInfo.chatId}</div>
              </div>
              <div>
                <div className="text-[#ccc] text-sm">Chat duration</div>
                <div className="text-white">{contactInfo.chatDuration}</div>
              </div>
            </div>
          </Collapse>
        </div>

        {/* Chat Tags Section */}
        <div className="p-2 border-b border-[#333]">
          <button onClick={() => toggleSection('chatTags')} className="w-full flex items-center justify-between text-white font-medium hover:bg-white/5 rounded px-2 py-1">
            <span>Chat tags</span>
            <ChevronDown className={`h-5 w-5 text-[#ccc] transition-transform ${expandedSections.chatTags ? 'rotate-180' : ''}`} />
          </button>
          <Collapse in={expandedSections.chatTags}>
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {contactInfo.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    size="small"
                    style={{ backgroundColor: '#3a3a3a', color: '#ccc', fontSize: '0.75rem' }}
                    className="text-gray-300"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
              <IconButton className="bg-[#3a3a3a] text-[#ccc] w-8 h-8 hover:bg-[#4a4a4a]">
                <Plus className="h-4 w-4" />
              </IconButton>
            </div>
          </Collapse>
        </div>

        {/* Visited Pages Section */}
        <div className="p-2">
          <button onClick={() => toggleSection('visitedPages')} className="w-full flex items-center justify-between text-white font-medium hover:bg-white/5 rounded px-2 py-1">
            <span className="flex items-center">Visited pages <Badge content={"1"} className="ml-2" /></span>
            <ChevronDown className={`h-5 w-5 text-[#ccc] transition-transform ${expandedSections.visitedPages ? 'rotate-180' : ''}`} />
          </button>
          <Collapse in={expandedSections.visitedPages}>
            <div className="mt-2">
              {contactInfo.visitedPages.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {contactInfo.visitedPages.map((page, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="text-white font-medium">{page.title}</div>
                      <div className="text-[#ccc] text-xs">{page.url} • {page.timestamp}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[#ccc] text-sm">No pages visited yet</div>
              )}
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

