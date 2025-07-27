/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
