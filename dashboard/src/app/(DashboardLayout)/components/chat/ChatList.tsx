"use client";
import React from 'react';
import { Box, Typography, Avatar, Badge } from '@mui/material';
import { Customer } from '@/contexts/ChatContext';
import { useChat } from '@/contexts/ChatContext';

interface ChatListProps {
  customers: Customer[];
  searchQuery: string;
}

const ChatList: React.FC<ChatListProps> = ({ customers, searchQuery }) => {
  const { selectedChat, setSelectedChat } = useChat();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Safe formatTime
  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Box>
      {filteredCustomers.map((customer) => (
        <Box
          key={customer._id} // updated from customer.id to _id
          onClick={() => setSelectedChat(customer)}
          sx={{
            p: 2,
            cursor: 'pointer',
            backgroundColor: selectedChat?._id === customer._id ? '#3a3a3a' : 'transparent',
            borderBottom: '1px solid #3a3a3a',
            '&:hover': {
              backgroundColor: selectedChat?._id === customer._id ? '#3a3a3a' : '#2a2a2a',
            },
            transition: 'background-color 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: getAvatarColor(customer.name),
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {customer.avatar || customer.name.charAt(0)}
              </Avatar>
              {customer.status === 'online' && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    backgroundColor: '#4caf50',
                    borderRadius: '50%',
                    border: '2px solid #2a2a2a',
                  }}
                />
              )}
            </Box>

            {/* Chat Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {customer.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#8a8a8a',
                    fontSize: '12px',
                    flexShrink: 0,
                    ml: 1,
                  }}
                >
                  {formatTime(customer.lastMessageTime)}
                </Typography>
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  color: '#8a8a8a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {customer.lastMessage || 'No messages yet'}
              </Typography>
            </Box>

            {/* Unread Badge */}
            {customer.unreadCount && customer.unreadCount > 0 && (
              <Badge
                badgeContent={customer.unreadCount}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff4444',
                    color: 'white',
                    fontSize: '10px',
                    minWidth: '18px',
                    height: '18px',
                  },
                }}
              />
            )}
          </Box>
        </Box>
      ))}
      
      {filteredCustomers.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
            No chats found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatList;
