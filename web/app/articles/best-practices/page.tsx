import Link from "next/link";
import { Metadata } from "next";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Image Optimization Best Practices: Complete Checklist 2024",
  description: "Master image optimization with our comprehensive checklist covering format selection, compression, responsive images, lazy loading, CDN setup, and performance monitoring.",
};

export default function BestPracticesGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-8">
        <Link href="/articles" className="text-purple-600 dark:text-purple-400 hover:underline">
          ← Back to Articles
        </Link>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-12 not-prose">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              Best Practices
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">12 min read</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Image Optimization Best Practices: Complete Checklist
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            A practical, comprehensive checklist covering everything from format selection to
            responsive images, CDNs, and lazy loading for maximum web performance.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Published on October 22, 2024
          </div>
        </header>

        <div className="not-prose mb-12">
          <AdBanner placeholderId={120} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Introduction</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Image optimization is not a single action—it's a comprehensive strategy covering
          format selection, compression, delivery, and monitoring. This complete checklist
          provides actionable best practices for every stage of the image optimization process,
          from initial creation to ongoing maintenance.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Follow this guide to implement a robust image optimization strategy that reduces page
          weight by 60-80%, improves Core Web Vitals, and enhances user experience across all
          devices and network conditions.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 1: Image Creation and Preparation</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Start with the Right Source</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Use the highest quality source available</strong> as your starting point—you
            can always compress down, but you can't add quality back
          </li>
          <li>
            <strong>Shoot photos in RAW format</strong> when possible for maximum editing flexibility
          </li>
          <li>
            <strong>Create graphics as vectors</strong> (SVG) whenever feasible—they scale
            perfectly and have tiny file sizes
          </li>
          <li>
            <strong>Maintain an organized asset library</strong> with original, uncompressed
            versions separate from web-optimized versions
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Choose the Right Dimensions</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Never upload images larger than their display size</strong>—a 400px wide
            thumbnail should not be a 2000px image scaled down with CSS
          </li>
          <li>
            <strong>Account for retina displays</strong> by providing 1.5x or 2x resolution
            versions for high-DPI screens
          </li>
          <li>
            <strong>Create multiple sizes for responsive images:</strong> thumbnail (150-300px),
            small (400-600px), medium (800-1000px), large (1200-1600px), xlarge (1920-2400px)
          </li>
          <li>
            <strong>Crop strategically</strong> to show the most important part of the image at
            each size
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Optimize Before Uploading</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Remove unnecessary metadata</strong> like EXIF data, camera settings, and GPS
            coordinates (unless needed)
          </li>
          <li>
            <strong>Crop tightly</strong> to remove unnecessary background or empty space
          </li>
          <li>
            <strong>Adjust color profiles</strong>—convert to sRGB for web use unless you
            specifically need wide color gamut
          </li>
          <li>
            <strong>Apply sharpening carefully</strong>—over-sharpened images compress poorly and
            show artifacts more easily
          </li>
        </ul>

        <div className="not-prose my-12">
          <AdBanner placeholderId={121} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 2: Format Selection</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Choose the Right Format for Each Image Type</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Photographs:</strong> Use JPEG, WebP (lossy), or AVIF
          </li>
          <li>
            <strong>Graphics with few colors:</strong> Use PNG-8 or WebP (lossless)
          </li>
          <li>
            <strong>Graphics with many colors:</strong> Use PNG-24 or WebP (lossless)
          </li>
          <li>
            <strong>Logos and icons:</strong> Use SVG when possible, otherwise PNG
          </li>
          <li>
            <strong>Images with transparency:</strong> Use PNG or WebP with alpha channel
          </li>
          <li>
            <strong>Simple animations:</strong> Use MP4/WebM video, or WebP animation (avoid GIF)
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Implement Modern Format Delivery</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Serve AVIF to supporting browsers</strong> (Chrome, Edge, Opera, Firefox)
          </li>
          <li>
            <strong>Serve WebP to supporting browsers</strong> (95%+ of users)
          </li>
          <li>
            <strong>Provide JPEG/PNG fallbacks</strong> for older browsers
          </li>
          <li>
            <strong>Use the picture element</strong> for format-based selection
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero image" width="1200" height="600">
</picture>`}</code>
        </pre>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 3: Compression and Optimization</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Apply Appropriate Compression</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>JPEG quality 80-85</strong> for most photographs
          </li>
          <li>
            <strong>JPEG quality 85-90</strong> for hero images and product photos
          </li>
          <li>
            <strong>JPEG quality 70-75</strong> for thumbnails and background images
          </li>
          <li>
            <strong>Use lossless compression</strong> for logos, screenshots, and graphics
          </li>
          <li>
            <strong>Never save JPEG multiple times</strong>—quality degrades with each save
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Use Advanced Compression Tools</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>MozJPEG</strong> for JPEGs—achieves 5-10% better compression than standard
            encoders
          </li>
          <li>
            <strong>oxipng or pngquant</strong> for PNGs—can reduce file size by 30-70%
          </li>
          <li>
            <strong>cwebp</strong> for WebP—Google's official encoder with excellent quality
            tuning
          </li>
          <li>
            <strong>avifenc</strong> for AVIF—though encoding is slow, results are worth it for
            critical images
          </li>
          <li>
            <strong>SVGO</strong> for SVG—removes unnecessary code and optimizes paths
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Automate Optimization</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Integrate optimization into your build pipeline</strong> so images are
            automatically processed
          </li>
          <li>
            <strong>Use image CDNs</strong> like Cloudinary or Cloudflare Images for automatic
            optimization
          </li>
          <li>
            <strong>Set up CI/CD checks</strong> to prevent oversized images from being deployed
          </li>
          <li>
            <strong>Create presets for different image types</strong> (hero, product, thumbnail)
            with appropriate settings
          </li>
        </ul>

        <div className="not-prose my-12">
          <AdBanner placeholderId={122} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 4: Responsive Images</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Implement srcset for Different Screen Sizes</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Generate multiple sizes</strong> for each image (at minimum: 400px, 800px,
            1200px, 1600px, 2000px)
          </li>
          <li>
            <strong>Use srcset attribute</strong> to let browsers choose the appropriate size
          </li>
          <li>
            <strong>Include sizes attribute</strong> to help browsers make better decisions
          </li>
          <li>
            <strong>Provide 1x and 2x versions</strong> for retina displays
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<img
  srcset="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w,
    image-1600.jpg 1600w
  "
  sizes="
    (max-width: 400px) 100vw,
    (max-width: 800px) 90vw,
    (max-width: 1200px) 80vw,
    1200px
  "
  src="image-800.jpg"
  alt="Responsive image"
  width="800"
  height="600"
>`}</code>
        </pre>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Use Art Direction When Needed</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Create different crops</strong> for different screen sizes using picture element
          </li>
          <li>
            <strong>Show portrait crops on mobile</strong>, landscape on desktop
          </li>
          <li>
            <strong>Emphasize different subjects</strong> at different sizes (e.g., zoom in on
            faces for mobile)
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<picture>
  <source media="(max-width: 600px)" srcset="hero-mobile.jpg">
  <source media="(max-width: 1200px)" srcset="hero-tablet.jpg">
  <img src="hero-desktop.jpg" alt="Hero image" width="1200" height="600">
