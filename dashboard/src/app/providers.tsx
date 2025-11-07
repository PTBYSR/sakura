"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";
import { baseDarkTheme } from "@/utils/theme/DarkTheme";
import AppRouterCacheProvider from "./AppRouterCacheProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Always render providers - pages using this layout are dynamic, so context is available
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={baseDarkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

