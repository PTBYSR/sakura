"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare } from "lucide-react";

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
    <div className="h-[600px] flex flex-col bg-[#1a1a1a]">
      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#EE66AA] to-[#8a2be2] flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-white" />
              </div>
            )}

            <div
              className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                message.role === "user"
                  ? "bg-gradient-to-r from-[#EE66AA] to-[#8a2be2] text-white"
                  : "bg-[#1e1e1e] border border-gray-700 text-gray-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-white">U</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-[#1e1e1e]">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 px-4 py-2 rounded-full bg-[#1a1a1a] border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#EE66AA] focus:border-transparent resize-none max-h-24"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              inputMessage.trim()
                ? "bg-gradient-to-r from-[#EE66AA] to-[#8a2be2] text-white hover:opacity-90"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
