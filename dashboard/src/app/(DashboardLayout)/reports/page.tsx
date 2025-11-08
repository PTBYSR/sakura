"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const ReportsPage = () => {
  return (
    <PageContainer title="Reports" description="View analytics and reports">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Reports
          </h1>
          <p className="text-gray-300">
            This is the Reports page at /reports
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportsPage;
