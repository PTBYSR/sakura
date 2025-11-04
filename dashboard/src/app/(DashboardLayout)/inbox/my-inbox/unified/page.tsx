"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const UnifiedInboxPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="unified-inbox"
    />
  );
};

export default UnifiedInboxPage;