</picture>`}</code>
        </pre>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 5: Loading Strategies</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Implement Lazy Loading</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Use native lazy loading</strong> for all below-the-fold images: <code>loading="lazy"</code>
          </li>
          <li>
            <strong>Never lazy load above-the-fold images</strong>—especially your LCP element
          </li>
          <li>
            <strong>Set loading="eager"</strong> explicitly for critical images to ensure priority
          </li>
          <li>
            <strong>Consider IntersectionObserver</strong> for more control over lazy loading behavior
          </li>
          <li>
            <strong>Provide placeholder images</strong> or skeleton screens while lazy images load
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Prioritize Critical Images</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Preload your LCP image</strong> to ensure it starts loading immediately
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<link rel="preload" as="image" href="hero.jpg">`}</code>
        </pre>

        <ul className="mt-4">
          <li>
            <strong>Use fetchpriority="high"</strong> on critical images
          </li>
          <li>
            <strong>Avoid hiding above-the-fold images</strong> with CSS or JavaScript initially
          </li>
          <li>
            <strong>Place critical image tags early in HTML</strong> so the parser discovers them
            quickly
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Prevent Layout Shifts</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Always include width and height attributes</strong> on img elements
          </li>
          <li>
            <strong>Use aspect-ratio CSS</strong> for maintaining proportions with responsive sizing
          </li>
          <li>
            <strong>Reserve space for images</strong> even before they load
          </li>
          <li>
            <strong>Avoid adding images dynamically</strong> without reserved space
          </li>
        </ul>

        <div className="not-prose my-12">
          <AdBanner placeholderId={123} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 6: Delivery and Caching</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Use a CDN</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Serve images from a CDN</strong> to reduce latency for global users
          </li>
          <li>
            <strong>Choose an image-optimized CDN</strong> that can automatically resize and
            convert formats
          </li>
          <li>
            <strong>Enable HTTP/2 or HTTP/3</strong> for better performance with multiple image
            requests
          </li>
          <li>
            <strong>Use a separate domain for images</strong> to enable cookie-less requests
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Set Optimal Cache Headers</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Cache images for 1 year</strong>: <code>Cache-Control: public, max-age=31536000, immutable</code>
          </li>
          <li>
            <strong>Use immutable directive</strong> to prevent revalidation requests
          </li>
          <li>
            <strong>Include version numbers or hashes</strong> in filenames for cache busting
          </li>
          <li>
            <strong>Leverage browser caching</strong> by serving the same URLs consistently
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Enable Compression</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Enable Brotli compression</strong> for HTML/CSS/JS (not images—they're
            already compressed)
          </li>
          <li>
            <strong>Don't re-compress images</strong> with gzip or Brotli—it increases CPU usage
            without benefits
          </li>
          <li>
            <strong>Serve pre-compressed assets</strong> when possible to reduce server CPU load
          </li>
        </ul>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 7: Accessibility and SEO</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Provide Descriptive Alt Text</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Write meaningful alt text</strong> that describes the image content and context
          </li>
          <li>
            <strong>Keep alt text concise</strong> (under 125 characters for screen readers)
          </li>
          <li>
            <strong>Use empty alt=""</strong> for purely decorative images
          </li>
          <li>
            <strong>Don't start with "image of"</strong>—screen readers already announce it's an
            image
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Optimize for SEO</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Use descriptive filenames</strong> (red-running-shoes.jpg, not IMG_1234.jpg)
          </li>
          <li>
            <strong>Add structured data</strong> for product images using schema.org markup
          </li>
          <li>
            <strong>Create an image sitemap</strong> to help search engines discover your images
          </li>
          <li>
            <strong>Use descriptive page context</strong> around images to help search engines
            understand them
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Support Dark Mode</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Provide dark mode alternatives</strong> for images with light backgrounds
          </li>
          <li>
            <strong>Use the picture element</strong> with prefers-color-scheme media query
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<picture>
  <source srcset="logo-dark.png" media="(prefers-color-scheme: dark)">
  <img src="logo-light.png" alt="Company logo">
