"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ARPTrigger {
  id: string;
  type: 'keyword' | 'intent' | 'pattern' | 'context';
  value: string;
  description: string;
}

export interface ARPResponse {
  id: string;
  type: 'text' | 'action' | 'redirect' | 'escalate';
  content: string;
  conditions?: string[];
}

export interface ARP {
  id: string;
  name: string;
  description: string;
  category: 'support' | 'sales' | 'billing' | 'technical' | 'general';
  status: 'active' | 'draft' | 'archived';
  triggers: ARPTrigger[];
  responses: ARPResponse[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  assignedAgents: string[]; // Agent IDs that use this ARP
}

interface ARPContextType {
  arps: ARP[];
  addARP: (arp: Omit<ARP, 'id' | 'createdAt' | 'updatedAt' | 'assignedAgents'>) => void;
  updateARP: (id: string, updates: Partial<ARP>) => void;
  deleteARP: (id: string) => void;
  getARPsByCategory: (category: string) => ARP[];
  getARPsForAgent: (agentId: string) => ARP[];
  assignARPToAgent: (arpId: string, agentId: string) => void;
  unassignARPFromAgent: (arpId: string, agentId: string) => void;
}

const ARPContext = createContext<ARPContextType | undefined>(undefined);

export const useARP = () => {
  const context = useContext(ARPContext);
  if (!context) {
    throw new Error('useARP must be used within an ARPProvider');
  }
  return context;
};

// Generate dummy ARPs
const generateDummyARPs = (): ARP[] => {
  return [
    {
      id: 'arp-1',
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
      id: 'arp-2',
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
      id: 'arp-3',
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
          value: 'not working',
          description: 'Customer says something is not working'
        }
      ],
      responses: [
        {
          id: 'response-5',
          type: 'text',
          content: 'I\'m here to help you resolve this technical issue.'
        },
        {
          id: 'response-6',
          type: 'escalate',
          content: 'Escalate to technical support team'
        }
      ]
    },
    {
      id: 'arp-4',
      name: 'Order Status Inquiry',
      description: 'Provides order status and tracking information',
      category: 'support',
      status: 'active',
      priority: 2,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-16'),
      assignedAgents: [],
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
          id: 'response-7',
          type: 'text',
          content: 'Let me check your order status for you.'
        },
        {
          id: 'response-8',
          type: 'action',
          content: 'Retrieve order information and tracking details'
        }
      ]
    },
    {
      id: 'arp-5',
      name: 'Greeting Protocol',
      description: 'Standard greeting and initial customer interaction',
      category: 'general',
      status: 'active',
      priority: 3,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-14'),
      assignedAgents: ['sales-agent'],
      triggers: [
        {
          id: 'trigger-9',
          type: 'context',
          value: 'conversation_start',
          description: 'Beginning of conversation'
        }
      ],
      responses: [
        {
          id: 'response-9',
          type: 'text',
          content: 'Hello! How can I help you today?'
        }
      ]
    }
  ];
};

interface ARPProviderProps {
  children: ReactNode;
}

export const ARPProvider: React.FC<ARPProviderProps> = ({ children }) => {
  const [arps, setARPs] = useState<ARP[]>(generateDummyARPs());

  const addARP = (arpData: Omit<ARP, 'id' | 'createdAt' | 'updatedAt' | 'assignedAgents'>) => {
    const newARP: ARP = {
      ...arpData,
      id: `arp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedAgents: [],
    };
    setARPs(prev => [...prev, newARP]);
  };

  const updateARP = (id: string, updates: Partial<ARP>) => {
    setARPs(prev => prev.map(arp => 
      arp.id === id 
        ? { ...arp, ...updates, updatedAt: new Date() }
        : arp
    ));
  };

  const deleteARP = (id: string) => {
    setARPs(prev => prev.filter(arp => arp.id !== id));
  };

  const getARPsByCategory = (category: string): ARP[] => {
    return arps.filter(arp => arp.category === category);
  };

  const getARPsForAgent = (agentId: string): ARP[] => {
    return arps.filter(arp => arp.assignedAgents.includes(agentId));
  };

  const assignARPToAgent = (arpId: string, agentId: string) => {
    setARPs(prev => prev.map(arp => 
      arp.id === arpId 
        ? { 
            ...arp, 
            assignedAgents: [...arp.assignedAgents, agentId],
            updatedAt: new Date()
          }
        : arp
    ));
  };

  const unassignARPFromAgent = (arpId: string, agentId: string) => {
    setARPs(prev => prev.map(arp => 
      arp.id === arpId 
        ? { 
            ...arp, 
            assignedAgents: arp.assignedAgents.filter(id => id !== agentId),
            updatedAt: new Date()
          }
        : arp
    ));
  };

  return (
    <ARPContext.Provider value={{
      arps,
      addARP,
      updateARP,
      deleteARP,
      getARPsByCategory,
      getARPsForAgent,
      assignARPToAgent,
      unassignARPFromAgent,
    }}>
      {children}
    </ARPContext.Provider>
  );
};

