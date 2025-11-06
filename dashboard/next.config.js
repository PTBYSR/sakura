/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip static generation for error pages
  generateBuildId: async () => {
    // Use a stable build ID to prevent unnecessary rebuilds
    return process.env.BUILD_ID || 'build-' + Date.now();
  },
  // Disable static optimization for error/not-found pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
