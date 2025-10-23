import Link from "next/link";
import { Metadata } from "next";

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

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Introduction</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Image optimization isn’t a one-time fix—it’s an ongoing process that spans everything from choosing the right format and compression to delivery and monitoring. This checklist walks you through practical best practices for every step, from creating images to long-term site maintenance.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use this guide to build a solid image optimization workflow. You’ll cut page weight by 60–80%, boost Core Web Vitals, and deliver a faster, smoother experience for every user, on any device or connection.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 1: Image Creation and Preparation</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Start with the Right Source</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Begin with the highest quality source</strong>—you can always compress later, but lost quality can’t be restored.
          </li>
          <li>
            <strong>Capture photos in RAW</strong> when possible for more editing flexibility.
          </li>
          <li>
            <strong>Design graphics as vectors (SVG)</strong> whenever you can—they scale cleanly and keep file sizes small.
          </li>
          <li>
            <strong>Keep your asset library organized</strong> by storing originals separately from optimized versions.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Choose the Right Dimensions</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Only upload images at their display size</strong>—for example, don’t upload a 2000px image for a 400px-wide thumbnail.
          </li>
          <li>
            <strong>Support retina screens</strong> by providing 1.5x or 2x versions for high-DPI devices.
          </li>
          <li>
            <strong>Export images at multiple sizes</strong> for responsive layouts: thumbnail (150–300px), small (400–600px), medium (800–1000px), large (1200–1600px), xlarge (1920–2400px).
          </li>
          <li>
            <strong>Crop images thoughtfully</strong> so the most important content is visible at every size.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Optimize Before Uploading</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Strip unnecessary metadata</strong> such as EXIF, camera info, and GPS coordinates (unless you need them).
          </li>
          <li>
            <strong>Crop images closely</strong> to remove empty space and focus on the subject.
          </li>
          <li>
            <strong>Convert to sRGB color profile</strong> for web, unless you require a wider gamut.
          </li>
          <li>
            <strong>Sharpen images lightly</strong>—over-sharpening introduces artifacts and hurts compression.
          </li>
        </ul>

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 2: Format Selection</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Choose the Right Format for Each Image Type</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Photographs:</strong> Choose JPEG, WebP (lossy), or AVIF.
          </li>
          <li>
            <strong>Graphics with few colors:</strong> Choose PNG-8 or WebP (lossless).
          </li>
          <li>
            <strong>Graphics with many colors:</strong> Choose PNG-24 or WebP (lossless).
          </li>
          <li>
            <strong>Logos and icons:</strong> Use SVG whenever possible, or fallback to PNG.
          </li>
          <li>
            <strong>Images with transparency:</strong> Choose PNG or WebP with alpha channel.
          </li>
          <li>
            <strong>Simple animations:</strong> Use MP4/WebM video or WebP animation (avoid GIF).
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Implement Modern Format Delivery</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Serve AVIF</strong> to browsers that support it (Chrome, Edge, Opera, Firefox).
          </li>
          <li>
            <strong>Serve WebP</strong> for most users (over 95% browser support).
          </li>
          <li>
            <strong>Offer JPEG/PNG as fallbacks</strong> for older browsers.
          </li>
          <li>
            <strong>Use the <code>picture</code> element</strong> to deliver the best format based on browser support.
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
            <strong>Set JPEG quality to 80–85</strong> for most photos.
          </li>
          <li>
            <strong>Use JPEG quality 85–90</strong> for hero or product images.
          </li>
          <li>
            <strong>Lower JPEG quality to 70–75</strong> for thumbnails and backgrounds.
          </li>
          <li>
            <strong>Use lossless compression</strong> for logos, screenshots, and graphics.
          </li>
          <li>
            <strong>Always export JPEGs only once</strong>—repeated saves degrade quality.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Use Advanced Compression Tools</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>MozJPEG</strong> for JPEGs—usually gets 5–10% smaller files than standard encoders.
          </li>
          <li>
            <strong>oxipng or pngquant</strong> for PNGs—often shrinks files by 30–70%.
          </li>
          <li>
            <strong>cwebp</strong> for WebP—Google’s encoder with flexible quality settings.
          </li>
          <li>
            <strong>avifenc</strong> for AVIF—encoding can be slow but is ideal for key images.
          </li>
          <li>
            <strong>SVGO</strong> for SVG—removes extra code and optimizes paths.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Automate Optimization</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Add optimization to your build pipeline</strong> so images are processed automatically.
          </li>
          <li>
            <strong>Leverage image CDNs</strong> like Cloudinary or Cloudflare Images for on-the-fly optimization.
          </li>
          <li>
            <strong>Set up CI/CD checks</strong> to block oversized images from being deployed.
          </li>
          <li>
            <strong>Create presets for each image type</strong> (hero, product, thumbnail) with the right settings.
          </li>
        </ul>

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 4: Responsive Images</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Implement srcset for Different Screen Sizes</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Export several sizes for each image</strong> (at least 400px, 800px, 1200px, 1600px, 2000px).
          </li>
          <li>
            <strong>Use the <code>srcset</code> attribute</strong> so browsers pick the best size automatically.
          </li>
          <li>
            <strong>Add the <code>sizes</code> attribute</strong> to help browsers choose more efficiently.
          </li>
          <li>
            <strong>Offer 1x and 2x versions</strong> for retina and high-DPI screens.
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
            <strong>Provide different crops for different screens</strong> using the <code>picture</code> element.
          </li>
          <li>
            <strong>Show portrait crops on mobile</strong> and landscape crops on desktop.
          </li>
          <li>
            <strong>Highlight key content at each size</strong> (for example, zoom in on faces for mobile).
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
            <strong>Use native lazy loading</strong> (<code>loading="lazy"</code>) for all images below the fold.
          </li>
          <li>
            <strong>Don’t lazy load above-the-fold images</strong>—especially your LCP (Largest Contentful Paint) image.
          </li>
          <li>
            <strong>Set <code>loading="eager"</code></strong> for critical images to prioritize them.
          </li>
          <li>
            <strong>Try IntersectionObserver</strong> if you want more control over lazy loading.
          </li>
          <li>
            <strong>Show placeholders or skeletons</strong> while lazy images load.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Prioritize Critical Images</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Preload your LCP image</strong> so it starts loading right away.
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<link rel="preload" as="image" href="hero.jpg">`}</code>
        </pre>

        <ul className="mt-4">
          <li>
            <strong>Add <code>fetchpriority="high"</code></strong> to important images.
          </li>
          <li>
            <strong>Don’t hide above-the-fold images</strong> with CSS or JavaScript at first load.
          </li>
          <li>
            <strong>Place critical image tags early in your HTML</strong> for faster discovery.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Prevent Layout Shifts</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Always set width and height attributes</strong> on <code>img</code> tags.
          </li>
          <li>
            <strong>Use CSS <code>aspect-ratio</code></strong> to keep image proportions with responsive layouts.
          </li>
          <li>
            <strong>Reserve space for images</strong> before they load, to avoid shifting content.
          </li>
          <li>
            <strong>Don’t add images dynamically</strong> unless you’ve reserved space for them.
          </li>
        </ul>

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 6: Delivery and Caching</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Use a CDN</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Serve images from a CDN</strong> to lower latency for users worldwide.
          </li>
          <li>
            <strong>Pick a CDN with image optimization features</strong>—automatic resizing and format conversion saves time.
          </li>
          <li>
            <strong>Enable HTTP/2 or HTTP/3</strong> for faster loading of many images.
          </li>
          <li>
            <strong>Consider a separate domain for images</strong> to avoid sending cookies.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Set Optimal Cache Headers</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Cache images for one year</strong>: <code>Cache-Control: public, max-age=31536000, immutable</code>.
          </li>
          <li>
            <strong>Add the <code>immutable</code> directive</strong> to avoid unnecessary revalidation.
          </li>
          <li>
            <strong>Use version numbers or hashes</strong> in filenames for easy cache busting.
          </li>
          <li>
            <strong>Keep image URLs consistent</strong> to maximize browser caching.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Enable Compression</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Enable Brotli compression</strong> for HTML, CSS, and JS (not for images—they’re already compressed).
          </li>
          <li>
            <strong>Don’t re-compress images</strong> with gzip or Brotli—it wastes CPU and doesn’t help.
          </li>
          <li>
            <strong>Serve pre-compressed assets</strong> when you can to lighten server load.
          </li>
        </ul>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 7: Accessibility and SEO</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Provide Descriptive Alt Text</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Write clear, meaningful alt text</strong> that describes the image and its context.
          </li>
          <li>
            <strong>Keep alt text short</strong> (under 125 characters for screen readers).
          </li>
          <li>
            <strong>Use empty <code>alt=""</code></strong> for purely decorative images.
          </li>
          <li>
            <strong>Avoid starting with "image of"</strong>—screen readers already announce images.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Optimize for SEO</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Use descriptive filenames</strong> (e.g., <code>red-running-shoes.jpg</code> instead of <code>IMG_1234.jpg</code>).
          </li>
          <li>
            <strong>Add structured data</strong> (schema.org) for product images.
          </li>
          <li>
            <strong>Create an image sitemap</strong> to help search engines find your images.
          </li>
          <li>
            <strong>Include descriptive text around images</strong> to give search engines more context.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Support Dark Mode</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Offer dark mode versions</strong> for images with light backgrounds.
          </li>
          <li>
            <strong>Use the <code>picture</code> element</strong> with <code>prefers-color-scheme</code> to switch images automatically.
          </li>
        </ul>

        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`<picture>
  <source srcset="logo-dark.png" media="(prefers-color-scheme: dark)">
  <img src="logo-light.png" alt="Company logo">
