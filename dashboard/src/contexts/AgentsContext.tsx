"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NavigationItem } from '@/config/navigation';
import { IconRobot, IconSettings, IconTrendingUp, IconMessageCircle } from '@tabler/icons-react';

export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: Date;
}

interface AgentsContextType {
  agents: Agent[];
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => void;
  removeAgent: (agentId: string) => void;
  getAgentNavigationItems: () => NavigationItem[];
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
};

interface AgentsProviderProps {
  children: ReactNode;
}

export const AgentsProvider: React.FC<AgentsProviderProps> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([
    // Default sales agent
    {
      id: 'sales-agent',
      name: 'Sales Agent',
      type: 'sales',
      description: 'Handles sales inquiries and lead generation',
      createdAt: new Date(),
    },
  ]);

  const addAgent = (agentData: Omit<Agent, 'id' | 'createdAt'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setAgents(prev => [...prev, newAgent]);
  };

  const removeAgent = (agentId: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  };

  const getAgentNavigationItems = (): NavigationItem[] => {
    return agents.map(agent => ({
      id: agent.id,
      title: agent.name,
      href: `/ai-agent/${agent.id}`,
      icon: IconRobot,
      collapsible: true,
      isDynamic: true,
      children: [
        {
          id: `${agent.id}-settings`,
          title: 'Settings',
          href: `/${agent.id}/settings`,
          icon: IconSettings,
        },
        {
          id: `${agent.id}-performance`,
          title: 'Performance',
          href: `/${agent.id}/performance`,
          icon: IconTrendingUp,
          external: true,
        },
        {
          id: `${agent.id}-chats`,
          title: 'Chats',
          href: `/${agent.id}/chats`,
          icon: IconMessageCircle,
          external: true,
        },
      ],
    }));
  };

  return (
    <AgentsContext.Provider value={{
      agents,
      addAgent,
      removeAgent,
      getAgentNavigationItems,
    }}>
      {children}
    </AgentsContext.Provider>
  );
};

