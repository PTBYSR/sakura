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

// Check if we're in a build environment where React context might not be available
// During Next.js static generation, React context can be null
function isBuildEnvironment(): boolean {
  // Always use providers on client-side
  if (typeof window !== 'undefined') {
    return false;
  }
  
  // On server: check if we're in a build phase
  // Next.js sets NEXT_PHASE during build
  if (typeof process !== 'undefined') {
    // Check for Next.js build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return true;
    }
    // During Vercel build, we're in production but building
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
      // Check if we're actually building (not running)
      // Vercel sets this during build
      return true;
    }
  }
  
  return false;
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
  // During build time (SSG), skip providers to avoid React context errors
  // This prevents the "Cannot read properties of null (reading 'useContext')" error
  // The page will still work - it just won't have MUI theming during build
  if (isBuildEnvironment()) {
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

