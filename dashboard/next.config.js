/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure SWC is properly configured
  swcMinify: true,
  // Disable strict mode if causing issues (optional)
  reactStrictMode: true,
};

module.exports = nextConfig;
