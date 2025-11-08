"use client";
import React from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const KnowledgeBasePage = () => {
  return (
    <PageContainer title="Knowledge Base" description="Manage your knowledge base">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Knowledge Base
          </h1>
          <p className="text-gray-300">
            This is the Knowledge Base page at /knowledge-base
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default KnowledgeBasePage;
