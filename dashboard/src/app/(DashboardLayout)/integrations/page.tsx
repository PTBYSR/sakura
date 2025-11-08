"use client";
import React, { useState } from "react";
import {
  Code,
  Facebook,
  Instagram,
  MessageSquare,
  Users,
  Webhook,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  category: 'api' | 'social' | 'automation' | 'webhook';
  lastSync?: string;
  error?: string;
}

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "slack",
      name: "Slack",
      description: "Connect Sakura to your Slack workspace for seamless team communication",
      icon: <MessageSquare size={20} />,
      status: "connected",
      category: "social",
      lastSync: "2 minutes ago"
    },
    {
      id: "discord",
      name: "Discord",
      description: "Integrate with Discord servers for community management",
      icon: <Users size={20} />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Connect WhatsApp Business API for customer support",
      icon: <MessageSquare size={20} />,
      status: "connected",
      category: "social",
      lastSync: "5 minutes ago"
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Integrate Telegram bots for automated messaging",
      icon: <MessageSquare size={20} />,
      status: "pending",
      category: "social"
    },
    {
      id: "facebook",
      name: "Facebook Messenger",
      description: "Connect Facebook Messenger for customer interactions",
      icon: <Facebook size={20} />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Integrate Instagram Direct Messages",
      icon: <Instagram size={20} />,
      status: "disconnected",
      category: "social"
    },
    {
      id: "api",
      name: "Custom API",
      description: "Connect to external APIs and services",
      icon: <Code size={20} />,
      status: "connected",
      category: "api",
      lastSync: "1 hour ago"
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description: "Configure webhooks for real-time data synchronization",
      icon: <Webhook size={20} />,
      status: "connected",
      category: "webhook",
      lastSync: "30 minutes ago"
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 5000+ apps through Zapier automation",
      icon: <Zap size={20} />,
      status: "disconnected",
      category: "automation"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="text-green-500 w-4 h-4" />;
      case 'disconnected': return <XCircle className="text-red-500 w-4 h-4" />;
      case 'pending': return <Clock className="text-yellow-500 w-4 h-4" />;
      default: return <Clock className="text-gray-500 w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'primary';
      case 'api': return 'secondary';
      case 'automation': return 'info';
      case 'webhook': return 'warning';
      default: return 'secondary';
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;

  return (
    <PageContainer title="Integrations" description="Manage integrations">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h5 className="text-xl font-semibold text-white mb-1">
                Integrations
              </h5>
              <p className="text-sm text-gray-300">
                Connect Sakura with contact channels and business tools to enhance your workflow
              </p>
            </div>
            <div className="flex gap-3">
              <Chip 
                label={`${connectedCount}/${totalCount} Connected`} 
                color="success" 
                variant="outlined"
                size="small"
                className="text-xs"
              />
              <Button variant="contained" color="primary" size="small" className="text-sm">
                <Settings size={16} className="mr-2" />
                Manage All
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="text-center p-4">
                <CheckCircle2 className="text-green-500 w-8 h-8 mx-auto mb-2" />
                <h6 className="text-lg font-semibold text-white mb-1">{connectedCount}</h6>
                <p className="text-xs text-gray-300">
                  Connected
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-4">
                <XCircle className="text-red-500 w-8 h-8 mx-auto mb-2" />
                <h6 className="text-lg font-semibold text-white mb-1">
                  {integrations.filter(i => i.status === 'disconnected').length}
                </h6>
                <p className="text-xs text-gray-300">
                  Disconnected
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-4">
                <Clock className="text-yellow-500 w-8 h-8 mx-auto mb-2" />
                <h6 className="text-lg font-semibold text-white mb-1">
                  {integrations.filter(i => i.status === 'pending').length}
                </h6>
                <p className="text-xs text-gray-300">
                  Pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-4">
                <Code className="text-blue-500 w-8 h-8 mx-auto mb-2" />
                <h6 className="text-lg font-semibold text-white mb-1">{totalCount}</h6>
                <p className="text-xs text-gray-300">
                  Total Available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="h-full flex flex-col">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EE66AA] flex items-center justify-center text-white">
                        {integration.icon}
                      </div>
                      <div>
                        <h6 className="text-base font-semibold text-white">{integration.name}</h6>
                        <Chip 
                          label={integration.category} 
                          color={getCategoryColor(integration.category)}
                          size="small"
                          variant="outlined"
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Chip 
                        label={integration.status} 
                        color={getStatusColor(integration.status)}
                        size="small"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <p className="text-sm text-gray-300 mb-3">
                    {integration.description}
                  </p>
                  
                  {integration.lastSync && (
                    <p className="text-xs text-gray-400">
                      Last sync: {integration.lastSync}
                    </p>
                  )}
                  
                  {integration.error && (
                    <p className="text-xs text-red-400 mt-2">
                      Error: {integration.error}
                    </p>
                  )}
                </CardContent>
                <div className="p-3 pt-0">
                  <div className="flex gap-2">
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="small" 
                      disabled={integration.status === 'connected'}
                      className="flex-1 text-xs"
                    >
                      {integration.status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      size="small"
                      disabled={integration.status !== 'connected'}
                      className="text-xs"
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Integration Categories */}
          <div className="mt-6">
            <h5 className="text-lg font-semibold text-white mb-4">
              Integration Categories
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#EE66AA] flex items-center justify-center text-white">
                      <Facebook size={16} />
                    </div>
                    <h6 className="text-base font-semibold text-white">Social Platforms</h6>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-gray-300 mb-3">
                    Connect with popular social media platforms and messaging services
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1">
                      <MessageSquare className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Slack</p>
                        <p className="text-xs text-gray-400">Team communication</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <Users className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Discord</p>
                        <p className="text-xs text-gray-400">Community management</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <MessageSquare className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">WhatsApp</p>
                        <p className="text-xs text-gray-400">Customer support</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      <Code size={16} />
                    </div>
                    <h6 className="text-base font-semibold text-white">API & Automation</h6>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-gray-300 mb-3">
                    Connect with external APIs and automation platforms
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1">
                      <Code className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Custom APIs</p>
                        <p className="text-xs text-gray-400">External service integration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <Webhook className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Webhooks</p>
                        <p className="text-xs text-gray-400">Real-time data sync</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <Zap className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Zapier</p>
                        <p className="text-xs text-gray-400">5000+ app connections</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default IntegrationsPage;
