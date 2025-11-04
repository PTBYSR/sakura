"use client";
import React from "react";
import ExactChatInterface from "../components/ExactChatInterface";

const AgentInboxPage = () => {
  return (
    <ExactChatInterface
      inboxType="agent"
      userEmail="admin@heirs.com"
      section="agent-inbox-active"
    />
  );
};

export default AgentInboxPage;