/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure data folder is included in the build
  serverRuntimeConfig: {
    // This ensures server-side code can access the data folder
  },
  // Make sure static files and data are accessible
  publicRuntimeConfig: {},
}

module.exports = nextConfig

