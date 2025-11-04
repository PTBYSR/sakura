"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import NewSidebar from "@/app/(DashboardLayout)/layout/sidebar/NewSidebar";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { SOPsProvider } from "@/contexts/SOPsContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";


const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
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



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <WebSocketProvider>
      <AgentsProvider>
        <ChatProvider>
          <SOPsProvider>
            <MainWrapper className="mainwrapper">
            {/* ------------------------------------------- */}
            {/* Sidebar */}
            {/* ------------------------------------------- */}
            <NewSidebar
              isSidebarOpen={isSidebarOpen}
              isMobileSidebarOpen={isMobileSidebarOpen}
              onSidebarClose={() => setMobileSidebarOpen(false)}
            />
            {/* ------------------------------------------- */}
            {/* Main Wrapper */}
            {/* ------------------------------------------- */}
            <PageWrapper className="page-wrapper">
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
                }}
              >
                {/* ------------------------------------------- */}
                {/* Page Route */}
                {/* ------------------------------------------- */}
                <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
                {/* ------------------------------------------- */}
                {/* End Page */}
                {/* ------------------------------------------- */}
              </Container>
            </PageWrapper>
          </MainWrapper>
        </SOPsProvider>
      </ChatProvider>
    </AgentsProvider>
    </WebSocketProvider>
  );
}
