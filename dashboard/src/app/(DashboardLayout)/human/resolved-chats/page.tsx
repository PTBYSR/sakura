"use client";
import React from "react";
import ExactChatInterface from "../../inbox/components/ExactChatInterface";

const ResolvedChatsPage = () => {
  return (
    <ExactChatInterface
      inboxType="human"
      userEmail="agent@heirs.com"
      section="my-inbox-resolved"
      suggestedReplies={[
        "Thank you for contacting us.",
        "Is there anything else I can help with?",
        "Have a great day!",
      ]}
    />
  );
};

export default ResolvedChatsPage;