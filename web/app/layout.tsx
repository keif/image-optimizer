import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import SupportBanner from "@/components/SupportBanner";
import SocialLinks from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Squish - Image Optimizer",
  description: "High-performance image optimization with format conversion, resizing, and quality control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only load Ezoic scripts in production (not localhost)
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="en">
      <head>
        {/* Ezoic Meta Tags - Required for proper integration */}
        {isProduction && (
          <>
            <meta name="ezoic-site-verification" content="sosquishy.io" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            {/* Content Security Policy for Ezoic and Analytics */}
            <meta
              httpEquiv="Content-Security-Policy"
              content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.ezojs.com *.ezoic.net *.gatekeeperconsent.com *.id5-sync.com gc.zgo.at goatcounter.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' *.ezoic.net *.ezojs.com *.gatekeeperconsent.com *.id5-sync.com gc.zgo.at goatcounter.com https://api.sosquishy.io http://localhost:8080; frame-src 'self' *.ezoic.net *.ezojs.com *.gatekeeperconsent.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';"
            />
          </>
        )}
      </head>
      <body className="antialiased">
        {/* Ezoic Privacy Scripts - Only in production */}
        {isProduction && (
          <>
            {/* Consent Management Platform Scripts */}
            <Script
              src="https://cmp.gatekeeperconsent.com/min.js"
              strategy="afterInteractive"
              data-cfasync="false"
            />
            <Script
              src="https://the.gatekeeperconsent.com/cmp.min.js"
              strategy="afterInteractive"
              data-cfasync="false"
            />
            {/* Ezoic Main Script - Standalone ad system */}
            <Script
              src="https://www.ezojs.com/ezoic/sa.min.js"
              strategy="afterInteractive"
              data-cfasync="false"
            />
            {/* Ezoic Initialization */}
            <Script
              id="ezoic-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.ezstandalone = window.ezstandalone || {};
                  ezstandalone.cmd = ezstandalone.cmd || [];
                `
              }}
            />
          </>
        )}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-6">
                  <Link href="/" className="group flex items-center gap-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Squish
                    </h1>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      BETA
                    </span>
                  </Link>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Optimizer
                    </Link>
                    <Link
                      href="/spritesheet"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Spritesheet
                    </Link>
                    <Link
                      href="/articles"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      Articles
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/keif/image-optimizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://buymeacoffee.com/keif"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Links Section */}
                <div className="flex items-center gap-6">
                  <Link
                    href="/learn"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Learn More
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </div>

                {/* Social Media Links */}
                <SocialLinks size={20} variant="footer" />
              </div>
            </div>
          </footer>
          <SupportBanner />
        </div>
        <Script
          id="goatcounter-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.goatcounter = {
                path: function(p) { return 'sosquishy.io' + p }
              };
            `
          }}
        />
        <Script
          data-goatcounter="https://baker.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
