import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sprite Sheet Optimization: Best Practices for Web & Game Performance",
  description: "Learn how to optimize sprite sheets for web and game development — covering packing algorithms, formats, compression, and automation workflows.",
};

export default function SpriteSheetOptimization() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-8">
        <Link href="/articles" className="text-purple-600 dark:text-purple-400 hover:underline">
          ← Back to Articles
        </Link>
      </nav>

      <article className="prose dark:prose-invert prose-lg max-w-none">
        <header className="mb-12 not-prose">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              Optimization
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">10 min read</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sprite Sheet Optimization Best Practices
          </h1>
          <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
            Complete guide to optimizing sprite sheets for maximum performance in web apps and
            games. Learn packing algorithms, format selection, compression techniques, and
            workflow automation.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Published on October 22, 2024
          </div>
        </header>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Why Sprite Sheet Optimization Matters</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Sprite sheets are straightforward to make, but getting them *really* optimized? That's where things get interesting. Pack your images poorly and you'll waste bandwidth on empty pixels. Skip compression and your sheet balloons to megabytes. Use the wrong packing algorithm and you're leaving performance on the table.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The difference between a quick-and-dirty sprite sheet and a well-tuned one is dramatic—we're talking 2-3x file size reductions and noticeably smoother rendering, especially in games. If you've ever watched a poorly packed sheet stutter during gameplay or blow your page weight budget, you know exactly what I mean.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Whether you're managing UI icons for a web app or wrangling hundreds of animation frames for a game, the principles are the same: minimize wasted space, compress intelligently, and automate the hell out of it. Let's dig in.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Packing Algorithms: Fitting the Puzzle Together</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Here's where sprite sheets get nerdy in a good way. Packing algorithms determine how your individual sprites nestle together in the final texture. The most common ones—MaxRects, Guillotine, and Shelf Packing—each have different strengths.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          MaxRects is the gold standard if you have sprites of wildly different sizes (think mixing 16×16 icons with 128×64 UI elements). It tries every possible placement to minimize wasted space. Tighter packing, but slower generation times. Guillotine is faster and simpler—it just splits the remaining space into rectangles after each sprite placement. Less optimal, but if you're iterating rapidly or your sprites are similar sizes, the speed trade-off is worth it.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Shelf Packing is basically "line everything up in rows." Sounds basic, right? But it works incredibly well for uniform-height sprites like character animation frames. The catch? Wasted vertical space if your heights vary too much.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Why does this matter for performance? Every pixel of wasted space is memory your GPU has to allocate and bandwidth your users have to download. Tighter packing also means fewer texture swaps during rendering—and texture swaps are expensive. A well-packed sheet can mean the difference between 60fps and 45fps in a WebGL game.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Format Selection: PNG vs WebP (and Why Power-of-Two Matters)</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          For sprite sheets, format choice usually comes down to PNG or WebP. PNG is the safe, universal option—every browser and game engine handles it without blinking. It's lossless, which means your pixel art stays crisp, and transparency just works. The downside? File sizes can get chunky, especially for large sheets.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP is where things get interesting. You can go lossless (like PNG but 20-30% smaller) or lossy (think JPEG-level compression with transparency support). For game sprites with lots of solid colors or repeated patterns, WebP lossless is a no-brainer. For more photographic textures, lossy WebP at quality 85-90 will save you serious bandwidth without visible artifacts. The catch? Not every tool exports WebP cleanly, and some older mobile browsers choke on it—so test your target devices.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          One more thing: stick to power-of-two dimensions whenever possible (256×256, 512×512, 1024×1024, etc.). GPUs are optimized for these sizes, and many older graphics cards straight-up require them. If your sheet is 1000×1000, you're forcing the GPU to pad it to 1024×1024 anyway, wasting memory. Just size it right from the start and save everyone the headache.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Compression: Squeezing Every Byte</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Once you've packed your sprites and picked a format, compression is where you actually save bandwidth. For PNG sheets, tools like oxipng or pngquant can shave off 30-50% without any visual difference. They just rewrite the file more efficiently or quantize the palette if you've got lots of similar colors.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP gives you more control. The built-in encoder (cwebp) lets you choose lossy or lossless on the fly. For sprite sheets with clean edges—UI elements, pixel art, that sort of thing—go lossless. For textured game assets, try lossy at quality 85 and see if you can spot the difference. Usually you can't, and you just saved 40% on file size.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The trick is knowing where to stop. Crank PNG down to 8-bit color when you've got gradients and you'll see ugly banding. Push WebP lossy below quality 75 and edges start to blur. I usually export at a few different settings, open them side-by-side at 100% zoom, and pick the smallest one that doesn't make me wince. (I once spent an hour chasing a "phantom pixel" bug that turned out to be an overly aggressive compression setting destroying a 1px border. Learn from my mistakes.)
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Seriously—automate this. Your future self will thank you. Stick oxipng or cwebp in your build script so every sprite sheet gets crushed before it hits production. Manual optimization is fine for experimentation, but you'll forget to do it when you're rushing a hotfix at 11 PM.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Automation: Because You Have Better Things to Do</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Look, manually packing sprites every time you add a new icon is a waste of your time. TexturePacker is the industry standard if you want a GUI. It handles packing algorithms, generates metadata (JSON, XML, whatever your engine wants), and can even trim transparent pixels automatically. Worth the license if you're doing this professionally.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          More of a command-line person? Check out spritesheet-js or write a quick script with ImageMagick. I've got a bash one-liner that watches a folder, repacks sprites on changes, runs oxipng, and spits out both PNG and WebP. Took 20 minutes to write. Saved me hours.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The goal is to make optimization invisible. When your designer drops a new sprite into the folder, it should automatically get packed, compressed, and deployed without you lifting a finger. Set it up once, forget it exists, move on to the interesting problems.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sources and References</h2>
        <div className="not-prose">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This guide references technical resources on sprite sheet optimization:
            </p>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>MDN Web Docs (2024).</strong> "Implementing image sprites in CSS." Official documentation on sprite sheet implementation.{" "}
                <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Implementing_image_sprites_in_CSS" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  developer.mozilla.org
                </a>
              </li>
              <li>
                <strong>Game Development Stack Exchange.</strong> "Multiple small spritesheets or one giant spritesheet for performance?" Discussion on sprite sheet size optimization.{" "}
                <a href="https://stackoverflow.com/questions/35930083/multiple-small-spritesheets-or-one-giant-spritesheet-for-performance-java" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  stackoverflow.com
                </a>
              </li>
              <li>
                <strong>Cloudinary (2024).</strong> "Image Optimization Best Practices." Industry guide covering sprite sheet optimization techniques.{" "}
                <a href="https://cloudinary.com/blog/image-optimization" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  cloudinary.com
                </a>
              </li>
            </ol>
          </div>
        </div>

        <div className="not-prose mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Create Optimized Sprite Sheets?
          </h3>
          <p className="text-lg mb-6 text-purple-100">
            Use our free spritesheet packer with built-in optimization to boost your workflow and performance.
          </p>
          <Link
            href="/spritesheet"
            className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Try Spritesheet Packer
          </Link>
        </div>
      </article>
    </div>
  );
}
