/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  output: 'standalone',
  eslint: {
    // ⚠️ This disables ESLint during builds
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
   version,
 },
};

module.exports = nextConfig;
