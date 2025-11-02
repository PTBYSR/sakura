"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const ResolvedChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="agent"
      userEmail="admin@heirs.com"
      section="agent-inbox-resolved"
      suggestedReplies={[
        "Thank you for using our AI assistant!",
        "Is there anything else I can help with?",
        "Have a great day!",
      ]}
    />
  );
};

export default ResolvedChatsPage;

