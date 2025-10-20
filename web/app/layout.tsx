import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import SupportBanner from "@/components/SupportBanner";

export const metadata: Metadata = {
  title: "Squish - Image Optimizer",
  description: "High-performance image optimization with format conversion, resizing, and quality control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-center items-center">
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </Link>
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
