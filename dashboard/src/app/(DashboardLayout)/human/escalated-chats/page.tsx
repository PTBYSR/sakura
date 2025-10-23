"use client";
import React from "react";
import ExactChatInterface from "../../inbox/components/ExactChatInterface";

const EscalatedChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-escalated"
      suggestedReplies={[
        "I understand this is urgent. Let me help you right away.",
        "I&apos;m escalating this to our technical team immediately.",
        "This is a priority issue. I&apos;ll resolve it quickly.",
      ]}
    />
  );
};

export default EscalatedChatsPage;