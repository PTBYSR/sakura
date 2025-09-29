"use client";
import React, { useState } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton } from '@mui/material';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import ChatList from './ChatList';
import ChatConversation from './ChatConversation';
import ChatDetails from './ChatDetails';
import { useChat } from '@/contexts/ChatContext';

interface ChatLayoutProps {
  category: 'human-chats' | 'escalated' | 'resolved' | 'ai-active' | 'ai-resolved';
  title: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ category, title }) => {
  const { getCustomersByCategory, selectedChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Oldest');

  const customers = getCustomersByCategory(category);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      {/* Left Column - Chat List */}
      <Box sx={{ 
        width: '350px', 
        backgroundColor: '#2a2a2a', 
        borderRight: '1px solid #3a3a3a',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid #3a3a3a' }}>
          <TextField
            fullWidth
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} color="#8a8a8a" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="caption" sx={{ color: '#8a8a8a', fontSize: '12px' }}>
                    ctrl K
                  </Typography>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3a3a3a',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: '#8a8a8a',
                  },
                },
              },
            }}
          />
        </Box>

        {/* Chat List Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #3a3a3a' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
                {customers.length} chats
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                backgroundColor: '#1a1a1a',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                  {sortBy}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
                  ▼
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Chat List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <ChatList customers={customers} searchQuery={searchQuery} />
        </Box>
      </Box>

      {/* Middle Column - Chat Conversation */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#1a1a1a'
      }}>
        {selectedChat ? (
          <ChatConversation customer={selectedChat} />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ color: '#8a8a8a' }}>
              Select a chat to start conversation
            </Typography>
            <Typography variant="body2" sx={{ color: '#6a6a6a' }}>
              Choose a customer from the list to view their messages
            </Typography>
          </Box>
        )}
      </Box>

      {/* Right Column - Chat Details */}
      <Box sx={{ 
        width: '350px', 
        backgroundColor: '#2a2a2a', 
        borderLeft: '1px solid #3a3a3a',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedChat ? (
          <ChatDetails customer={selectedChat} />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%'
          }}>
            <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
              Select a chat to view details
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatLayout;

