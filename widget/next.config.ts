import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the output file tracing root to avoid workspace detection issues
  outputFileTracingRoot: process.cwd(),
  // Disable React strict mode to avoid double rendering issues
  reactStrictMode: false,
  // Optimize for client-side rendering
  experimental: {
    // Disable server components for widget (it's all client-side)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
