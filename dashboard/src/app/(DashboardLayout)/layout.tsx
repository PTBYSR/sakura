"use client";
import React, { useState, useCallback, useEffect } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import NewSidebar from "@/app/(DashboardLayout)/layout/sidebar/NewSidebar";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { SOPsProvider } from "@/contexts/SOPsContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

interface Props {
  children: React.ReactNode;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);
  
  useEffect(() => {
    const checkLgUp = () => {
      setIsLgUp(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkLgUp();
    window.addEventListener('resize', checkLgUp);
    return () => window.removeEventListener('resize', checkLgUp);
  }, []);
  
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);
  
  const sidebarWidth = isSidebarCollapsed ? "60px" : "270px";
  const marginLeft = isLgUp ? sidebarWidth : "0";
  const pageWidth = isLgUp ? `calc(100% - ${sidebarWidth})` : "100%";
  
  return (
    <div className="flex min-h-screen w-full relative">
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      <NewSidebar
        isSidebarOpen={isSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        onSidebarToggle={handleSidebarToggle}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <div 
        className="flex flex-grow flex-col pb-[60px] z-[1] bg-transparent transition-all duration-300 ease-in-out"
        style={{
          marginLeft,
          width: pageWidth,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header toggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        {/* ------------------------------------------- */}
        {/* PageContent */}
        {/* ------------------------------------------- */}
        <div className="pt-5 max-w-[1200px] mx-auto relative w-full px-4">
          {/* ------------------------------------------- */}
          {/* Page Route */}
          {/* ------------------------------------------- */}
          <div className="min-h-[calc(100vh-170px)] relative">{children}</div>
          {/* ------------------------------------------- */}
          {/* End Page */}
          {/* ------------------------------------------- */}
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering for dashboard layout to ensure providers are available
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WebSocketProvider>
      <AgentsProvider>
        <ChatProvider>
          <SOPsProvider>
            <SidebarProvider>
              <LayoutContent>{children}</LayoutContent>
            </SidebarProvider>
          </SOPsProvider>
        </ChatProvider>
      </AgentsProvider>
    </WebSocketProvider>
  );
}
