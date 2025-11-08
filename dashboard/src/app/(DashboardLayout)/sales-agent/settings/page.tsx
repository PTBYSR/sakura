"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SalesAgentSettingsPage = () => {
  return (
    <PageContainer title="Sales Agent Settings" description="Configure sales agent settings">
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">Sales Agent Settings</div>
          <div className="text-sm text-gray-300 mb-4">Configure your Sales Agent&apos;s behavior, responses, and capabilities</div>
          <div className="grid grid-cols-1 gap-3">
            <div></div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SalesAgentSettingsPage;
