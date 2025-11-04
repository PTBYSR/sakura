"use client";
import { styled, Container, Box, useMediaQuery } from "@mui/material";
import React, { useState, useCallback } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import NewSidebar from "@/app/(DashboardLayout)/layout/sidebar/NewSidebar";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { SOPsProvider } from "@/contexts/SOPsContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";


const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  position: "relative",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}



function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);
  
  return (
    <MainWrapper className="mainwrapper">
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
            <PageWrapper 
              className="page-wrapper"
              sx={{
                marginLeft: lgUp ? (isSidebarCollapsed ? "60px" : "270px") : 0,
                transition: "margin-left 0.3s ease-in-out",
                width: lgUp ? `calc(100% - ${isSidebarCollapsed ? "60px" : "270px"})` : "100%",
              }}
            >
              {/* ------------------------------------------- */}
              {/* Header */}
              {/* ------------------------------------------- */}
              <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
              {/* ------------------------------------------- */}
              {/* PageContent */}
              {/* ------------------------------------------- */}
              <Container
                sx={{
                  paddingTop: "20px",
                  maxWidth: "1200px",
                  position: "relative",
                }}
              >
                {/* ------------------------------------------- */}
                {/* Page Route */}
                {/* ------------------------------------------- */}
                <Box sx={{ minHeight: "calc(100vh - 170px)", position: "relative" }}>{children}</Box>
                {/* ------------------------------------------- */}
                {/* End Page */}
                {/* ------------------------------------------- */}
              </Container>
            </PageWrapper>
    </MainWrapper>
  );
}

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
