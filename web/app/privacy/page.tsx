import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Trash2, Clock, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Privacy Policy - Squish",
  description: "Learn how Squish protects your privacy - no storage, no tracking, images processed in memory only",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4 inline-block"
        >
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your privacy is our top priority. Learn how we handle your images and data.
        </p>
      </div>

      {/* Privacy Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-200">
                No Storage
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Images are processed in memory and never saved to disk
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-200">
                Auto-Deletion
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All data automatically deleted after processing completes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-200">
                No Tracking
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                No personal data collection or third-party tracking
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-200">
                Ephemeral Processing
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Images exist only during the optimization process
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Policy */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            How We Handle Your Images
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Squish is designed with privacy as a core principle. Here&apos;s exactly what
              happens when you use our service:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                <strong>Upload:</strong> Your image is sent directly to our server via an encrypted
                HTTPS connection.
              </li>
              <li>
                <strong>Processing:</strong> The image is loaded into memory and processed using
                libvips, a high-performance image processing library.
              </li>
              <li>
                <strong>Optimization:</strong> Compression, format conversion, and resizing happen
                entirely in memory.
              </li>
              <li>
                <strong>Delivery:</strong> The optimized image is sent back to your browser.
              </li>
              <li>
                <strong>Deletion:</strong> Immediately after delivery, all image data is purged from
                memory.
              </li>
            </ol>
            <p className="font-medium">
              At no point is your image written to disk or stored in any persistent storage.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            What Data We Collect
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We collect minimal data necessary for service operation:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Anonymous Analytics:</strong> Basic page view statistics via GoatCounter
                (privacy-focused analytics) to understand usage patterns. No personal information
                or IP addresses are stored.
              </li>
              <li>
                <strong>Technical Logs:</strong> Temporary server logs for debugging and
                performance monitoring. These contain no personally identifiable information and
                are automatically rotated.
              </li>
            </ul>
            <p className="font-medium">
              We do NOT collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your images or any visual content you upload</li>
              <li>Cookies or browser fingerprints</li>
              <li>Personal information (name, email, etc.)</li>
              <li>IP addresses or location data</li>
              <li>User accounts or authentication data</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Third-Party Services
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>GoatCounter:</strong> Privacy-respecting analytics that doesn&apos;t track
                personal data. Learn more at{' '}
                <a
                  href="https://www.goatcounter.com/help/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  GoatCounter&apos;s privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Render.com:</strong> Our hosting provider. Images are processed in memory
                on Render&apos;s infrastructure and are never persisted.
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Data Security
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              We implement security best practices to protect your data during transmission and
              processing:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All connections use HTTPS encryption (TLS 1.3)</li>
              <li>API rate limiting to prevent abuse</li>
              <li>Domain whitelist for URL-based uploads</li>
              <li>API key authentication for backend access</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Rights
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Since we don&apos;t collect or store personal data or images, there&apos;s nothing to request,
              delete, or modify. You maintain complete control over your images:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Images never leave your device until you explicitly upload them</li>
              <li>You can use the service anonymously without any account</li>
              <li>Downloaded images are yours alone - we retain no copies</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
                Questions or Concerns?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                If you have questions about this privacy policy or how we handle data, please open
                an issue on{' '}
                <a
                  href="https://github.com/keif/image-optimizer/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
