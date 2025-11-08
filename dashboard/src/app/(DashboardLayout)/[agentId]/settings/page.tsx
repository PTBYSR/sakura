"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";
import { useParams } from "next/navigation";

const AgentSettingsPage = () => {
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
    <PageContainer title={`${agent.name} Settings`} description={`Configure ${agent.name} settings`}>
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">{agent.name} Settings</div>
          <div className="text-sm text-gray-300">This is the {agent.name} Settings page at /{agent.id}/settings</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AgentSettingsPage;

