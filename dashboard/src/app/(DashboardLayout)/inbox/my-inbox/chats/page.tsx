"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const ChatsPage = () => {
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

export default ChatsPage;

