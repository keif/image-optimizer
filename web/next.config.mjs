/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'standalone' for Docker deployment (Tilt/docker-compose)
  // Use 'export' for GitHub Pages static deployment
  output: process.env.GITHUB_ACTIONS ? 'export' : 'standalone',
  // Custom domain (sosquishy.io) serves from root - no basePath needed
  images: {
    unoptimized: process.env.GITHUB_ACTIONS ? true : false,
  },
};

export default nextConfig;
