import Link from "next/link";
import { Metadata } from "next";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "How Image Optimization Improves Website Performance - Complete Guide",
  description: "Learn how image optimization dramatically improves website loading speed, Core Web Vitals, SEO rankings, and user experience. Includes real performance metrics and case studies.",
};

export default function WebPerformanceGuide() {
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
              Performance
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">10 min read</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How Image Optimization Improves Website Performance
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover how properly optimized images can dramatically improve your website's loading
            speed, user experience, and search engine rankings with measurable performance gains.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Published on October 22, 2024
          </div>
        </header>

        <div className="not-prose mb-12">
          <AdBanner placeholderId={110} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">The Image Performance Problem</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Images are the single largest contributor to page weight on the modern web. According
          to HTTP Archive data, images account for an average of 50-70% of the total bytes
          downloaded when loading a typical webpage. This means that image optimization is not
          just an enhancement—it's a necessity for any performant website.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          When users visit your site, their browser must download, decode, and render every image
          before displaying it. Large, unoptimized images can delay this process significantly,
          creating a poor user experience that affects everything from bounce rates to conversion
          rates to search engine rankings.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Key Performance Metrics Affected by Images</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Understanding how images impact specific performance metrics helps you prioritize
          optimization efforts and measure improvements effectively.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Largest Contentful Paint (LCP)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          LCP measures how long it takes for the largest visible content element to appear on
          screen. For most websites, this element is a hero image or banner. Google considers
          LCP under 2.5 seconds as "good" performance, but unoptimized images can push this
          metric well beyond 4-5 seconds.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Optimizing your LCP image alone can improve this metric by 40-60%. Using modern
          formats like WebP or AVIF, serving appropriately sized images, and implementing
          preloading strategies can dramatically reduce LCP times.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Cumulative Layout Shift (CLS)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          CLS measures visual stability—how much content shifts around as the page loads. Images
          without specified dimensions cause layout shifts when they finally load, as the browser
          suddenly needs to make space for them. This creates a jarring user experience and
          hurts your CLS score.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Always specify width and height attributes on image elements, even when using CSS to
          style them. Modern browsers use these attributes to calculate aspect ratios and
          reserve space, preventing layout shifts.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Time to Interactive (TTI)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          TTI measures how long it takes before a page becomes fully interactive. While images
          don't execute JavaScript, large images can delay the entire loading process, keeping
          your site unresponsive longer. Additionally, image decoding on the main thread can
          block JavaScript execution, further delaying interactivity.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Total Page Size and Load Time</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The most straightforward metric: smaller images mean less data to download and faster
          page loads. A typical product page might contain 2-3 MB of images, which takes 3-5
          seconds to download on a moderate 3G connection. Optimizing those images to 500-800 KB
          can reduce load time to under 1 second.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={111} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Real-World Performance Impact</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Let's examine actual data showing how image optimization affects business metrics:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Conversion Rates</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Studies consistently show that page speed directly affects conversion rates. According
          to research from Google and various e-commerce platforms:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>Every 1-second delay in mobile load times can impact conversion rates by up to 20%</li>
          <li>A 0.1-second improvement in site speed can increase conversions by 8-10% for retail sites</li>
          <li>Bounce rates increase by 32% when page load time goes from 1 to 3 seconds</li>
        </ul>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          For an e-commerce site generating $100,000 per day, a 1-second improvement in load
          time (achievable through image optimization alone) could translate to $7,000+ in
          additional daily revenue.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">SEO and Search Rankings</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Google uses page speed as a ranking factor, particularly for mobile searches. The
          Core Web Vitals (LCP, FID, CLS) are now explicitly part of Google's ranking algorithm.
          Websites with poor Core Web Vitals can see their search rankings drop, while optimized
          sites gain an advantage.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          A case study from Vodafone showed that improving page load time by 31% (largely through
          image optimization) resulted in 8% more sales and an 11% increase in page views. The
          improvements also led to better search rankings across key product categories.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">User Engagement</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Faster sites see better engagement metrics across the board:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>Pages that load in 2 seconds have an average bounce rate of 9%</li>
          <li>At 5 seconds, bounce rate increases to 38%</li>
          <li>At 10 seconds, bounce rate jumps to 61%</li>
        </ul>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The BBC found that they lost an additional 10% of users for every additional second
          their site took to load. Since images were the primary cause of slow load times,
          aggressive image optimization became a top priority.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Image Optimization Techniques and Their Impact</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Different optimization techniques provide different levels of performance improvement.
          Here's what you can expect from each approach:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">1. Choosing the Right Format (25-50% size reduction)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Converting images from JPEG/PNG to modern formats like WebP or AVIF provides immediate
          file size reductions with no quality loss. WebP typically reduces file size by 25-35%
          compared to JPEG, while AVIF can achieve 40-50% reductions.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          <strong>Performance impact:</strong> For a page with 2 MB of images, format conversion
          alone can save 500-1000 KB, reducing load time by 1-2 seconds on 3G connections.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">2. Proper Compression (30-60% size reduction)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Many images are exported at unnecessarily high quality settings. Reducing JPEG quality
          from 95 to 80 typically results in minimal visible quality loss but 40-50% smaller
          files. For PNG images, tools like oxipng can achieve 15-40% size reductions through
          better compression.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          <strong>Performance impact:</strong> A hero image that's 800 KB at quality 95 might
          be only 400 KB at quality 80, saving critical bytes for your LCP metric.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">3. Responsive Images (40-70% size reduction for mobile)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Serving appropriately sized images for each device prevents mobile users from
          downloading desktop-sized images they can't fully display. A 2000×1200px image that's
          perfect for desktop might only need to be 800×480px on mobile—a 75% reduction in pixels
          and typically 50-60% reduction in file size.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          <strong>Performance impact:</strong> Mobile users (often on slower connections) see
          the biggest benefits, with load time improvements of 2-4 seconds on product pages.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={112} variant="banner" />
        </div>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">4. Lazy Loading (Immediate perceived performance improvement)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Lazy loading defers loading of below-the-fold images until users scroll near them. This
          reduces initial page weight and prioritizes above-the-fold content, dramatically
          improving perceived performance and actual Time to Interactive.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          <strong>Performance impact:</strong> Pages with 20-30 images might only need to load
          3-5 initially, reducing initial page weight by 70-80% and improving TTI by 2-3 seconds.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">5. CDN and Caching (50-90% faster delivery)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Serving images from a CDN with proper caching headers can reduce delivery time by
          50-90% for repeat visitors and users geographically far from your origin server. Image
          CDNs like Cloudflare Images or Cloudinary can also perform automatic optimization and
          format selection.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          <strong>Performance impact:</strong> First-time visitors see 30-50% improvement,
          repeat visitors see 80-90% improvement as images load from cache instantly.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Implementing an Image Optimization Strategy</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Here's a practical, prioritized approach to implementing image optimization across
          your website:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Phase 1: Quick Wins (Implement in 1-2 hours)</h3>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Add width and height attributes to all images</strong> to prevent CLS
          </li>
          <li>
            <strong>Enable lazy loading</strong> with the <code>loading="lazy"</code> attribute
          </li>
          <li>
            <strong>Compress existing images</strong> using tools like Squish Image Optimizer
          </li>
          <li>
            <strong>Set proper cache headers</strong> for image assets (1 year expiration)
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Phase 2: Format Modernization (Implement in 1 day)</h3>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Convert images to WebP</strong> and serve with JPEG/PNG fallbacks
          </li>
          <li>
            <strong>Implement the picture element</strong> for format-based delivery
          </li>
          <li>
            <strong>Set up automated conversion</strong> in your build process or CMS
          </li>
          <li>
            <strong>Test browser support</strong> and fallback behavior
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Phase 3: Responsive Images (Implement in 2-3 days)</h3>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Audit image sizes</strong> across different device breakpoints
          </li>
          <li>
            <strong>Generate multiple sizes</strong> for each image (thumbnail, small, medium, large, xlarge)
          </li>
          <li>
            <strong>Implement srcset and sizes</strong> attributes for responsive delivery
          </li>
          <li>
            <strong>Test on real devices</strong> to verify appropriate images are served
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Phase 4: Advanced Optimization (Ongoing)</h3>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Experiment with AVIF</strong> for high-value images
          </li>
          <li>
            <strong>Implement image CDN</strong> for automatic optimization and transformation
          </li>
          <li>
            <strong>Set up performance monitoring</strong> to track image impact on Core Web Vitals
          </li>
          <li>
            <strong>Continuously optimize</strong> new images as they're added
          </li>
        </ol>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Measuring Image Optimization Success</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          To verify that your image optimization efforts are working, track these metrics before
          and after implementation:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Technical Metrics</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Total page weight:</strong> Aim for 50-60% reduction in image bytes
          </li>
          <li>
            <strong>LCP time:</strong> Target under 2.5 seconds
          </li>
          <li>
            <strong>CLS score:</strong> Target under 0.1
          </li>
          <li>
            <strong>Speed Index:</strong> Measure how quickly page content is visually populated
          </li>
          <li>
            <strong>Image requests:</strong> Count of images loaded initially vs. with lazy loading
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Business Metrics</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Bounce rate:</strong> Should decrease as pages load faster
          </li>
          <li>
            <strong>Time on site:</strong> Should increase with better user experience
          </li>
          <li>
            <strong>Pages per session:</strong> Users browse more when pages load quickly
          </li>
          <li>
            <strong>Conversion rate:</strong> Direct correlation with page speed improvements
          </li>
          <li>
            <strong>Search rankings:</strong> Track keyword positions before/after optimization
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Tools for Measurement</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>
            <strong>Google PageSpeed Insights:</strong> Tests real-world and lab performance,
            provides Core Web Vitals data
          </li>
          <li>
            <strong>WebPageTest:</strong> Detailed waterfall charts showing exactly when each
            image loads
          </li>
          <li>
            <strong>Chrome DevTools:</strong> Network panel for analyzing image sizes and load
            times
          </li>
          <li>
            <strong>Google Search Console:</strong> Core Web Vitals report showing real user
            measurements
          </li>
          <li>
            <strong>Google Analytics:</strong> Track bounce rate and engagement metrics
          </li>
        </ul>

        <div className="not-prose my-12">
          <AdBanner placeholderId={113} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Common Image Performance Mistakes to Avoid</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Even well-intentioned optimization efforts can backfire if not implemented correctly.
          Here are the most common mistakes:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">1. Over-Compression</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          While compression is important, going too aggressive can harm user experience. JPEG
          quality below 60 typically shows visible artifacts, and overly compressed product
          images can hurt e-commerce conversion rates. Find the balance between file size and
          acceptable quality for your use case.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">2. Serving Only Modern Formats Without Fallbacks</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP and AVIF offer great compression, but serving them without JPEG/PNG fallbacks
          means users on older browsers see broken images. Always implement proper fallback
          strategies using the picture element or server-side detection.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">3. Lazy Loading Above-the-Fold Images</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Lazy loading is great for below-the-fold content, but applying it to hero images or
          other above-the-fold content delays LCP and creates a poor initial experience. Never
          lazy load your LCP element.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">4. Missing Width and Height Attributes</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Even if you use CSS to size images, omitting HTML width and height attributes prevents
          browsers from calculating aspect ratios, causing CLS. Always include these attributes.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">5. Not Testing on Real Devices and Networks</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Your fast development machine on a fiber connection doesn't represent your users'
          experience. Test on real mobile devices over 3G connections to understand actual
          performance.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">The Business Case for Image Optimization</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Let's put concrete numbers to the business value of image optimization. Consider a
          medium-sized e-commerce site:
        </p>

        <div className="not-prose my-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Example Business Impact Calculation
          </h4>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>Current metrics:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• 100,000 monthly visitors</li>
                <li>• 2% conversion rate (2,000 conversions)</li>
                <li>• $50 average order value ($100,000 revenue)</li>
                <li>• 4.5-second average load time</li>
              </ul>
            </div>
            <div>
              <strong>After image optimization:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• 2.0-second average load time (55% improvement)</li>
                <li>• 2.3% conversion rate (15% increase)</li>
                <li>• 2,300 conversions</li>
                <li>• $115,000 revenue (+$15,000 monthly)</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-blue-300 dark:border-blue-700">
              <strong className="text-base">Annual additional revenue: $180,000</strong>
            </div>
          </div>
        </div>

        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The time investment for comprehensive image optimization (roughly 40-60 hours for a
          medium-sized site) provides an exceptional return on investment, often paying for
          itself within the first month through improved conversion rates alone.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Conclusion</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Image optimization is one of the highest-impact performance improvements you can make
          to your website. With images comprising 50-70% of page weight, optimizing them directly
          translates to faster load times, better Core Web Vitals, improved search rankings, and
          higher conversion rates.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The combination of choosing appropriate formats, applying proper compression, implementing
          responsive images, and using lazy loading can reduce image-related page weight by
          60-80% while maintaining visual quality. These improvements directly impact your bottom
          line through better user engagement and higher conversion rates.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Start with quick wins like compression and lazy loading, then progressively implement
          modern formats and responsive images. Measure your results continuously and refine
          your approach based on real performance data. The investment in image optimization
          consistently delivers some of the best ROI in web development.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={114} variant="banner" />
        </div>

        <div className="not-prose mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Start Optimizing Your Images Today
          </h3>
          <p className="text-lg mb-6 text-purple-100">
            Use our free tool to compress and convert your images to modern formats
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
                href="/articles/compression-guide"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Understanding Lossy vs Lossless Compression →
              </Link>
            </li>
            <li>
              <Link
                href="/articles/best-practices"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Image Optimization Best Practices: Complete Checklist →
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </div>
  );
}
