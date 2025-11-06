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

// Simple check: skip providers during server-side rendering to avoid React context errors
// This prevents "Cannot read properties of null (reading 'useContext')" during SSG
// Pages will hydrate with full providers on the client-side
function shouldSkipProviders(): boolean {
  // Always use providers on client-side
  if (typeof window !== 'undefined') {
    return false;
  }
  
  // On server (SSR/SSG), skip providers to avoid context errors
  // This is safe because:
  // 1. Pages will still render (just without MUI theming during build)
  // 2. Client-side hydration will add providers and styling
  // 3. Prevents the React context null error during static generation
  return true;
}

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
  // Skip providers during server-side rendering (SSR/SSG) to avoid React context errors
  // This prevents the "Cannot read properties of null (reading 'useContext')" error
  // Pages will hydrate with full providers and styling on the client-side
  if (shouldSkipProviders()) {
    return <>{children}</>;
  }

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

