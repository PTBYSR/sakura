"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const SOPsEditorPage = () => {
  return (
    <PageContainer title="SOPs Editor" description="Create and edit Standard Operating Procedures">
      <div className="max-w-5xl mx-auto py-6">
        <div className="py-4">
          <div className="text-2xl font-semibold text-white mb-2">SOPs Editor</div>
          <div className="text-sm text-gray-300">This is the SOPs Editor page at /sops/sops-editor</div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SOPsEditorPage;
