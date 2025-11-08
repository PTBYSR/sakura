"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { useParams } from "next/navigation";

const AgentChatsPage = () => {
  const params = useParams();
  const agentId = params.agentId as string;
  const { agent } = useAgents();
  
  // Check if the agent ID matches the requested agentId
  const isAgentMatch = agent.id === agentId;

  if (!isAgentMatch) {
    return (
      <PageContainer title="Agent Not Found" description="The requested agent was not found">
        <div className="max-w-5xl mx-auto py-6">
          <div className="py-4">
            <div className="text-2xl font-semibold text-white mb-2">Agent Not Found</div>
            <div className="text-sm text-gray-300">The agent you&apos;re looking for doesn&apos;t exist.</div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`${agent.name} Chats`} description={`View ${agent.name} conversations`}>
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">{agent.name} Chats</div>
          <div className="text-sm text-gray-300">This is the {agent.name} Chats page at /{agent.id}/chats</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AgentChatsPage;

