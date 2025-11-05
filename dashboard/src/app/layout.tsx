"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import {baseDarkTheme} from "@/utils/theme/DarkTheme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";
import { useMemo } from "react";
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create cache using useMemo to ensure it's stable and available during SSG
  const emotionCache = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createEmotionCache();
    }
    // Return a minimal cache for SSR/SSG
    return createEmotionCache();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body suppressHydrationWarning>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={baseDarkTheme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
