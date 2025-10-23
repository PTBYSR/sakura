import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the output file tracing root to avoid workspace detection issues
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
