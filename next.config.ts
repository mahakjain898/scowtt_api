/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // This disables build failures from ESLint
  },
};

module.exports = nextConfig;
