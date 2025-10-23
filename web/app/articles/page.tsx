import Link from "next/link";
import { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import { Zap, TrendingUp, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Image Optimization Articles - Tips, Guides & Best Practices",
  description: "Learn about image optimization, compression techniques, format selection, and web performance. Expert guides to help you master image optimization.",
};

const articles = [
  {
    slug: "what-are-sprite-sheets",
    title: "What Are Sprite Sheets? Complete Guide for Web & Game Developers",
    excerpt: "Discover how sprite sheets revolutionize both web performance and game development, from reducing HTTP requests to enabling smooth character animations.",
    date: "2024-10-22",
    readTime: "9 min read",
    category: "Sprite Sheets"
  },
  {
    slug: "sprite-sheets-vs-individual-images",
    title: "Sprite Sheets vs Individual Images: Performance Analysis",
    excerpt: "Data-driven comparison of sprite sheets versus individual images for web apps and games. Includes HTTP/2 benchmarks and memory analysis.",
    date: "2024-10-22",
    readTime: "11 min read",
    category: "Performance"
  },
  {
    slug: "sprite-sheet-optimization",
    title: "Sprite Sheet Optimization Best Practices",
    excerpt: "Master sprite sheet optimization with packing algorithms, format selection, compression techniques, and workflow automation.",
    date: "2024-10-22",
    readTime: "10 min read",
    category: "Optimization"
  },
  {
    slug: "image-formats-explained",
    title: "Image Formats Explained: JPEG, PNG, WebP, AVIF",
    excerpt: "A comprehensive guide to understanding different image formats, their strengths, weaknesses, and when to use each one for optimal results.",
    date: "2024-10-22",
    readTime: "8 min read",
    category: "Formats"
  },
  {
    slug: "web-performance-guide",
    title: "How Image Optimization Improves Website Performance",
    excerpt: "Discover how properly optimized images can dramatically improve your website's loading speed, user experience, and search engine rankings.",
    date: "2024-10-22",
    readTime: "10 min read",
    category: "Performance"
  },
  {
    slug: "compression-guide",
    title: "Understanding Lossy vs Lossless Compression",
    excerpt: "Learn the difference between lossy and lossless compression, how they work, and which compression method is right for your images.",
    date: "2024-10-22",
    readTime: "7 min read",
    category: "Compression"
  },
  {
    slug: "best-practices",
    title: "Image Optimization Best Practices: Complete Checklist",
    excerpt: "A practical checklist covering everything from format selection to responsive images, CDNs, and lazy loading for maximum performance.",
    date: "2024-10-22",
    readTime: "12 min read",
    category: "Best Practices"
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Image & Sprite Sheet Optimization Articles
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Expert guides for web developers and game developers. Learn image optimization,
          sprite sheets, compression techniques, and performance best practices.
        </p>
      </div>

      {/* Top Banner Ad */}
      <div className="mb-12">
        <AdBanner placeholderId={103} variant="banner" />
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {articles.map((post) => (
          <Link
            key={post.slug}
            href={`/articles/${post.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                  Read more →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Why Image Optimization Matters Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-12 border border-blue-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Why Image Optimization Matters
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Faster Load Times
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Optimized images can reduce page load times by 50-70%, dramatically improving user experience.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Better SEO
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Google prioritizes fast-loading sites. Optimized images directly improve your search rankings.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Lower Costs
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Smaller images mean less bandwidth usage, reducing hosting and CDN costs significantly.
            </p>
          </div>
        </div>
      </div>

      {/* Middle Banner Ad */}
      <div className="mb-12">
        <AdBanner placeholderId={104} variant="banner" />
      </div>

      {/* Getting Started Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Getting Started with Image Optimization
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Image optimization is crucial for modern web development. Images typically account for
            50-70% of a webpage's total size, making them the single largest contributor to page
            weight and load times.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Quick Wins
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Choose the right format for each image type</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Compress images before uploading to your site</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Resize images to match their display dimensions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Use modern formats like WebP and AVIF when possible</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Advanced Techniques
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Implement responsive images with srcset</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Use lazy loading for off-screen images</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Leverage CDN and caching strategies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Automate optimization in your build pipeline</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Optimize Your Images?
        </h2>
        <p className="text-xl mb-6 text-purple-100">
          Use our free image optimizer to compress and convert your images in seconds
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Try Image Optimizer
        </Link>
      </div>
    </div>
  );
}
