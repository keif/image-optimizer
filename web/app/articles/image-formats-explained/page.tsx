import Link from "next/link";
import { Metadata } from "next";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Image Formats Explained: JPEG, PNG, WebP, AVIF & GIF - Complete Guide",
  description: "Comprehensive guide to image formats on the web. Learn the differences between JPEG, PNG, WebP, AVIF, and GIF, and when to use each format for optimal results.",
};

export default function ImageFormatsGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <nav className="mb-8">
        <Link href="/articles" className="text-purple-600 dark:text-purple-400 hover:underline">
          ← Back to Articles
        </Link>
      </nav>

      <article className="prose dark:prose-invert prose-lg max-w-none">
        <header className="mb-12 not-prose">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              Formats
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">8 min read</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Image Formats Explained: JPEG, PNG, WebP, AVIF & GIF
          </h1>
          <p className="text-xl text-gray-300 dark:text-gray-300">
            Let’s break down the most popular image formats for the web—what they’re good at, where they fall short, and how to pick the right one for your project.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Published on October 22, 2024
          </div>
        </header>

        {/* Top Banner Ad */}
        <div className="not-prose mb-12">
          <AdBanner placeholderId={105} variant="banner" />
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Introduction</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Picking the right image format is essential for fast, beautiful websites. Each format has its own way of compressing images, its own strengths, and its own quirks. Choose poorly, and you might end up with slow load times, blurry pictures, or missing features like transparency.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          In this guide, we’ll walk through the five formats you’ll see most often on the web: JPEG, PNG, WebP, AVIF, and GIF. You’ll see what makes each one tick, where it shines, and when it’s the right tool for the job.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* Let’s dive into each format and see how they compare. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">JPEG: The Classic Photo Format</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          JPEG is everywhere. Since 1992, it’s been the standard for web photos and images with lots of color and detail. If you’ve ever uploaded a picture online, chances are it was a JPEG.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How JPEG Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          JPEG uses lossy compression to shrink file sizes, which means it throws away some data for good. It chops images into 8×8 pixel blocks and uses math (the Discrete Cosine Transform) to toss details our eyes won’t miss.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of JPEG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Great for photos:</strong> JPEG can shrink photo files by 10–20x and still look good.
          </li>
          <li>
            <strong>Works everywhere:</strong> Every browser and device supports JPEG, no questions asked.
          </li>
          <li>
            <strong>Quality control:</strong> You can dial in the compression level to balance size and appearance.
          </li>
          <li>
            <strong>Progressive loading:</strong> Progressive JPEGs show a blurry preview first, then sharpen as the image loads.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of JPEG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>No transparency:</strong> JPEG can’t do transparent backgrounds, so it’s a no-go for logos or overlays.
          </li>
          <li>
            <strong>Compression artifacts:</strong> Crank up the compression and you’ll spot blocky “artifacts,” especially around edges.
          </li>
          <li>
            <strong>Not for sharp graphics:</strong> Text and crisp lines get blurry or messy in JPEG.
          </li>
          <li>
            <strong>Quality loss on every save:</strong> Each time you re-save a JPEG, you lose a little more quality.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use JPEG</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Let the content decide the format—photos and graphics have different needs.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          JPEG is perfect for photos, images with lots of colors or gradients, and anything where a bit of quality loss is worth the smaller size. Reach for JPEG with hero images, product shots, user uploads, or backgrounds.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={106} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* Next up: PNG, for when you need sharpness or transparency. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">PNG: Sharp Graphics and Transparency</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          PNG arrived in 1996 as a free alternative to GIF, and quickly took over as the go-to for graphics that need transparency or perfect quality.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How PNG Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          PNG uses lossless compression, so your image comes out exactly the same as it went in—no data lost. It relies on the DEFLATE algorithm (the same as ZIP files), plus some clever filtering to boost compression.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">PNG-8 vs PNG-24</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          There are two main flavors of PNG. PNG-8 handles up to 256 colors (like GIF) and offers on/off transparency. PNG-24 supports millions of colors and smooth, gradient transparency thanks to its alpha channel.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of PNG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Lossless compression:</strong> Keeps your image pixel-perfect—no artifacts, ever.
          </li>
          <li>
            <strong>Alpha transparency:</strong> Supports smooth, variable transparency for beautiful overlays.
          </li>
          <li>
            <strong>Great for graphics:</strong> Delivers razor-sharp edges, ideal for logos, icons, and illustrations.
          </li>
          <li>
            <strong>Universal support:</strong> PNG works in every browser and on every device.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of PNG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Big files for photos:</strong> Photos saved as PNG can be 2–5x larger than JPEG.
          </li>
          <li>
            <strong>No animation:</strong> PNG isn’t for animations (APNG exists, but isn’t widely supported).
          </li>
          <li>
            <strong>Slower to compress:</strong> Creating small, optimized PNGs can take extra time.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use PNG</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> PNG shines with crisp graphics and transparency—not with photos.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Reach for PNG with logos, icons, screenshots, illustrations, or any image that needs transparency or perfect quality. If you’ll be editing an image repeatedly, PNG is a safe bet—it never loses quality.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* Now, let’s look at the new kids on the block: WebP and AVIF. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">WebP: Modern and Efficient</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP is Google’s answer to web images. Launched in 2010, it was built for the web from the ground up, offering both lossy and lossless compression—usually beating JPEG and PNG in file size.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How WebP Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP compresses images with predictive coding. For lossy images, it borrows from the VP8 video codec. For lossless, it uses entropy coding and a dictionary of pixel values. The result? Smaller files than JPEG or PNG for most images.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of WebP</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>High-efficiency compression:</strong> WebP images are usually 25–35% smaller than JPEG at the same quality.
          </li>
          <li>
            <strong>Lossy and lossless:</strong> One format can handle both photos and graphics.
          </li>
          <li>
            <strong>Alpha transparency:</strong> Supports full transparency, just like PNG—but smaller.
          </li>
          <li>
            <strong>Animation support:</strong> Can handle animations better than GIF.
          </li>
          <li>
            <strong>Modern browser support:</strong> Works in almost every browser (over 95% of users).
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of WebP</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Not for old browsers:</strong> Internet Explorer and some ancient Safari versions can’t display WebP.
          </li>
          <li>
            <strong>Needs modern tools:</strong> You’ll need up-to-date software to create and optimize WebP images.
          </li>
          <li>
            <strong>Editing support is spotty:</strong> Not every image editor supports WebP out of the box.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use WebP</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> WebP can often replace both JPEG and PNG—just remember to provide fallbacks for older browsers!</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use WebP as your go-to format for most modern sites. It works for photos, graphics, illustrations, and images with transparency. Just make sure to serve JPEG or PNG as a backup for browsers that don’t support it.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={107} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* Ready to push compression even further? Meet AVIF. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">AVIF: The Future of Image Compression</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          AVIF is the latest major format, arriving in 2019 and based on the AV1 video codec. It’s designed to deliver the smallest files at high quality—better than anything before it.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How AVIF Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          AVIF borrows its compression tricks from the AV1 video codec, using advanced video compression for still images. This means ultra-efficient file sizes and great image quality—but it’s more demanding on computers when encoding and decoding.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of AVIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Top-tier compression:</strong> AVIF files can be 50% smaller than JPEG at the same quality.
          </li>
          <li>
            <strong>HDR and wide color:</strong> Supports high bit depth and wide color for stunning visuals.
          </li>
          <li>
            <strong>Great quality at tiny sizes:</strong> Keeps images looking sharp, even with heavy compression.
          </li>
          <li>
            <strong>Modern features:</strong> Handles transparency, animation, and even lossless compression.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of AVIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Not universal yet:</strong> About 85% of browsers support AVIF as of 2024.
          </li>
          <li>
            <strong>Slow to encode:</strong> Creating AVIF images takes more time than other formats.
          </li>
          <li>
            <strong>Slower to decode:</strong> Some devices may struggle to display AVIF instantly, especially on mobile.
          </li>
          <li>
            <strong>Limited editing support:</strong> Few image editors support AVIF natively.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use AVIF</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> AVIF gives you the smallest files, but always offer WebP or JPEG as a fallback for full compatibility.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use AVIF for users with modern browsers—especially for high-quality photos, hero images, or when bandwidth is tight. Always provide WebP or JPEG as a backup so everyone gets a great experience.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* Finally, let’s look at GIF—still hanging on after all these years. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">GIF: The Animated Veteran</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          GIF has been around since 1987, making it one of the oldest formats still in use. While newer formats have taken over most tasks, GIF sticks around for simple animations.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How GIF Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          GIF uses lossless LZW compression, but it’s limited to just 256 colors. For animations, it strings together multiple frames, each displaying for a set amount of time.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of GIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Easy animation:</strong> Simple to make and universally supported for basic animations.
          </li>
          <li>
            <strong>Works everywhere:</strong> Even the oldest browsers and devices can show GIFs.
          </li>
          <li>
            <strong>Basic transparency:</strong> Supports on/off transparent pixels (but not full alpha transparency).
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of GIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Color limits:</strong> Only 256 colors, so photos look banded or posterized.
          </li>
          <li>
            <strong>Large file sizes:</strong> GIF animations are much bigger than modern videos or animated WebP.
          </li>
          <li>
            <strong>No audio:</strong> GIFs can’t include sound.
          </li>
          <li>
            <strong>Old-school compression:</strong> Much less efficient than today’s formats.
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use GIF</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Use modern animation formats (WebP, MP4) whenever possible—save GIF for when nothing else will do.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Only use GIF for simple, low-color animations when video or animated WebP aren’t an option. For most cases, MP4, WebP, or APNG will give you better quality and smaller files. If you need a quick, looping animation with few colors, GIF can still do the job.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={108} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* Let’s pull it all together with a side-by-side comparison. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Format Comparison Table</h2>
        <div className="not-prose my-8 overflow-x-auto">
          <table className="min-w-full text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-left font-semibold">Feature</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-left font-semibold">JPEG</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-left font-semibold">PNG</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-left font-semibold">WebP</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-left font-semibold">AVIF</th>
                <th className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-left font-semibold">GIF</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 font-medium">Compression</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Lossy</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Lossless</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Both</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Both</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Lossless</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 font-medium">Transparency</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">No</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes (Alpha)</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes (Alpha)</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes (Alpha)</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes (Binary)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 font-medium">Animation</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">No</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">No</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Yes</td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 font-medium">Browser Support</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">100%</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">100%</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">~95%</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">~85%</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">100%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 font-medium">Best For</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Photos</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Graphics, Logos</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Everything</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">High-quality Photos</td>
                <td className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">Simple Animation</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        {/* So, how do you actually choose? Here’s a quick guide. */}
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Choosing the Right Format</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Not sure which format to use? Here’s a quick cheat sheet for picking the best one for your images:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Photographs and Complex Images</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> For photos, use the newest formats you can—but always double-check browser support!</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> Use AVIF for browsers that support it (files are up to 50% smaller than JPEG).
          </li>
          <li>
            <strong>Better:</strong> Use WebP for browsers that don’t support AVIF (25–35% smaller than JPEG).
          </li>
          <li>
            <strong>Good:</strong> Use optimized JPEG as a fallback (works everywhere).
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Graphics, Logos, and Illustrations</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Use SVG for anything vector; for crisp raster graphics, stick to WebP or PNG. Never use JPEG for logos!</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> SVG for vector graphics (scales perfectly and tiny files).
          </li>
          <li>
            <strong>Better:</strong> WebP lossless for raster graphics (smaller than PNG).
          </li>
          <li>
            <strong>Good:</strong> PNG-8 or PNG-24 as a fallback (supported everywhere).
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Images with Transparency</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> If you need transparency, WebP or PNG are your friends—JPEG can’t do it!</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> WebP with alpha channel (much smaller than PNG).
          </li>
          <li>
            <strong>Better:</strong> PNG-24 with alpha channel (supported everywhere).
          </li>
          <li>
            <strong>Avoid:</strong> Don’t use JPEG (no transparency support).
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Simple Animations</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Go for video or animated WebP for smooth, efficient animations—leave GIF for last.</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> MP4/WebM video with looping (tiny files, great quality).
          </li>
          <li>
            <strong>Better:</strong> Animated WebP (beats GIF in most ways).
          </li>
          <li>
            <strong>Acceptable:</strong> GIF, but only for simple, low-color animations.
          </li>
        </ol>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Implementing Format Selection</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Thankfully, modern HTML makes serving multiple image formats a breeze. Use the <code>&lt;picture&gt;</code> element and <code>srcset</code> to automatically give each browser the best image it can handle. Here’s how:
        </p>

        <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
          <code>{`<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>`}</code>
        </pre>

        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The browser picks the first format it supports, falling back to JPEG if needed. This way, modern browsers get the smallest files, but everyone sees your images.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Conclusion</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Knowing your image formats is a huge win for web performance. JPEG and PNG are still important for compatibility, but formats like WebP and AVIF can dramatically cut file sizes without losing quality.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The smartest approach? Use progressive enhancement: serve the latest formats to browsers that support them, and reliable fallbacks for the rest. Image optimization tools (like Squish Image Optimizer) can automate this, converting your images to all the right formats with minimal effort.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sources and References</h2>
        <div className="not-prose">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This article references the following authoritative sources for image format specifications and comparisons:
            </p>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>MDN Web Docs (2024).</strong> "Image file type and format guide." Comprehensive reference for web image formats.{" "}
                <a href="https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  developer.mozilla.org
                </a>
              </li>
              <li>
                <strong>Can I Use (2024).</strong> "WebP image format." Browser support data showing ~95% global support.{" "}
                <a href="https://caniuse.com/webp" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  caniuse.com/webp
                </a>
              </li>
              <li>
                <strong>Can I Use (2024).</strong> "AVIF image format." Browser support data showing ~85-88% global support.{" "}
                <a href="https://caniuse.com/avif" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  caniuse.com/avif
                </a>
              </li>
              <li>
                <strong>Ctrl blog (2024).</strong> "Comparing AVIF vs WebP file sizes at the same DSSIM." Detailed technical comparison showing WebP 25-35% smaller than JPEG, AVIF 50% smaller.{" "}
                <a href="https://www.ctrl.blog/entry/webp-avif-comparison.html" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  ctrl.blog
                </a>
              </li>
              <li>
                <strong>Smashing Magazine (2021).</strong> "Using Modern Image Formats: AVIF And WebP." Comprehensive guide to modern image format adoption.{" "}
                <a href="https://www.smashingmagazine.com/2021/09/modern-image-formats-avif-webp/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  smashingmagazine.com
                </a>
              </li>
              <li>
                <strong>Cloudinary (2024).</strong> "Advanced Image Formats and When to Use Them." Industry guide covering WebP, AVIF, HEIC, and JPEG XL.{" "}
                <a href="https://cloudinary.com/blog/advanced-image-formats-and-when-to-use-them" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  cloudinary.com
                </a>
              </li>
            </ol>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <div className="not-prose my-12">
          <AdBanner placeholderId={109} variant="banner" />
        </div>

        {/* CTA */}
        <div className="not-prose mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Optimize Your Images?
          </h3>
          <p className="text-lg mb-6 text-purple-100">
            Convert your images to WebP, AVIF, and optimize them with our free tool
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Try Image Optimizer
          </Link>
        </div>

        {/* Related Articles */}
        <div className="not-prose mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Related Articles
          </h3>
          <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
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
                href="/articles/web-performance-guide"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                How Image Optimization Improves Website Performance →
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
