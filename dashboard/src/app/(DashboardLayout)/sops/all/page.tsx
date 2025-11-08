"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const AllSOPsPage = () => {
  return (
    <PageContainer title="All SOPs" description="View all Standard Operating Procedures">
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">All SOPs</div>
          <div className="text-sm text-gray-300">This is the All SOPs page at /sops/all</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AllSOPsPage;
