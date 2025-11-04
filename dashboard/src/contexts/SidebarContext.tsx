"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  sidebarWidth: number;
  collapsedSidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return default values if context is not available (fallback)
    return {
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: () => {},
      sidebarWidth: 270,
      collapsedSidebarWidth: 60,
    };
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ 
  children
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarWidth = 270; // Full sidebar width in pixels
  const collapsedSidebarWidth = 60; // Icon bar width in pixels

  return (
    <SidebarContext.Provider
      value={{
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        sidebarWidth,
        collapsedSidebarWidth,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

