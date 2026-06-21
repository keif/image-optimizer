/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'standalone' for Docker deployment (Tilt/docker-compose)
  // Use 'export' for GitHub Pages static deployment and standalone binary
  output: (process.env.GITHUB_ACTIONS || process.env.NEXT_PUBLIC_API_URL === '') ? 'export' : 'standalone',
  // Custom domain (sosquishy.io) serves from root - no basePath needed
  images: {
    unoptimized: (process.env.GITHUB_ACTIONS || process.env.NEXT_PUBLIC_API_URL === '') ? true : false,
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
              // Allow scripts from self, analytics, and Google AdSense (loader + creatives + tag services + SODAR fraud-detection script)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gc.zgo.at https://goatcounter.com https://baker.goatcounter.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.googletagservices.com https://*.googleadservices.com https://adservice.google.com https://*.adtrafficquality.google",
              // Allow styles from self and inline
              "style-src 'self' 'unsafe-inline'",
              // Allow images from self and common CDNs (https: catch-all covers AdSense image creatives)
              "img-src 'self' data: blob: https:",
              // Allow fonts from self and data URLs
              "font-src 'self' data:",
              // Allow connections to API, analytics, and AdSense telemetry.
              // adtrafficquality.google is AdSense's SODAR anti-fraud reporting
              // endpoint — required for ad serving.
              "connect-src 'self' https://gc.zgo.at https://goatcounter.com https://baker.goatcounter.com https://api.sosquishy.io http://localhost:8080 https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://adservice.google.com https://*.googleadservices.com https://*.adtrafficquality.google",
              // Allow frames from self and AdSense ad iframes (creatives render in
              // iframes from doubleclick + googlesyndication; SODAR uses a hidden
              // iframe for fraud detection and nests a www.google.com iframe inside
              // it for identity / fingerprinting).
              "frame-src 'self' https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://www.google.com",
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
