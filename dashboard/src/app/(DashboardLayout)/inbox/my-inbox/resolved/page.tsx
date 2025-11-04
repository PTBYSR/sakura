"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const ResolvedChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-resolved"
    />
  );
};

export default ResolvedChatsPage;

