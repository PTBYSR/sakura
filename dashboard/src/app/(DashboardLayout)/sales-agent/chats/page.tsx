"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SalesAgentChatsPage = () => {
  return (
    <PageContainer title="Sales Agent Chats" description="View sales agent conversations">
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">Sales Agent Chats</div>
          <div className="text-sm text-gray-300">This is the Sales Agent Chats page at /sales-agent/chats</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SalesAgentChatsPage;
