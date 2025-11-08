"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

export const dynamic = 'force-dynamic';

const AgentPage = () => {
  const { agent } = useAgents();

  return (
    <PageContainer title={agent.name} description={`Manage ${agent.name}`}>
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">{agent.name}</div>
          <div className="text-sm text-gray-300 mb-2">Type: {agent.type}</div>
          {agent.description && (
            <div className="text-sm text-gray-300 mb-2">Description: {agent.description}</div>
          )}
          <div className="text-sm text-gray-300">This is the {agent.name} page at /ai-agent/{agent.id}</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AgentPage;