</picture>`}</code>
        </pre>

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 8: Monitoring and Maintenance</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Monitor Performance Metrics</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Track Core Web Vitals</strong> using Google Search Console and real user monitoring tools.
          </li>
          <li>
            <strong>Keep LCP (Largest Contentful Paint)</strong> under 2.5 seconds.
          </li>
          <li>
            <strong>Keep CLS (Cumulative Layout Shift)</strong> under 0.1.
          </li>
          <li>
            <strong>Measure total page weight</strong> and see how much is from images.
          </li>
          <li>
            <strong>Set up alerts</strong> if pages exceed your weight targets.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Regular Audits</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Run monthly audits</strong> with Google PageSpeed Insights.
          </li>
          <li>
            <strong>Look for unoptimized images</strong> in your CMS or upload folders.
          </li>
          <li>
            <strong>Spot opportunities to upgrade formats</strong> (like converting old JPEGs to WebP).
          </li>
          <li>
            <strong>Check new content</strong> for compliance with your optimization guidelines.
          </li>
          <li>
            <strong>Test on real devices and networks</strong> regularly.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">✓ Continuous Improvement</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Keep up with new formats</strong> and techniques (like AVIF, JPEG XL).
          </li>
          <li>
            <strong>Try new optimization tools</strong> as they’re released.
          </li>
          <li>
            <strong>Experiment with quality settings</strong> and monitor the results.
          </li>
          <li>
            <strong>Run A/B tests on image optimization</strong> to see real business impact.
          </li>
        </ul>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Phase 9: Common Pitfalls to Avoid</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">⚠️ Don't Make These Mistakes</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>❌ Using PNG for photographs</strong> → Choose JPEG, WebP, or AVIF instead.
          </li>
          <li>
            <strong>❌ Using JPEG for logos/graphics</strong> → Choose PNG, SVG, or WebP lossless.
          </li>
          <li>
            <strong>❌ Scaling images with CSS/HTML</strong> → Resize images to match their display size.
          </li>
          <li>
            <strong>❌ Lazy loading above-the-fold images</strong> → Never lazy load your LCP image.
          </li>
          <li>
            <strong>❌ Omitting width/height attributes</strong> → Always specify dimensions to prevent layout shifts.
          </li>
          <li>
            <strong>❌ Over-compressing product images</strong> → Quality below 75 can hurt conversions.
          </li>
          <li>
            <strong>❌ Serving only modern formats</strong> → Always provide fallbacks for older browsers.
          </li>
          <li>
            <strong>❌ Not testing on mobile</strong> → With 60%+ of traffic on mobile, always test there first.
          </li>
          <li>
            <strong>❌ Skipping accessibility</strong> → Alt text is essential, not optional.
          </li>
          <li>
            <strong>❌ Using GIF for animations</strong> → Use MP4/WebM video or WebP animation instead.
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
          Image optimization is an ongoing journey. By applying these best practices—from the moment you create an image to delivery and regular monitoring—you’ll keep your site fast, user-friendly, and cost-effective.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Start with the basics: compression, lazy loading, and using the correct dimensions. Then layer on modern formats, responsive images, and automation. Each improvement adds up, and even small tweaks across many images can make a big difference in performance.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Optimizing images pays off in better Core Web Vitals, improved SEO, faster load times, and higher conversions. Invest the time—it's one of the best returns you'll see for your website.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sources and References</h2>
        <div className="not-prose">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This checklist references industry best practices and authoritative guidelines:
            </p>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>Google Developers (2024).</strong> "Core Web Vitals." Official documentation for LCP, CLS, and INP optimization.{" "}
                <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  web.dev/articles/vitals
                </a>
              </li>
              <li>
                <strong>MDN Web Docs (2024).</strong> "Responsive images." Technical guide for srcset and picture element implementation.{" "}
                <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  developer.mozilla.org
                </a>
              </li>
              <li>
                <strong>HTTP Archive (2024).</strong> "Page Weight Report." Statistics on image contribution to page weight.{" "}
                <a href="https://almanac.httparchive.org/en/2024/page-weight" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  almanac.httparchive.org
                </a>
              </li>
              <li>
                <strong>Mozilla ImageOptim (2024).</strong> "MozJPEG." Open-source JPEG encoder achieving 5-10% better compression.{" "}
                <a href="https://github.com/mozilla/mozjpeg" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  github.com/mozilla/mozjpeg
                </a>
              </li>
              <li>
                <strong>Cloudinary (2024).</strong> "Image Optimization Best Practices." Comprehensive industry guide to image optimization techniques.{" "}
                <a href="https://cloudinary.com/blog/image-optimization" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  cloudinary.com
                </a>
              </li>
              <li>
                <strong>Can I Use (2024).</strong> Browser support data for modern image formats and loading attributes.{" "}
                <a href="https://caniuse.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  caniuse.com
                </a>
              </li>
            </ol>
          </div>
        </div>

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
