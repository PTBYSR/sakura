"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  RefreshCw,
  Database,
  Gauge,
  Shield,
  Edit,
  Save,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface CRMIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  color: string;
  lastSync: string;
  recordsSynced: number;
  syncFrequency: string;
  features: string[];
  category: 'ecommerce' | 'automation' | 'crm' | 'api';
}

const CRMsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [integrationConfig, setIntegrationConfig] = useState({
    apiKey: '',
    endpoint: '',
    syncFrequency: '15min',
    autoSync: true,
    dataMapping: 'default'
  });

  const [integrations, setIntegrations] = useState<CRMIntegration[]>([
    {
      id: "shopify",
      name: "Shopify",
      description: "Connect with Shopify store for e-commerce data synchronization",
      icon: <TrendingUp size={20} />,
      status: "connected",
      color: "#96BF48",
      lastSync: "2 minutes ago",
      recordsSynced: 1247,
      syncFrequency: "Every 15 minutes",
      features: ["Product sync", "Order management", "Customer data", "Inventory tracking"],
      category: "ecommerce"
    },
    {
      id: "paystack",
      name: "Paystack",
      description: "Integrate with Paystack for payment processing and transaction management",
      icon: <TrendingUp size={20} />,
      status: "connected",
      color: "#00C851",
      lastSync: "1 minute ago",
      recordsSynced: 892,
      syncFrequency: "Real-time",
      features: ["Payment processing", "Transaction tracking", "Customer billing", "Refund management"],
      category: "ecommerce"
    },
    {
      id: "zendesk",
      name: "Zendesk",
      description: "Connect Zendesk for customer support ticket management and analytics",
      icon: <TrendingUp size={20} />,
      status: "disconnected",
      color: "#17494D",
      lastSync: "Never",
      recordsSynced: 0,
      syncFrequency: "Every hour",
      features: ["Ticket management", "Customer support", "Analytics", "Multi-channel support"],
      category: "crm"
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="text-green-500 w-4 h-4" />;
      case 'disconnected': return <XCircle className="text-red-500 w-4 h-4" />;
      case 'pending': return <Clock className="text-yellow-500 w-4 h-4" />;
      case 'error': return <XCircle className="text-red-500 w-4 h-4" />;
      default: return <Clock className="text-gray-500 w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'error';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ecommerce': return 'primary';
      case 'automation': return 'secondary';
      case 'crm': return 'info';
      case 'api': return 'warning';
      default: return 'secondary';
    }
  };

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'connected' as const, lastSync: 'Just now' }
        : i
    ));
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'disconnected' as const, recordsSynced: 0 }
        : i
    ));
  };

  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const totalRecords = integrations.reduce((sum, i) => sum + i.recordsSynced, 0);
  const errorIntegrations = integrations.filter(i => i.status === 'error').length;

  return (
    <PageContainer title="CRMs" description="Manage CRM and business integrations">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-2">
                CRM & Business Integrations
              </h4>
              <p className="text-gray-300">
                Connect Sakura with CRMs, e-commerce platforms, and business tools
              </p>
            </div>
            <div className="flex gap-3">
              <Chip 
                label={`${connectedIntegrations}/${integrations.length} Connected`} 
                color="success" 
                variant="outlined"
              />
              <Button variant="contained" color="primary">
                <RefreshCw size={16} className="mr-2" />
                Sync All
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="text-center py-6">
                <Database className="text-[#EE66AA] w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{connectedIntegrations}</h6>
                <p className="text-sm text-gray-300">
                  Active Integrations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <RefreshCw className="text-green-500 w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{totalRecords.toLocaleString()}</h6>
                <p className="text-sm text-gray-300">
                  Records Synced
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <Gauge className="text-blue-500 w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">
                  {integrations.filter(i => i.syncFrequency === 'Real-time').length}
                </h6>
                <p className="text-sm text-gray-300">
                  Real-time Sync
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <XCircle className="text-red-500 w-10 h-10 mx-auto mb-2" />
                <h6 className="text-xl font-semibold text-white">{errorIntegrations}</h6>
                <p className="text-sm text-gray-300">
                  Sync Errors
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {integrations.map((integration) => (
              <Card key={integration.id} className="h-full flex flex-col">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: integration.color }}>
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
                  <p className="text-sm text-gray-300 mb-4">
                    {integration.description}
                  </p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Sync Status</p>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-white">
                        {integration.recordsSynced.toLocaleString()} records
                      </p>
                      <p className="text-sm text-white">
                        {integration.syncFrequency}
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          integration.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: integration.status === 'connected' ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 2).map((feature, index) => (
                        <Chip 
                          key={index}
                          label={feature} 
                          size="small" 
                          variant="outlined"
                          className="text-xs"
                        />
                      ))}
                      {integration.features.length > 2 && (
                        <Chip 
                          label={`+${integration.features.length - 2} more`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                          className="text-xs"
                        />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Last sync: {integration.lastSync}
                  </p>
                </CardContent>
                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    <Button 
                      variant={integration.status === 'connected' ? 'outlined' : 'contained'}
                      color="primary"
                      size="small" 
                      className="flex-1 text-sm"
                      onClick={() => integration.status === 'connected' ? handleDisconnect(integration.id) : handleConnect(integration.id)}
                    >
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="small"
                      disabled={integration.status !== 'connected'}
                      className="text-sm"
                    >
                      <Settings size={16} className="mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Integration Categories */}
          <div className="mt-8">
            <h5 className="text-xl font-semibold text-white mb-4">
              Integration Categories
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#EE66AA] flex items-center justify-center text-white">
                      <TrendingUp size={16} />
                    </div>
                    <h6 className="text-base font-semibold text-white">E-commerce Platforms</h6>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-gray-300 mb-3">
                    Connect with e-commerce platforms for product and order management
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1">
                      <TrendingUp className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Shopify</p>
                        <p className="text-xs text-gray-400">E-commerce platform</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <TrendingUp className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Paystack</p>
                        <p className="text-xs text-gray-400">Payment processing</p>
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
                    <h6 className="text-base font-semibold text-white">CRM & Automation</h6>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-gray-300 mb-3">
                    Integrate with CRM systems and automation platforms
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1">
                      <TrendingUp className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-white">Zendesk</p>
                        <p className="text-xs text-gray-400">Customer support platform</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sync Performance */}
          <div className="mt-8">
            <h5 className="text-xl font-semibold text-white mb-4">
              Sync Performance
            </h5>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h6 className="text-2xl font-semibold text-green-500 mb-1">98.5%</h6>
                    <p className="text-sm text-gray-300">
                      Success Rate
                    </p>
                  </div>
                  <div className="text-center">
                    <h6 className="text-2xl font-semibold text-[#EE66AA] mb-1">2.3s</h6>
                    <p className="text-sm text-gray-300">
                      Avg Sync Time
                    </p>
                  </div>
                  <div className="text-center">
                    <h6 className="text-2xl font-semibold text-blue-500 mb-1">24/7</h6>
                    <p className="text-sm text-gray-300">
                      Monitoring
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CRMsPage;
