/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Custom domain (sosquishy.io) serves from root - no basePath needed
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
