"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SalesAgentPerformancePage = () => {
  return (
    <PageContainer title="Sales Agent Performance" description="View sales agent performance metrics">
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">Sales Agent Performance</div>
          <div className="text-sm text-gray-300">This is the Sales Agent Performance page at /sales-agent/performance</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SalesAgentPerformancePage;
