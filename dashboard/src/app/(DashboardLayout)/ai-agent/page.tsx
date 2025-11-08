"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { useAgents } from "@/contexts/AgentsContext";

const AIAgentPage = () => {
  const { agent } = useAgents();

  return (
    <PageContainer title="AI Agent" description="Manage your AI agent">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            AI Agent
          </h1>
          <div className="space-y-2">
            <p className="text-gray-300">
              Current Agent: <span className="text-white font-medium">{agent.name}</span>
            </p>
            <p className="text-gray-300">
              Type: <span className="text-white font-medium">{agent.type}</span>
            </p>
            {agent.description && (
              <p className="text-gray-300">
                Description: <span className="text-white font-medium">{agent.description}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AIAgentPage;
