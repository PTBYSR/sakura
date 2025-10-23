"use client";
import React from "react";
import ExactChatInterface from "../components/ExactChatInterface";

const AgentInboxPage = () => {
  return (
    <ExactChatInterface
      inboxType="agent"
      userEmail="admin@heirs.com"
      section="agent-inbox-active"
      suggestedReplies={[
        "Hi there! 👋",
        "How can I help you today?",
        "Let me assist you with that...",
      ]}
    />
  );
};

export default AgentInboxPage;