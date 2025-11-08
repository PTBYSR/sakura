"use client";

import { ReactNode, useState, useEffect } from "react";

interface ProvidersProps {
  children: ReactNode;
}

// Optional MUI providers - only render when client-side mounted
// This prevents useContext errors during SSG
export function MUIProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

// Main providers - now just passes through (Tailwind handles styling)
export function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

