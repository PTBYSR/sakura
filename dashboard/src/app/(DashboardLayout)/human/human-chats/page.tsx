"use client";
import React from "react";
import ExactChatInterface from "../../inbox/components/ExactChatInterface";

const HumanChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-chats"
      suggestedReplies={[
        "Hi there! 👋",
        "How can I help you today?",
        "Let me assist you with that...",
      ]}
    />
  );
};

export default HumanChatsPage;