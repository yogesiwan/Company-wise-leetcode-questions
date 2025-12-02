const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CRITICAL for Vercel: Include data folder in serverless function output
  // This ensures the data folder is available in Vercel's serverless functions
  experimental: {
    outputFileTracingIncludes: {
      '/api/**': [
        './data/**/*',
      ],
    },
  },
}

module.exports = nextConfig

