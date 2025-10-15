/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Custom domain (squish.baker.is) serves from root - no basePath needed
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
