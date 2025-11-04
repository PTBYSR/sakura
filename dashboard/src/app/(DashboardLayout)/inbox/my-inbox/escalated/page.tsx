"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const EscalatedChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-escalated"
    />
  );
};

export default EscalatedChatsPage;

