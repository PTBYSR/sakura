"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Button,
} from "@mui/material";
import { Send, Clear, ChatBubble } from "@mui/icons-material";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatbotTesterProps {
  faqs: Array<{ id: string; question: string; answer: string }>;
}

export default function ChatbotTester({ faqs }: ChatbotTesterProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your FAQ assistant. Ask me anything about the FAQs you've created.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestMatch = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    // Find FAQs that match the query
    const matches = faqs.filter((faq) => {
      const questionMatch = faq.question.toLowerCase().includes(lowerQuery);
      const answerMatch = faq.answer.toLowerCase().includes(lowerQuery);
      return questionMatch || answerMatch;
    });

    if (matches.length > 0) {
      // Return the first match's answer
      return matches[0].answer;
    }

    // Fallback response
    return "I couldn't find a matching FAQ. Try rephrasing your question or check the FAQs list for available questions.";
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Find best match and respond
    setTimeout(() => {
      const response = findBestMatch(inputMessage);
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: response || "Sorry, I couldn't process that.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 300);

    setInputMessage("");
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your FAQ assistant. Ask me anything about the FAQs you've created.",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        height: "600px",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {message.role === "assistant" && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                }}
              >
                <ChatBubble fontSize="small" />
              </Avatar>
            )}

            <Paper
              sx={{
                maxWidth: "75%",
                px: 2,
                py: 1.5,
                bgcolor:
                  message.role === "user" ? "primary.main" : "background.paper",
                color: message.role === "user" ? "white" : "text.primary",
                boxShadow: 1,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </Typography>
            </Paper>

            {message.role === "user" && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "grey.400",
                }}
              >
                U
              </Avatar>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

