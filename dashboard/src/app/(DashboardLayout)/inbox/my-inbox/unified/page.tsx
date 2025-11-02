"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const UnifiedInboxPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="unified-inbox"
      suggestedReplies={[
        "Hi there! 👋",
        "How can I help you today?",
        "Let me assist you with that...",
      ]}
    />
  );
};

export default UnifiedInboxPage;

