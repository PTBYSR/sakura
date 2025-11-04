"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import {baseDarkTheme} from "@/utils/theme/DarkTheme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";
import { useState } from "react";
import './global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create cache once and reuse it to prevent hydration mismatches
  const [emotionCache] = useState(() => createEmotionCache());

  return (
    <html lang="en" suppressHydrationWarning>
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
