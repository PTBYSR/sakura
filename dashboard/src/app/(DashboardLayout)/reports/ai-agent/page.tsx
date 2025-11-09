"use client";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";

const AIAgentReportsPage = () => {
  return (
    <PageContainer title="AI Agent Reports" description="Detailed analytics for AI agents">
      <div className="max-w-4xl mx-auto px-4">
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">AI Agent Reports</h2>
          <p className="text-sm text-gray-300">
            Detailed reporting for AI agents will be available soon. Stay tuned!
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default AIAgentReportsPage;
