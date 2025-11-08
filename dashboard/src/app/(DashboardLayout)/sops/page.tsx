"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SOPsLibraryPage = () => {
  return (
    <PageContainer title="SOPs Library" description="Manage your Standard Operating Procedures">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            SOPs Library
          </h1>
          <p className="text-gray-300">
            This is the SOPs Library page at /sops
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default SOPsLibraryPage;

