"use client";
import React, { useState } from "react";
import {
  Store,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Edit,
} from "lucide-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

interface BusinessIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected';
  color: string;
}

const BusinessIntegrationsPage = () => {
  const [integrations] = useState<BusinessIntegration[]>([
    {
      id: "shopify",
      name: "Shopify",
      description: "Connect with Shopify store for e-commerce data synchronization",
      icon: <Store size={20} />,
      status: "disconnected",
      color: "#96BF48",
    },
    {
      id: "paystack",
      name: "Paystack",
      description: "Integrate with Paystack for payment processing and transaction management",
      icon: <CreditCard size={20} />,
      status: "disconnected",
      color: "#00C851",
    },
    {
      id: "excel-editor",
      name: "Excel Editor",
      description: "Upload and edit Excel files for data management",
      icon: <FileSpreadsheet size={20} />,
      status: "disconnected",
      color: "#1976d2",
    },
  ]);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="text-green-500 w-4 h-4" />;
      case 'disconnected': return <XCircle className="text-red-500 w-4 h-4" />;
      default: return <Clock className="text-gray-500 w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'success' : 'error';
  };

  const handleConnect = (integrationId: string) => {
    console.log(`Connect ${integrationId}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setExcelFileName(file.name);
    }
  };

  return (
    <PageContainer title="Business Integrations" description="Connect with business tools and services">
      <div className="max-w-4xl mx-auto px-4">
        <div className="py-4">
          {/* Header */}
          <div className="mb-6">
            <h5 className="text-xl font-semibold text-white mb-1">
              Business Integrations
            </h5>
            <p className="text-sm text-gray-300">
              Connect Sakura with your business tools
            </p>
          </div>

          {/* Integration Cards */}
          <div className="flex flex-col gap-3">
            {/* Shopify Integration */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: integrations[0].color }}>
                      {integrations[0].icon}
                    </div>
                    <div>
                      <h6 className="text-base font-semibold text-white">
                        {integrations[0].name}
                      </h6>
                      <p className="text-sm text-gray-300">
                        {integrations[0].description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integrations[0].status)}
                    <Chip
                      label={integrations[0].status}
                      color={getStatusColor(integrations[0].status)}
                      size="small"
                      className="text-xs"
                    />
                    <Button
                      variant={integrations[0].status === 'connected' ? 'outlined' : 'contained'}
                      color="primary"
                      size="small"
                      onClick={() => handleConnect(integrations[0].id)}
                      className="text-sm"
                    >
                      {integrations[0].status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paystack Integration */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: integrations[1].color }}>
                      {integrations[1].icon}
                    </div>
                    <div>
                      <h6 className="text-base font-semibold text-white">
                        {integrations[1].name}
                      </h6>
                      <p className="text-sm text-gray-300">
                        {integrations[1].description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integrations[1].status)}
                    <Chip
                      label={integrations[1].status}
                      color={getStatusColor(integrations[1].status)}
                      size="small"
                      className="text-xs"
                    />
                    <Button
                      variant={integrations[1].status === 'connected' ? 'outlined' : 'contained'}
                      color="primary"
                      size="small"
                      onClick={() => handleConnect(integrations[1].id)}
                      className="text-sm"
                    >
                      {integrations[1].status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Excel Editor */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: integrations[2].color }}>
                    {integrations[2].icon}
                  </div>
                  <div className="flex-1">
                    <h6 className="text-base font-semibold text-white">
                      {integrations[2].name}
                    </h6>
                    <p className="text-sm text-gray-300">
                      {integrations[2].description}
                    </p>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="mt-4">
                  <input
                    accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    id="excel-file-upload"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="excel-file-upload">
                    <span className="inline-block">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        className="text-sm mb-3"
                      >
                        <Upload size={16} className="mr-2" />
                        Upload Excel File
                      </Button>
                    </span>
                  </label>
                  {excelFileName && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-300">
                        Selected: {excelFileName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Edit Section */}
                {excelFile && (
                  <div className="mt-4">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      className="text-sm"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Excel File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default BusinessIntegrationsPage;
