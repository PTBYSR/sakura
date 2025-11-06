"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";
import { baseDarkTheme } from "@/utils/theme/DarkTheme";
import { ReactNode } from "react";

// Create a singleton cache instance that's safe for SSR/SSG
// This ensures the cache is created once and reused across renders
let clientSideEmotionCache: ReturnType<typeof createEmotionCache> | null = null;
let serverSideEmotionCache: ReturnType<typeof createEmotionCache> | null = null;

function getEmotionCache() {
  if (typeof window === 'undefined') {
    // Server-side: create a singleton cache for SSG/SSR
    if (!serverSideEmotionCache) {
      serverSideEmotionCache = createEmotionCache();
    }
    return serverSideEmotionCache;
  }
  
  // Client-side: reuse singleton cache
  if (!clientSideEmotionCache) {
    clientSideEmotionCache = createEmotionCache();
  }
  return clientSideEmotionCache;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Get or create the emotion cache
  const emotionCache = getEmotionCache();

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={baseDarkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

