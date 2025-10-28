"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: Date;
}

interface AgentsContextType {
  agent: Agent;
  updateAgent: (updates: Partial<Agent>) => void;
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
  const [agent, setAgent] = useState<Agent>({
    id: 'main-agent',
    name: 'Sales Agent',
    type: 'sales',
    description: 'Handles sales inquiries and lead generation',
    createdAt: new Date(),
  });

  const updateAgent = (updates: Partial<Agent>) => {
    setAgent(prev => ({ ...prev, ...updates }));
  };

  return (
    <AgentsContext.Provider value={{
      agent,
      updateAgent,
    }}>
      {children}
    </AgentsContext.Provider>
  );
};