</picture>`}</code>
        </pre>

        <div className="not-prose my-12">
          <AdBanner placeholderId={124} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 8: Monitoring and Maintenance</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Monitor Performance Metrics</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Track Core Web Vitals</strong> in Google Search Console and real user
            monitoring tools
          </li>
          <li>
            <strong>Monitor LCP</strong>—your Largest Contentful Paint should be under 2.5 seconds
          </li>
          <li>
            <strong>Track CLS</strong>—Cumulative Layout Shift should be under 0.1
          </li>
          <li>
            <strong>Measure total page weight</strong> and track image contribution
          </li>
          <li>
            <strong>Set up alerts</strong> for pages exceeding weight thresholds
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Regular Audits</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Run monthly performance audits</strong> with Google PageSpeed Insights
          </li>
          <li>
            <strong>Check for unoptimized images</strong> in your CMS or upload directories
          </li>
          <li>
            <strong>Identify format upgrade opportunities</strong> (old JPEGs that could be WebP)
          </li>
          <li>
            <strong>Review new content</strong> to ensure it follows optimization guidelines
          </li>
          <li>
            <strong>Test on real devices</strong> and network conditions periodically
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Continuous Improvement</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Stay updated on new formats</strong> and techniques (AVIF, JPEG XL)
          </li>
          <li>
            <strong>Test new optimization tools</strong> as they become available
          </li>
          <li>
            <strong>Experiment with different quality settings</strong> and measure impact
          </li>
          <li>
            <strong>A/B test image optimization</strong> to measure business impact
          </li>
        </ul>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 9: Common Pitfalls to Avoid</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">⚠️ Don't Make These Mistakes</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>❌ Using PNG for photographs</strong> → Use JPEG, WebP, or AVIF instead
          </li>
          <li>
            <strong>❌ Using JPEG for logos/graphics</strong> → Use PNG, SVG, or WebP lossless
          </li>
          <li>
            <strong>❌ Scaling images with CSS/HTML</strong> → Resize images to their display size
          </li>
          <li>
            <strong>❌ Lazy loading above-the-fold images</strong> → Never lazy load your LCP element
          </li>
          <li>
            <strong>❌ Omitting width/height attributes</strong> → Always specify dimensions to
            prevent CLS
          </li>
          <li>
            <strong>❌ Over-compressing product images</strong> → Quality below 75 hurts conversions
          </li>
          <li>
            <strong>❌ Serving only modern formats</strong> → Always provide fallbacks
          </li>
          <li>
            <strong>❌ Not testing on mobile</strong> → 60%+ of traffic is mobile, test there first
          </li>
          <li>
            <strong>❌ Forgetting about accessibility</strong> → Alt text is required, not optional
          </li>
          <li>
            <strong>❌ Using GIF for animations</strong> → Use MP4/WebM video or WebP animation
          </li>
        </ul>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Quick Reference Checklist</h2>

        <div className="not-prose my-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Essential Image Optimization Checklist
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Format Selection</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>☐ Choose appropriate format for content type</li>
                <li>☐ Serve WebP/AVIF with JPEG/PNG fallbacks</li>
                <li>☐ Use SVG for logos and icons when possible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Compression</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>☐ JPEG quality 80-85 for most photos</li>
                <li>☐ Use advanced tools (MozJPEG, oxipng)</li>
                <li>☐ Remove unnecessary metadata</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sizing & Delivery</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>☐ Resize images to display dimensions</li>
                <li>☐ Implement srcset for responsive images</li>
                <li>☐ Serve images from CDN</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Loading Strategy</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>☐ Lazy load below-the-fold images</li>
                <li>☐ Preload LCP image</li>
                <li>☐ Include width/height to prevent CLS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accessibility & SEO</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>☐ Add descriptive alt text</li>
                <li>☐ Use meaningful filenames</li>
                <li>☐ Set proper cache headers (1 year)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Monitoring</h4>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>☐ Track Core Web Vitals</li>
                <li>☐ Monitor page weight and image contribution</li>
                <li>☐ Run regular performance audits</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Conclusion</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Image optimization is a continuous process, not a one-time task. By following these
          best practices—from initial creation through delivery and ongoing monitoring—you can
          maintain a fast, efficient website that provides excellent user experience while
          minimizing bandwidth costs.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Start with the quick wins: compression, lazy loading, and proper dimensions. Then
          progressively implement modern formats, responsive images, and advanced optimization
          techniques. Every improvement compounds, and even small optimizations across many
          images can dramatically impact your website's overall performance.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Remember that image optimization directly affects your bottom line through improved
          Core Web Vitals, better SEO rankings, faster load times, and higher conversion rates.
          The time invested in proper image optimization consistently delivers exceptional ROI.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={125} variant="banner" />
        </div>

        <div className="not-prose mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Start Optimizing Your Images Today
          </h3>
          <p className="text-lg mb-6 text-purple-100">
            Use our free tool to automatically apply these best practices to your images
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Try Image Optimizer
          </Link>
        </div>

        <div className="not-prose mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Related Articles
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/articles/image-formats-explained"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Image Formats Explained: JPEG, PNG, WebP, AVIF & GIF →
              </Link>
            </li>
            <li>
              <Link
                href="/articles/web-performance-guide"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                How Image Optimization Improves Website Performance →
              </Link>
            </li>
            <li>
              <Link
                href="/articles/compression-guide"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Understanding Lossy vs Lossless Compression →
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </div>
  );
}
