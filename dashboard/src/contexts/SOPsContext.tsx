"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SOPTrigger {
  id: string;
  type: 'keyword' | 'intent' | 'pattern' | 'context';
  value: string;
  description: string;
}

export interface SOPResponse {
  id: string;
  type: 'text' | 'action' | 'redirect' | 'escalate';
  content: string;
  conditions?: string[];
}

export interface SOP {
  id: string;
  name: string;
  description: string;
  category: 'support' | 'sales' | 'billing' | 'technical' | 'general';
  status: 'active' | 'draft' | 'archived';
  triggers: SOPTrigger[];
  responses: SOPResponse[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  assignedAgents: string[]; // Agent IDs that use this SOP
}

interface SOPsContextType {
  sops: SOP[];
  addSOP: (sop: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'assignedAgents'>) => void;
  updateSOP: (id: string, updates: Partial<SOP>) => void;
  deleteSOP: (id: string) => void;
  getSOPsByCategory: (category: string) => SOP[];
  getSOPsForAgent: (agentId: string) => SOP[];
  assignSOPToAgent: (sopId: string, agentId: string) => void;
  unassignSOPFromAgent: (sopId: string, agentId: string) => void;
}

const SOPsContext = createContext<SOPsContextType | undefined>(undefined);

export const useSOPs = () => {
  const context = useContext(SOPsContext);
  if (!context) {
    throw new Error('useSOPs must be used within an SOPsProvider');
  }
  return context;
};

// Generate dummy SOPs
const generateDummySOPs = (): SOP[] => {
  return [
    {
      id: 'sop-1',
      name: 'Refund Processing',
      description: 'Handles customer refund requests and processing',
      category: 'billing',
      status: 'active',
      priority: 1,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      assignedAgents: ['sales-agent'],
      triggers: [
        {
          id: 'trigger-1',
          type: 'keyword',
          value: 'refund',
          description: 'Customer mentions refund'
        },
        {
          id: 'trigger-2',
          type: 'keyword',
          value: 'money back',
          description: 'Customer asks for money back'
        }
      ],
      responses: [
        {
          id: 'response-1',
          type: 'text',
          content: 'I understand you\'d like to request a refund. Let me help you with that process.'
        },
        {
          id: 'response-2',
          type: 'action',
          content: 'Check order status and eligibility for refund'
        }
      ]
    },
    {
      id: 'sop-2',
      name: 'Product Information',
      description: 'Provides detailed product information and specifications',
      category: 'sales',
      status: 'active',
      priority: 2,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      assignedAgents: ['sales-agent'],
      triggers: [
        {
          id: 'trigger-3',
          type: 'keyword',
          value: 'product details',
          description: 'Customer asks for product information'
        },
        {
          id: 'trigger-4',
          type: 'keyword',
          value: 'specifications',
          description: 'Customer asks for specifications'
        }
      ],
      responses: [
        {
          id: 'response-3',
          type: 'text',
          content: 'I\'d be happy to provide you with detailed product information.'
        },
        {
          id: 'response-4',
          type: 'action',
          content: 'Retrieve product details from database'
        }
      ]
    },
    {
      id: 'sop-3',
      name: 'Technical Support',
      description: 'Handles technical issues and troubleshooting',
      category: 'technical',
      status: 'active',
      priority: 1,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19'),
      assignedAgents: [],
      triggers: [
        {
          id: 'trigger-5',
          type: 'keyword',
          value: 'technical issue',
          description: 'Customer reports technical problem'
        },
        {
          id: 'trigger-6',
          type: 'keyword',
          value: 'bug',
          description: 'Customer reports a bug'
        }
      ],
      responses: [
        {
          id: 'response-5',
          type: 'text',
          content: 'I\'m sorry to hear you\'re experiencing technical issues. Let me help you troubleshoot this.'
        },
        {
          id: 'response-6',
          type: 'action',
          content: 'Gather system information and error details'
        },
        {
          id: 'response-7',
          type: 'escalate',
          content: 'Escalate to technical support team if issue persists'
        }
      ]
    },
    {
      id: 'sop-4',
      name: 'Order Status Inquiry',
      description: 'Provides order status and tracking information',
      category: 'support',
      status: 'active',
      priority: 2,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-16'),
      assignedAgents: ['sales-agent'],
      triggers: [
        {
          id: 'trigger-7',
          type: 'keyword',
          value: 'order status',
          description: 'Customer asks about order status'
        },
        {
          id: 'trigger-8',
          type: 'keyword',
          value: 'tracking',
          description: 'Customer asks for tracking information'
        }
      ],
      responses: [
        {
          id: 'response-8',
          type: 'text',
          content: 'I\'ll help you check the status of your order.'
        },
        {
          id: 'response-9',
          type: 'action',
          content: 'Look up order by order number or email'
        }
      ]
    },
    {
      id: 'sop-5',
      name: 'Account Setup',
      description: 'Guides new customers through account creation',
      category: 'general',
      status: 'draft',
      priority: 3,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-14'),
      assignedAgents: [],
      triggers: [
        {
          id: 'trigger-9',
          type: 'keyword',
          value: 'create account',
          description: 'Customer wants to create an account'
        },
        {
          id: 'trigger-10',
          type: 'keyword',
          value: 'sign up',
          description: 'Customer wants to sign up'
        }
      ],
      responses: [
        {
          id: 'response-10',
          type: 'text',
          content: 'I\'d be happy to help you create an account. Let me guide you through the process.'
        },
        {
          id: 'response-11',
          type: 'action',
          content: 'Provide account creation link and instructions'
        }
      ]
    }
  ];
};

interface SOPsProviderProps {
  children: ReactNode;
}

export const SOPsProvider: React.FC<SOPsProviderProps> = ({ children }) => {
  const [sops, setSOPs] = useState<SOP[]>(generateDummySOPs());

  const addSOP = (sopData: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'assignedAgents'>) => {
    const newSOP: SOP = {
      ...sopData,
      id: `sop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedAgents: [],
    };
    setSOPs(prev => [...prev, newSOP]);
  };

  const updateSOP = (id: string, updates: Partial<SOP>) => {
    setSOPs(prev => prev.map(sop => 
      sop.id === id 
        ? { ...sop, ...updates, updatedAt: new Date() }
        : sop
    ));
  };

  const deleteSOP = (id: string) => {
    setSOPs(prev => prev.filter(sop => sop.id !== id));
  };

  const getSOPsByCategory = (category: string): SOP[] => {
    return sops.filter(sop => sop.category === category);
  };

  const getSOPsForAgent = (agentId: string): SOP[] => {
    return sops.filter(sop => sop.assignedAgents.includes(agentId));
  };

  const assignSOPToAgent = (sopId: string, agentId: string) => {
    setSOPs(prev => prev.map(sop => 
      sop.id === sopId 
        ? { 
            ...sop, 
            assignedAgents: [...sop.assignedAgents, agentId],
            updatedAt: new Date()
          }
        : sop
    ));
  };

  const unassignSOPFromAgent = (sopId: string, agentId: string) => {
    setSOPs(prev => prev.map(sop => 
      sop.id === sopId 
        ? { 
            ...sop, 
            assignedAgents: sop.assignedAgents.filter(id => id !== agentId),
            updatedAt: new Date()
          }
        : sop
    ));
  };

  return (
    <SOPsContext.Provider value={{
      sops,
      addSOP,
      updateSOP,
      deleteSOP,
      getSOPsByCategory,
      getSOPsForAgent,
      assignSOPToAgent,
      unassignSOPFromAgent,
    }}>
      {children}
    </SOPsContext.Provider>
  );
};