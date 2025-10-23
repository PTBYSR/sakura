"use client";
import React from "react";
import ExactChatInterface from "../../inbox/components/ExactChatInterface";

const ActiveChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="agent"
      userEmail="admin@heirs.com"
      section="agent-inbox-active"
      suggestedReplies={[
        "Hello! I&apos;m an AI assistant. How can I help you?",
        "I can assist you with that right away.",
        "Let me process your request...",
      ]}
    />
  );
};

export default ActiveChatsPage;