"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const ResolvedChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="agent"
      userEmail="admin@heirs.com"
      section="agent-inbox-resolved"
    />
  );
};

export default ResolvedChatsPage;

