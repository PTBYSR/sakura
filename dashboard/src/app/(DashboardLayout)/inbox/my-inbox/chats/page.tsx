"use client";
import React from "react";
import ExactChatInterface from "../../components/ExactChatInterface";

const ChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-chats"
    />
  );
};

export default ChatsPage;

