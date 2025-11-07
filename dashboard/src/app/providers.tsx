"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode, useState, useEffect } from "react";
import { baseDarkTheme } from "@/utils/theme/DarkTheme";
import AppRouterCacheProvider from "./AppRouterCacheProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSG/build, render children without providers to avoid useContext errors
  if (!mounted) {
    return <>{children}</>;
  }

  // On client, render with providers
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={baseDarkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

