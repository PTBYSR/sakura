"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  IconLink,
  IconDots,
  IconPaperclip,
  IconHash,
  IconSend,
} from '@tabler/icons-react';
import { Customer } from '@/contexts/ChatContext';
import { useChat } from '@/contexts/ChatContext';

interface ChatConversationProps {
  customer: Customer;
}

const ChatConversation: React.FC<ChatConversationProps> = ({ customer }) => {
  const { getChatMessages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('Message');

  const messages = getChatMessages(customer.chatId);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(customer.chatId, newMessage);
      setNewMessage('');
    }
  };

  const suggestedReplies = [
    'Hi there! 👋',
    'How can I help you?',
    'Hello! 👋',
    'Let me find that for you...',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #3a3a3a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
          {customer.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" sx={{ color: '#8a8a8a' }}>
            <IconLink size={20} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#8a8a8a' }}>
            <IconDots size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
              alignItems: 'flex-end',
              gap: 1,
            }}
          >
            {message.sender === 'customer' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: getAvatarColor(customer.name),
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                {customer.avatar}
              </Avatar>
            )}

            <Box sx={{ maxWidth: '70%' }}>
              <Box
                sx={{
                  backgroundColor: message.sender === 'user' ? '#1976d2' : '#3a3a3a',
                  color: 'white',
                  p: 2,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                {message.isLink ? (
                  <Typography
                    component="a"
                    href={message.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: '#4fc3f7',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {message.content}
                  </Typography>
                ) : (
                  <Typography variant="body2">{message.content}</Typography>
                )}
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                gap: 1,
                mt: 0.5,
                px: 1
              }}>
                <Typography variant="caption" sx={{ color: '#8a8a8a', fontSize: '11px' }}>
                  {message.sender === 'user' ? 'You' : customer.name} {formatTime(message.timestamp)}
                </Typography>
                {message.sender === 'user' && (
                  <Typography variant="caption" sx={{ color: '#8a8a8a', fontSize: '11px' }}>
                    • {message.status === 'read' ? 'Read' : 'Delivered'} • Now
                  </Typography>
                )}
                {message.sender === 'customer' && (
                  <Typography variant="caption" sx={{ color: '#8a8a8a', fontSize: '11px' }}>
                    • Now
                  </Typography>
                )}
              </Box>
            </Box>

            {message.sender === 'user' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                U
              </Avatar>
            )}
          </Box>
        ))}
      </Box>

      {/* Suggested Replies */}
      <Box sx={{ p: 2, borderTop: '1px solid #3a3a3a' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {suggestedReplies.map((reply, index) => (
            <Chip
              key={index}
              label={reply}
              size="small"
              onClick={() => setNewMessage(reply)}
              sx={{
                backgroundColor: '#3a3a3a',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4a4a4a',
                },
              }}
            />
          ))}
        </Box>

        {/* Message Input */}
        <TextField
          fullWidth
          placeholder="Enter message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          InputProps={{
            sx: {
              backgroundColor: '#2a2a2a',
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

        {/* Action Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 1 
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              endIcon={<Typography sx={{ fontSize: '12px' }}>▼</Typography>}
              sx={{ 
                color: '#8a8a8a',
                textTransform: 'none',
                fontSize: '12px'
              }}
            >
              {messageType}
            </Button>
            <IconButton size="small" sx={{ color: '#8a8a8a' }}>
              <IconPaperclip size={16} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#8a8a8a' }}>
              <IconHash size={16} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#8a8a8a' }}>
              <IconLink size={16} />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatConversation;

