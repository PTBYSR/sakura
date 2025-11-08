"use client";

import * as React from "react";

interface AppRouterCacheProviderProps {
  children: React.ReactNode;
}

export default function AppRouterCacheProvider({ children }: AppRouterCacheProviderProps) {
  return <>{children}</>;
}
