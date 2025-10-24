/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'standalone' for Docker deployment (Tilt/docker-compose)
  // Use 'export' for GitHub Pages static deployment
  output: process.env.GITHUB_ACTIONS ? 'export' : 'standalone',
  // Custom domain (sosquishy.io) serves from root - no basePath needed
  images: {
    unoptimized: process.env.GITHUB_ACTIONS ? true : false,
  },
  async headers() {
    return [
      {
        // Apply CSP headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow scripts from self and analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gc.zgo.at https://goatcounter.com https://baker.goatcounter.com",
              // Allow styles from self and inline
              "style-src 'self' 'unsafe-inline'",
              // Allow images from self and common CDNs
              "img-src 'self' data: blob: https:",
              // Allow fonts from self and data URLs
              "font-src 'self' data:",
              // Allow connections to API and analytics
              "connect-src 'self' https://gc.zgo.at https://goatcounter.com https://baker.goatcounter.com https://api.sosquishy.io http://localhost:8080",
              // Allow frames from self
              "frame-src 'self'",
              // Disallow objects
              "object-src 'none'",
              // Base URI restriction
              "base-uri 'self'",
              // Form action restriction
              "form-action 'self'",
              // Frame ancestors (prevent clickjacking)
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
