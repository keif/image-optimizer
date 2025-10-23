import Link from "next/link";
import { Metadata } from "next";

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
            A longform feature on why making your images lighter and smarter is the single best thing you can do for web performance.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Published on October 22, 2024
          </div>
        </header>

        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Every second counts online. Images are beautiful, but they’re also the number one reason your website feels slow. The good news? You can fix that — often in a single afternoon.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          This is your complete guide to mastering image optimization — with real metrics, actionable techniques, and proof that small changes can lead to massive performance gains.
        </p>

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">The Image Performance Problem</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Let’s set the stage: you spend hours crafting the perfect visuals, but those same images could be quietly sabotaging your site’s speed and your users’ patience.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The numbers don’t lie. Images are the single largest contributor to page weight on the modern web. According to HTTP Archive data, images account for an average of 50-70% of the total bytes downloaded when loading a typical webpage. In other words, if you want a fast website, image optimization isn’t a “nice-to-have”—it’s the main event.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Here’s why that matters more than you might think. Every time someone visits your site, their browser must download, decode, and render every image before anything meaningful appears. Large, unoptimized images drag this process out, leading to higher bounce rates, lower conversions, and even weaker search rankings. It’s a snowball effect—one that starts with your hero banner and ends with lost revenue.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">How Images Impact Core Performance Metrics</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          If you care about speed, SEO, or user experience, you need to know how images shape the numbers that matter. Let’s break it down.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Largest Contentful Paint (LCP)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          LCP measures how long it takes for the largest visible content element to appear on screen. For most websites, that’s a big, beautiful hero image or banner. Google considers LCP under 2.5 seconds as “good”—but a single bloated image can push you into the 4-5 second danger zone.
        </p>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          Pro Tip: Optimizing your LCP image alone can cut perceived load times in half.
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Using modern formats like WebP or AVIF, serving images at the right size, and preloading your LCP image can dramatically reduce LCP times—often by 40-60%.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Cumulative Layout Shift (CLS)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Ever notice content jumping around as a page loads? That’s CLS, and images are often to blame. When you skip width and height attributes, the browser doesn’t know how much space to reserve—so everything shifts when the image finally appears.
        </p>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          Always set width and height on your images. It’s the quickest fix for layout jank.
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Even if you use CSS for sizing, those HTML attributes help browsers keep everything stable and polished.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Time to Interactive (TTI)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          TTI is about how quickly your site feels usable. While images don’t run scripts, large ones hog browser resources, sometimes blocking the main thread and delaying interactivity. A heavy image can keep your site feeling stuck just when your user wants to click.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Total Page Size and Load Time</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          This one’s simple: smaller images mean less to download, so your site loads faster. A typical product page might have 2-3 MB of images—enough to stall a moderate 3G connection for 3-5 seconds. Trim that to 500-800 KB, and you’re looking at sub-second load times. That’s the difference between a user who stays and one who bounces.
        </p>

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">The Real Business Impact of Faster Images</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Let’s move beyond theory. What does image optimization mean for your bottom line? The data is striking—and the stakes are real.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Conversion Rates</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Speed sells. Studies consistently show that faster pages translate directly into more conversions. According to research from Google and major e-commerce platforms:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>Every 1-second delay in mobile load times can impact conversion rates by up to 20%.</li>
          <li>A 0.1-second improvement in site speed can increase conversions by 8-10% for retail sites.</li>
          <li>Bounce rates increase by 32% when load time goes from 1 to 3 seconds.</li>
        </ul>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          For an e-commerce site making $100,000 a day, a 1-second speed boost (often achievable just by optimizing images) could mean $7,000+ more revenue every single day.
        </blockquote>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">SEO and Search Rankings</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Google isn’t subtle about it: slow sites fall in the rankings, especially on mobile. Core Web Vitals (LCP, FID, CLS) are part of the algorithm. If your images drag down those scores, you’re handing your competitors an edge.
        </p>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          Vodafone improved load time by 31%—mostly by optimizing images—and saw 8% more sales, 11% more page views, and higher rankings across key categories.
        </blockquote>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">User Engagement</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Want users to stick around? Make it fast. The connection is direct:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>Pages that load in 2 seconds see just 9% bounce. At 5 seconds, that jumps to 38%. By 10 seconds, you’ve lost 61% of visitors.</li>
        </ul>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          The BBC found they lost 10% of users for every extra second of load time. Images were the main culprit—so they made optimization a top priority.
        </blockquote>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">The Techniques That Actually Move the Needle</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Not all optimization is created equal. Some tweaks barely move the dial, while others can transform your site overnight. Here’s what really works—and by how much.
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
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Building Your Optimization Strategy</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Ready to turn theory into action? Here’s a step-by-step plan to overhaul your images—starting with the fastest wins.
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
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">How to Measure the Wins</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Don’t just optimize and hope for the best. Here’s how to know you’re making a real difference—on both the technical and business sides.
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

        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Avoid These Optimization Pitfalls</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Optimization isn’t just about doing more—it’s about doing it right. Here’s where even the pros sometimes slip up.
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
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Why Optimization Pays for Itself</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Wondering if the effort is worth it? Let’s run the numbers on a typical e-commerce site. The payoff is hard to ignore.
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
          The time investment for a full image optimization sweep (about 40-60 hours for a medium-sized site) routinely pays for itself in the first month—sometimes in the first week. The ROI is real, and it’s fast.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Conclusion</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          So where does this all leave us? Image optimization isn’t just a technical fix—it’s a competitive advantage hiding in plain sight. With images making up so much of your site’s weight, every byte you save is a direct investment in speed, SEO, and user happiness.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The best part: you don’t have to choose between beauty and speed. With smart formats, real compression, responsive techniques, and lazy loading, you can cut image weight by up to 80%—all while keeping your visuals crisp and compelling.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Start with the low-hanging fruit: compress, lazy load, and set your dimensions. Then, modernize your formats and roll out responsive images. Keep measuring, keep refining. The results will speak for themselves.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Optimizing images isn’t just about speed — it’s about respect for your users’ time. Every millisecond saved builds trust, satisfaction, and retention. That’s what real performance looks like.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sources and References</h2>
        <div className="not-prose">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This article references the following authoritative sources and research studies:
            </p>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>HTTP Archive (2024).</strong> "Page Weight Report." Data shows images comprise 54-56% of total page weight.{" "}
                <a href="https://almanac.httparchive.org/en/2024/page-weight" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  almanac.httparchive.org
                </a>
              </li>
              <li>
                <strong>Google Developers (2024).</strong> "Largest Contentful Paint (LCP)." Official Core Web Vitals documentation establishing 2.5 second threshold.{" "}
                <a href="https://web.dev/articles/lcp" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  web.dev/articles/lcp
                </a>
              </li>
              <li>
                <strong>Google/SOASTA Research (2017).</strong> "The Need for Mobile Speed." Study showing 32% bounce rate increase from 1s to 3s load time.{" "}
                <a href="https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks-load-time-vs-bounce/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  thinkwithgoogle.com
                </a>
              </li>
              <li>
                <strong>Vodafone (2021).</strong> "A 31% improvement in LCP increased sales by 8%." Official case study on Core Web Vitals optimization impact.{" "}
                <a href="https://web.dev/case-studies/vodafone" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  web.dev/case-studies/vodafone
                </a>
              </li>
              <li>
                <strong>BBC (2017).</strong> "BBC loses 10% of users for every additional second of load time." Performance impact study.{" "}
                <a href="https://wpostats.com/2017/03/03/bbc-load-abandonment/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  wpostats.com
                </a>
              </li>
              <li>
                <strong>Google/Unbounce Research.</strong> "Mobile Page Speed and Conversion Data." Study showing 1-second delay can impact conversion rates by up to 20%.{" "}
                <a href="https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-conversion-data/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  thinkwithgoogle.com
                </a>
              </li>
              <li>
                <strong>Ctrl blog (2024).</strong> "Comparing AVIF vs WebP file sizes." Technical comparison showing WebP 25-35% smaller than JPEG, AVIF 50% smaller.{" "}
                <a href="https://www.ctrl.blog/entry/webp-avif-comparison.html" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  ctrl.blog
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
