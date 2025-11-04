"use client";
import React from "react";
import { authClient } from "@/lib/auth-client";
import ExactChatInterface from "../../components/ExactChatInterface";

const ActiveChatsPage = () => {
  const { data: session, isPending } = authClient.useSession();
  
  // Get logged-in user's email and ID (ID is used to filter widget customers by widget owner)
  const userEmail = session?.user?.email || "admin@heirs.com";
  const userId = session?.user?.id || null;
  
  return (
    <ExactChatInterface
      inboxType="agent"
      userEmail={userEmail}
      userId={userId}
      section="agent-inbox-active"
    />
  );
};

export default ActiveChatsPage;

