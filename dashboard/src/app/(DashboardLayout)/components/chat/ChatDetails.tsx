"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  Button,
} from '@mui/material';
import {
  IconUser,
  IconBulb,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconFileText,
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPackage,
  IconWorld,
} from '@tabler/icons-react';
import { Customer } from '@/contexts/ChatContext';

interface ChatDetailsProps {
  customer: Customer;
}

const ChatDetails: React.FC<ChatDetailsProps> = ({ customer }) => {
  const [expandedSections, setExpandedSections] = useState({
    chatInfo: true,
    chatTags: false,
    visitedPages: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      default: return '#8a8a8a';
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {/* Header Icons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <IconButton size="small" sx={{ color: '#8a8a8a' }}>
          <IconUser size={20} />
        </IconButton>
        <IconButton size="small" sx={{ color: '#8a8a8a' }}>
          <IconBulb size={20} />
        </IconButton>
        <IconButton size="small" sx={{ color: '#8a8a8a' }}>
          <IconBrandFacebook size={20} />
        </IconButton>
        <IconButton size="small" sx={{ color: '#8a8a8a' }}>
          <IconBrandWhatsapp size={20} />
        </IconButton>
        <IconButton size="small" sx={{ color: '#8a8a8a' }}>
          <IconFileText size={20} />
        </IconButton>
      </Box>

      {/* Customer Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            backgroundColor: getAvatarColor(customer.name),
            color: 'white',
            fontWeight: 600,
          }}
        >
          {customer.avatar}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {customer.name}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: getStatusColor(customer.status),
              textTransform: 'capitalize'
            }}
          >
            {customer.status === 'online' ? 'Chatting' : customer.status}
          </Typography>
        </Box>
      </Box>

      {/* Contact Details */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconMail size={16} color="#8a8a8a" />
          <Typography 
            variant="body2" 
            component="a"
            href={`mailto:${customer.email}`}
            sx={{ 
              color: '#4fc3f7', 
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {customer.email}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconMapPin size={16} color="#8a8a8a" />
          <Typography variant="body2" sx={{ color: '#8a8a8a' }}>
            {customer.location}
          </Typography>
        </Box>
      </Box>

      {/* Statistics */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {customer.totalMessages}
          </Typography>
          <IconMessageCircle size={16} color="#8a8a8a" />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            0
          </Typography>
          <IconPackage size={16} color="#8a8a8a" />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {customer.visitedPages}
          </Typography>
          <IconWorld size={16} color="#8a8a8a" />
        </Box>
      </Box>

      {/* Chat Info Section */}
      <Box sx={{ mb: 2 }}>
        <Box
          onClick={() => toggleSection('chatInfo')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            py: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            Chat info
          </Typography>
          {expandedSections.chatInfo ? (
            <IconChevronDown size={16} color="#8a8a8a" />
          ) : (
            <IconChevronRight size={16} color="#8a8a8a" />
          )}
        </Box>
        <Collapse in={expandedSections.chatInfo}>
          <Box sx={{ pl: 2, py: 1 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#8a8a8a', fontSize: '12px' }}>
                Chat ID
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
                {customer.chatId}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#8a8a8a', fontSize: '12px' }}>
                Chat duration
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontSize: '12px' }}>
                {customer.chatDuration}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Chat Tags Section */}
      <Box sx={{ mb: 2 }}>
        <Box
          onClick={() => toggleSection('chatTags')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            py: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            Chat tags
          </Typography>
          {expandedSections.chatTags ? (
            <IconChevronDown size={16} color="#8a8a8a" />
          ) : (
            <IconChevronRight size={16} color="#8a8a8a" />
          )}
        </Box>
        <Collapse in={expandedSections.chatTags}>
          <Box sx={{ pl: 2, py: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              {customer.tags.map((tag, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: '#3a3a3a',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '12px',
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Box>
            <Button
              size="small"
              startIcon={<IconPlus size={14} />}
              sx={{
                color: '#8a8a8a',
                textTransform: 'none',
                fontSize: '12px',
                p: 0,
                minWidth: 'auto',
              }}
            >
              Add tag
            </Button>
          </Box>
        </Collapse>
      </Box>

      {/* Visited Pages Section */}
      <Box sx={{ mb: 2 }}>
        <Box
          onClick={() => toggleSection('visitedPages')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            py: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            Visited pages
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#8a8a8a' }}>
              {customer.visitedPages}
            </Typography>
            {expandedSections.visitedPages ? (
              <IconChevronDown size={16} color="#8a8a8a" />
            ) : (
              <IconChevronRight size={16} color="#8a8a8a" />
            )}
          </Box>
        </Box>
        <Collapse in={expandedSections.visitedPages}>
          <Box sx={{ pl: 2, py: 1 }}>
            <Typography variant="body2" sx={{ color: '#8a8a8a', fontSize: '12px' }}>
              No pages visited yet
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default ChatDetails;

