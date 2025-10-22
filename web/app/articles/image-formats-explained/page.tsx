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
            A comprehensive guide to understanding different image formats, their strengths,
            weaknesses, and when to use each one for optimal web performance.
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
          Choosing the right image format is one of the most important decisions you'll make when
          optimizing your website's performance. Different formats use different compression
          algorithms, support different features, and excel in different use cases. Using the
          wrong format can result in unnecessarily large file sizes, poor visual quality, or
          missing features like transparency.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          In this comprehensive guide, we'll explore the five most common image formats used on
          the web today: JPEG, PNG, WebP, AVIF, and GIF. You'll learn how each format works,
          what makes them unique, and most importantly, when to use each one.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">JPEG: The Classic Photo Format</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          JPEG is the most widely-used image format on the web, and for good reason. Developed
          in 1992, it's been the go-to format for photographs and complex images for over three
          decades.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How JPEG Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          JPEG uses lossy compression, which means it achieves smaller file sizes by permanently
          discarding some image data. The format works by breaking the image into 8×8 pixel
          blocks and applying a mathematical transformation (Discrete Cosine Transform) to remove
          visual information that human eyes are less sensitive to.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of JPEG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Excellent compression for photos:</strong> JPEG can reduce photograph file
            sizes by 10-20x while maintaining good visual quality
          </li>
          <li>
            <strong>Universal browser support:</strong> Every browser, device, and platform
            supports JPEG without exception
          </li>
          <li>
            <strong>Adjustable quality:</strong> You can choose the compression level (1-100) to
            balance file size against visual quality
          </li>
          <li>
            <strong>Progressive rendering:</strong> Progressive JPEGs load gradually, showing a
            low-quality preview that improves as more data arrives
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of JPEG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>No transparency support:</strong> JPEG cannot have transparent backgrounds,
            limiting its use for logos and graphics
          </li>
          <li>
            <strong>Lossy compression artifacts:</strong> Heavy compression creates visible
            "blocking" artifacts, especially around sharp edges
          </li>
          <li>
            <strong>Poor for text and graphics:</strong> The lossy algorithm makes sharp lines and
            text look blurry or distorted
          </li>
          <li>
            <strong>Quality degrades with re-saving:</strong> Each time you edit and save a JPEG,
            it loses more quality
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use JPEG</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Choose based on content type, not habit — photos vs graphics often demand very different formats.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use JPEG for photographs, complex images with many colors and gradients, and any content
          where some quality loss is acceptable in exchange for smaller file sizes. JPEG is ideal
          for hero images, product photos, user-uploaded content, and background images.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={106} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">PNG: Sharp Graphics and Transparency</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          PNG was created in 1996 as a patent-free alternative to GIF. It quickly became the
          standard for web graphics requiring transparency or lossless quality.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How PNG Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          PNG uses lossless compression, meaning the decompressed image is pixel-perfect identical
          to the original. It uses the DEFLATE compression algorithm (the same one used in ZIP
          files) combined with filtering techniques that prepare the image data for better
          compression.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">PNG-8 vs PNG-24</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          PNG comes in two main variants. PNG-8 supports up to 256 colors (like GIF) and includes
          binary transparency (fully transparent or fully opaque). PNG-24 supports millions of
          colors and alpha channel transparency with 256 levels of opacity, allowing for smooth
          transparency gradients.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of PNG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Lossless compression:</strong> Perfect quality preservation with no compression
            artifacts
          </li>
          <li>
            <strong>Alpha channel transparency:</strong> Smooth, gradient transparency with 256
            levels of opacity
          </li>
          <li>
            <strong>Excellent for graphics:</strong> Sharp, crisp edges make it perfect for logos,
            icons, and illustrations
          </li>
          <li>
            <strong>Universal support:</strong> Like JPEG, PNG is supported everywhere
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of PNG</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Large file sizes for photos:</strong> Lossless compression means photos are
            often 2-5x larger than equivalent JPEGs
          </li>
          <li>
            <strong>No animation support:</strong> PNG cannot create animated images (though APNG
            exists, it has limited support)
          </li>
          <li>
            <strong>Slower compression:</strong> Creating highly optimized PNGs takes longer than
            other formats
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use PNG</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> PNG is best for crisp lines, text, and transparency — not for photos!</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use PNG for logos, icons, graphics with text, screenshots, illustrations, and any image
          requiring transparency or pixel-perfect quality. PNG is essential for images that will
          be edited multiple times, as it doesn't degrade with re-saving.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">WebP: Modern and Efficient</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP is a modern image format developed by Google in 2010. It was designed specifically
          for the web, offering both lossy and lossless compression with better efficiency than
          JPEG and PNG.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How WebP Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP uses predictive coding to compress images. For lossy compression, it uses techniques
          similar to the VP8 video codec. For lossless compression, it uses entropy coding with
          a dictionary of recently seen pixel values. This allows WebP to achieve smaller file
          sizes than both JPEG and PNG.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of WebP</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Superior compression:</strong> WebP images are typically 25-35% smaller than
            equivalent JPEG images
          </li>
          <li>
            <strong>Supports both lossy and lossless:</strong> One format can replace both JPEG
            and PNG in many cases
          </li>
          <li>
            <strong>Alpha channel transparency:</strong> Like PNG, but with smaller file sizes
          </li>
          <li>
            <strong>Animation support:</strong> Can create animated images more efficiently than
            GIF
          </li>
          <li>
            <strong>Wide browser support:</strong> Supported by all modern browsers (95%+ of users)
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of WebP</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Limited legacy browser support:</strong> Internet Explorer and very old Safari
            versions don't support WebP
          </li>
          <li>
            <strong>Encoding complexity:</strong> Requires modern tools and libraries for creation
            and optimization
          </li>
          <li>
            <strong>Less tooling support:</strong> Not all image editing applications support WebP
            natively
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use WebP</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> WebP can replace both JPEG and PNG for most web images — just remember to provide fallbacks!</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use WebP as your primary format for modern websites, with JPEG/PNG fallbacks for older
          browsers. It's excellent for all types of content: photos, graphics, illustrations, and
          images with transparency. Always serve WebP when browser support allows.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={107} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">AVIF: The Future of Image Compression</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          AVIF is the newest major image format, released in 2019. Based on the AV1 video codec,
          it offers the best compression efficiency of any format discussed here.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How AVIF Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          AVIF uses compression techniques from the AV1 video codec, applying intra-frame video
          compression to still images. This allows for incredibly efficient compression with
          excellent quality retention, but requires more computational power for encoding and
          decoding.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of AVIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best-in-class compression:</strong> AVIF files are typically 50% smaller than
            JPEG at the same visual quality
          </li>
          <li>
            <strong>High bit depth support:</strong> Supports HDR and wide color gamut for premium
            displays
          </li>
          <li>
            <strong>Superior quality at low bitrates:</strong> Maintains visual quality even with
            aggressive compression
          </li>
          <li>
            <strong>Modern features:</strong> Supports transparency, animation, and lossless
            compression
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of AVIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Limited browser support:</strong> Only ~85% of browsers support AVIF (as of
            2024)
          </li>
          <li>
            <strong>Slow encoding:</strong> Creating AVIF images takes significantly longer than
            other formats
          </li>
          <li>
            <strong>Slower decoding:</strong> Some devices struggle to decode AVIF quickly,
            potentially affecting user experience
          </li>
          <li>
            <strong>Minimal tooling:</strong> Few image editors support AVIF natively
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use AVIF</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> AVIF offers top-notch compression, but always provide WebP/JPEG fallbacks for best compatibility.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use AVIF as a progressive enhancement for users with modern browsers. Always provide
          WebP and JPEG fallbacks. AVIF is particularly valuable for high-quality photography,
          hero images, and bandwidth-constrained scenarios like mobile networks.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">GIF: The Animated Veteran</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          GIF is one of the oldest image formats still in use, created in 1987. While it's largely
          been superseded by better formats, it remains popular for simple animations.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">How GIF Works</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          GIF uses lossless LZW compression and is limited to a 256-color palette. For animation,
          it stores multiple frames sequentially, with each frame showing for a specified duration.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Strengths of GIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Simple animation:</strong> Easy to create and widely supported animated images
          </li>
          <li>
            <strong>Universal support:</strong> Works everywhere, even on very old systems
          </li>
          <li>
            <strong>Binary transparency:</strong> Supports transparent pixels (though not alpha
            channel)
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Weaknesses of GIF</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Limited color palette:</strong> Only 256 colors maximum, causing visible
            banding in photos
          </li>
          <li>
            <strong>Large file sizes:</strong> Animations can be enormous compared to modern video
            formats
          </li>
          <li>
            <strong>No audio support:</strong> Cannot include sound with animations
          </li>
          <li>
            <strong>Outdated compression:</strong> Much less efficient than modern alternatives
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When to Use GIF</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Prefer modern animation formats (WebP, MP4) — use GIF only when nothing else works.</p>
        </blockquote>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Use GIF only for simple animations when video formats aren't suitable. For most use
          cases, consider MP4 video, WebP animation, or APNG instead. GIF is best for simple
          graphics with few colors and short animation loops.
        </p>

        <div className="not-prose my-12">
          <AdBanner placeholderId={108} variant="banner" />
        </div>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
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
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Choosing the Right Format</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Here's a practical decision tree to help you choose the right format for your images:
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Photographs and Complex Images</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> For photos, prioritize modern formats (AVIF, WebP) — but always check browser support!</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> Serve AVIF to supporting browsers (50% smaller than JPEG)
          </li>
          <li>
            <strong>Better:</strong> Serve WebP to supporting browsers (25-35% smaller than JPEG)
          </li>
          <li>
            <strong>Good:</strong> Serve optimized JPEG as fallback (universal support)
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Graphics, Logos, and Illustrations</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Use SVG for vectors, PNG/WebP for crisp raster graphics — never JPEG for logos!</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> Use SVG for vector graphics (scalable and tiny file size)
          </li>
          <li>
            <strong>Better:</strong> Use WebP lossless for raster graphics (smaller than PNG)
          </li>
          <li>
            <strong>Good:</strong> Use PNG-8 or PNG-24 as fallback (universal support)
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Images with Transparency</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Need transparency? Use PNG or WebP — JPEG can't do it!</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> Use WebP with alpha channel (much smaller than PNG)
          </li>
          <li>
            <strong>Better:</strong> Use PNG-24 with alpha channel (universal support)
          </li>
          <li>
            <strong>Avoid:</strong> Don't use JPEG (no transparency support)
          </li>
        </ol>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">For Simple Animations</h3>
        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
          <p><strong>Pro Tip:</strong> Use video or animated WebP for smooth, efficient animation — GIF is a last resort.</p>
        </blockquote>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <strong>Best:</strong> Use MP4/WebM video with looping (smallest size, best quality)
          </li>
          <li>
            <strong>Better:</strong> Use WebP animation (better than GIF)
          </li>
          <li>
            <strong>Acceptable:</strong> Use GIF only for simple, low-color animations
          </li>
        </ol>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Implementing Format Selection</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Modern HTML provides the <code>&lt;picture&gt;</code> element and <code>srcset</code>{" "}
          attribute to serve different formats based on browser support. Here's an example:
        </p>

        <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
          <code>{`<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>`}</code>
        </pre>

        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The browser will automatically select the first format it supports, falling back to
          JPEG if necessary. This approach ensures optimal file size for modern browsers while
          maintaining compatibility with older ones.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Conclusion</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Understanding image formats is crucial for web performance optimization. While JPEG
          and PNG remain important for universal compatibility, modern formats like WebP and
          AVIF offer significant file size reductions without compromising quality.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The best strategy is to use a progressive enhancement approach: serve cutting-edge
          formats to modern browsers while providing fallbacks for older ones. Tools like the
          Squish Image Optimizer can automatically convert your images to multiple formats,
          making it easy to implement this strategy across your entire website.
        </p>

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
