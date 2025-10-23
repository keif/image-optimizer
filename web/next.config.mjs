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
              // Allow scripts from self, Ezoic, and analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.ezojs.com *.ezoic.net *.gatekeeperconsent.com *.id5-sync.com gc.zgo.at goatcounter.com",
              // Allow styles from self and inline
              "style-src 'self' 'unsafe-inline'",
              // Allow images from self and common CDNs
              "img-src 'self' data: blob: https:",
              // Allow fonts from self and data URLs
              "font-src 'self' data:",
              // Allow connections to API, Ezoic, and analytics
              "connect-src 'self' *.ezoic.net *.ezojs.com *.gatekeeperconsent.com *.id5-sync.com gc.zgo.at goatcounter.com https://api.sosquishy.io http://localhost:8080",
              // Allow frames from Ezoic
              "frame-src 'self' *.ezoic.net *.ezojs.com *.gatekeeperconsent.com",
              // Allow objects (for ads)
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
  async redirects() {
    // Note: redirects() only works in standalone mode, not in static export
    // For GitHub Pages (static export), use the static ads.txt file instead
    if (process.env.GITHUB_ACTIONS) {
      return [];
    }
    return [
      {
        source: '/ads.txt',
        destination: 'https://srv.adstxtmanager.com/19390/sosquishy.io',
        permanent: true,  // 301 redirect
      },
    ];
  },
};

export default nextConfig;
