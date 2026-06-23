/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' - API routes need server mode
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
