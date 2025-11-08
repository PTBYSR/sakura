import React from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const AddChatbotPanel = () => {
  return (
    <DashboardCard title="Chatbot">
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-[#1f1f1f] rounded-md">
        <PlusCircle className="w-16 h-16 text-[#EE66AA] mb-3" />
        <div className="text-white text-lg font-semibold mb-1">No Chatbot Found</div>
        <div className="text-sm text-gray-300 max-w-[400px] mb-4">
          You don’t have any chatbot set up yet. Create your first chatbot to start engaging with users and managing conversations.
        </div>
        <Button className="inline-flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Add Chatbot
        </Button>
      </div>
    </DashboardCard>
  );
};

export default AddChatbotPanel;
