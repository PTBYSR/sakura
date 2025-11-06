/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip static generation for 404 page to avoid context issues
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Disable static optimization for error pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
