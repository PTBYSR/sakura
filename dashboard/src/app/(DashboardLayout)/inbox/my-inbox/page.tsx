"use client";
import React from "react";
import ExactChatInterface from "../components/ExactChatInterface";

const MyInboxPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-chats"
      suggestedReplies={[
        "I can help you with that! 📋",
        "Let me check your policy details...",
        "I&apos;ll need some additional information...",
      ]}
    />
  );
};

export default MyInboxPage;