import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Are Sprite Sheets? Complete Guide for Web & Game Developers",
  description: "Learn what sprite sheets are, how they work, and why they're essential for web performance and game development. Includes examples from Friday Night Funkin and modern web apps.",
};

export default function WhatAreSpriteSheets() {
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
              Sprite Sheets
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">9 min read</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Are Sprite Sheets? Complete Guide for Web & Game Developers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Sprite sheets are one of those timeless developer tricks — born in 8-bit arcades, still powering modern web apps and games today. Whether you're shaving milliseconds off your page loads or animating a pixel-perfect character, this guide will show you exactly how and why they work.
          </p>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Published on October 22, 2024
          </div>
        </header>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sprite Sheets 101: The Core Idea</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          A sprite sheet (also called a texture atlas, image sprite, or sprite map) is a single image file packed with many smaller images — think characters, icons, or animation frames — arranged in a grid or puzzle-like layout. Instead of loading dozens or hundreds of separate files, you load one sheet and pull out just the pieces you need, when you need them.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Sprite sheets pull double duty: web developers use them to cut down on HTTP requests and boost load speed, while game devs use them to create smooth, memory-friendly animations. Mastering both sides is key for anyone building modern, high-performance experiences.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">A Simple Example</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Imagine you’ve got 20 social icons for a website, or a game character with 16 animation frames. You could load 20 or 16 separate image files — or, with a sprite sheet, you load just one file and show the right slice at the right time. It’s like a filmstrip for your visuals—load once, play many.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">A Brief History: From Arcades to the Web</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">The Gaming Origins (1970s-1990s)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Sprite sheets were born in the golden age of arcade games. Back in the 1970s and 80s, arcade and console games had almost no memory to spare—sometimes just a few kilobytes. Games like Pac-Man and Super Mario Bros. packed all their graphics into sprite sheets because it was the only way to squeeze dozens of characters, animations, and objects into such tiny spaces.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          These early sheets were tiny—maybe 256×256 pixels, filled with 8×8 or 16×16 pixel sprites. But the core trick hasn’t changed: pack images together, then show the bit you want.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Web Development Adoption (2000s)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          When web developers got hold of the idea, they didn’t just borrow it—they reimagined it for speed. Around 2004-2006, the web’s big bottleneck was HTTP requests: browsers could only make a handful at a time, and each one was slow. Loading 30 icons meant 30 round trips. Sprite sheets became a way to pack everything into one file and cut the lag.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          CSS sprite sheets—one image containing all your icons and UI bits—became a web performance best practice. With a few lines of CSS, you could show just the right icon from the sheet. Major sites like Google and Facebook jumped on board.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Modern Era: HTML5 Games & Web Apps (2010s-Present)</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Fast forward to today: sprite sheets are everywhere, from HTML5 Canvas games and WebGL apps to modern web interfaces. Game engines use them for lightning-fast character animations and effects; web apps still use them for icons and UI, though HTTP/2 and HTTP/3 have changed the calculus a bit.
        </p>

        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          <strong>Pro Tip:</strong> Even in the HTTP/2 and HTTP/3 era, sprite sheets still outperform multiple requests when you're dealing with large icon sets.
        </blockquote>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">How Sprite Sheets Actually Work</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">The Basic Concept</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Sprite sheets work by carving up a big image into smaller rectangles. Each rectangle is a “sprite”—an icon, a frame, a button, whatever you need. Your code just needs to know the pixel coordinates (x, y, width, height) for each one. Show the right rectangle, and you get the right image.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Grid-Based Sprite Sheets</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The simplest approach is a regular grid: every sprite is the same size. For example, a 4×4 grid of 128×128 frames makes a 512×512 sheet. Animations love this setup, because the math is dead simple.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          To get frame N from a grid, just do:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>x = (N % columns) × frameWidth</li>
          <li>y = Math.floor(N / columns) × frameHeight</li>
        </ul>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Perfect for character animations or anything where every frame is identical in size.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Packed/Optimized Sprite Sheets</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          But what if your sprites are all different sizes—like a mix of 16×16 and 128×64 icons? Grids waste a ton of space. Packed sprite sheets use clever algorithms to fit everything together tightly, minimizing empty pixels.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Algorithms like MaxRects or Guillotine arrange sprites like a jigsaw puzzle. You end up with a denser sheet, but now you need metadata (usually JSON or XML) to tell your code where each sprite lives.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Sprite Sheet Metadata</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Packed sheets always come with a companion data file that maps out the layout:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm mb-6">
          <code>{`{
  "frames": {
    "character_idle_01.png": {
      "frame": {"x": 0, "y": 0, "w": 128, "h": 128},
      "rotated": false,
      "trimmed": false
    },
    "character_run_01.png": {
      "frame": {"x": 128, "y": 0, "w": 128, "h": 128},
      "rotated": false,
      "trimmed": false
    }
  },
  "meta": {
    "image": "character-spritesheet.png",
    "size": {"w": 512, "h": 512},
    "scale": 1
  }
}`}</code>
        </pre>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          This metadata tells your code exactly where to find each sprite. Game engines and tools read it so you can grab the right chunk of pixels, instantly.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sprite Sheets on the Web</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">CSS Sprites: The Classic Technique</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          On the web, CSS sprites are the classic move. You use background-position to reveal just the right part of the image. Here’s how it works:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm mb-6">
          <code>{`.icon {
  width: 32px;
  height: 32px;
  background-image: url('icons-sprite.png');
  background-repeat: no-repeat;
}

.icon-home {
  background-position: 0 0; /* Top-left sprite */
}

.icon-search {
  background-position: -32px 0; /* Second sprite */
}

.icon-settings {
  background-position: -64px 0; /* Third sprite */
}`}</code>
        </pre>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          The negative background-position values shift the image to reveal different icons or states. Back in the HTTP/1.1 days, this trick slashed page load times.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">HTTP/2 and Modern Considerations</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          HTTP/2 and HTTP/3 changed the game by letting browsers request lots of files at once. That means the big speedup from CSS sprites isn’t as dramatic for small icon sets. But sprite sheets still have tricks up their sleeve:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>Cache efficiency:</strong> One sprite sheet means one cache entry, one ETag, one cache validation</li>
          <li><strong>Compression:</strong> One large image compresses better than many small ones</li>
          <li><strong>Rendering performance:</strong> Fewer DOM image elements, less memory usage</li>
          <li><strong>Large icon sets:</strong> For 50+ icons, sprite sheets are still faster than 50 separate requests</li>
        </ul>

        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          <strong>Pro Tip:</strong> Sprite sheets really shine when you have dozens or hundreds of icons. They keep your cache lean and your UI snappy.
        </blockquote>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">SVG Sprites: Modern Alternative</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Need crisp icons at any size? SVG sprite sheets are the modern answer. Instead of shifting backgrounds, you reference SVG symbols directly:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm mb-6">
          <code>{`<!-- SVG sprite sheet -->
<svg style="display: none;">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </symbol>
  <symbol id="icon-search" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27A6.471..."/>
  </symbol>
</svg>

<!-- Usage -->
<svg class="icon"><use href="#icon-home"/></svg>`}</code>
        </pre>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          SVG sprites scale to any size, are easy to style with CSS, and are perfect for modern icon systems.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sprite Sheets in Games</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Character Animations</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Games like Friday Night Funkin’ rely on sprite sheets for every character animation. Each state—idle, singing, dancing, special moves—gets its own sheet, packed with frames. Play those frames in sequence, and you get buttery-smooth animation.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          For example, FNF’s Boyfriend character has sheets with dozens of frames per animation. Show 24 frames per second, and you get one second of movement. Why sprite sheets? Because:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li>One texture load instead of hundreds of individual images</li>
          <li>GPU can efficiently render from a single texture</li>
          <li>Less memory fragmentation</li>
          <li>Easier to manage and organize assets</li>
        </ul>

        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          <strong>Pro Tip:</strong> Sprite sheets let your GPU do the heavy lifting—one texture, lightning-fast animation, less memory overhead.
        </blockquote>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Canvas and WebGL Rendering</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          HTML5 Canvas games use <code>drawImage()</code> with source coordinates to grab just the sprite frame you want:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm mb-6">
          <code>{`// Load sprite sheet
const spriteSheet = new Image();
spriteSheet.src = 'character-spritesheet.png';

// Draw one frame from the sprite sheet
function drawSprite(frameIndex) {
  const frameWidth = 128;
  const frameHeight = 128;
  const framesPerRow = 8;

  const sx = (frameIndex % framesPerRow) * frameWidth;
  const sy = Math.floor(frameIndex / framesPerRow) * frameHeight;

  ctx.drawImage(
    spriteSheet,
    sx, sy, frameWidth, frameHeight,  // Source rectangle
    x, y, frameWidth, frameHeight      // Destination rectangle
  );
}

// Animate by cycling through frames
let currentFrame = 0;
function animate() {
  drawSprite(currentFrame);
  currentFrame = (currentFrame + 1) % totalFrames;
  requestAnimationFrame(animate);
}`}</code>
        </pre>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Game Engines and Sprite Sheets</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Modern game engines make sprite sheets a breeze:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>Phaser.js:</strong> Load sprite sheets with frameWidth/frameHeight or JSON data files</li>
          <li><strong>PixiJS:</strong> Supports TexturePacker JSON format for packed sprite sheets</li>
          <li><strong>Three.js:</strong> Use sprite sheets as textures for 2D sprites in 3D space</li>
          <li><strong>Babylon.js:</strong> Sprite sheet support for particle systems and UI</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Tile Maps and Sprite Sheets</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Many games use sprite sheets for tile-based levels. A tile set sprite sheet holds grass, dirt, water, walls, and more. The game engine reads a level map (a 2D array of tile IDs) and renders each tile by pulling the right chunk from the sheet.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          This is the secret sauce behind classics like Super Mario and Zelda, and loads of modern indie games. Tools like Tiled Map Editor make building these worlds a snap.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Tools to Create Sprite Sheets</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Web-Based Tools</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>Squish Spritesheet Packer:</strong> Free online tool for packing sprites with customizable padding and output formats</li>
          <li><strong>CSS Sprite Generator:</strong> Upload images, get CSS sprite sheet with generated classes</li>
          <li><strong>Leshy SpriteSheet Tool:</strong> Browser-based sprite sheet creator with animation preview</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Desktop Applications</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>TexturePacker:</strong> Professional sprite sheet packer with advanced algorithms, multi-format export</li>
          <li><strong>ShoeBox:</strong> Free tool by Adobe for sprite sheet generation and atlas creation</li>
          <li><strong>Aseprite:</strong> Pixel art editor with built-in sprite sheet export for animations</li>
          <li><strong>Spine:</strong> 2D skeletal animation software that exports sprite sheets</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Command-Line Tools</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>ImageMagick:</strong> Can tile/montage images into sprite sheets via command line</li>
          <li><strong>spritesheet-js:</strong> Node.js package for generating sprite sheets in build pipelines</li>
          <li><strong>webpack-spritesmith:</strong> Webpack plugin for automatic sprite sheet generation</li>
        </ul>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">When Sprite Sheets Make Sense</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Ideal Use Cases</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>Icon sets:</strong> 10+ icons used throughout a website or app</li>
          <li><strong>Character animations:</strong> Multiple frames for walk cycles, attacks, etc.</li>
          <li><strong>UI elements:</strong> Buttons, badges, indicators in various states</li>
          <li><strong>Particle effects:</strong> Explosion, smoke, or magic effect frames</li>
          <li><strong>Tile sets:</strong> Building blocks for tile-based game levels</li>
          <li><strong>Emoji/stickers:</strong> Collections of small, similar-sized images</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">When NOT to Use Sprite Sheets</h3>
        <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <li><strong>Few, large images:</strong> 2-3 hero images don't benefit from sprite sheets</li>
          <li><strong>Responsive images:</strong> Images that need srcset for different sizes</li>
          <li><strong>Lazy-loaded content:</strong> Images below the fold that load on scroll</li>
          <li><strong>User-uploaded content:</strong> Dynamic content that can't be pre-packed</li>
          <li><strong>HTTP/3 with small icon sets:</strong> 5-10 tiny icons load fine individually</li>
        </ul>

        <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
          <strong>Pro Tip:</strong> Sprite sheets are unbeatable for large sets of static assets. For just a few big images or anything user-uploaded, skip them.
        </blockquote>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Modern Alternatives and What’s Next</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Icon Fonts</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Icon fonts like Font Awesome give you scalable icons as font glyphs. They’re easy to style and drop in with CSS, but can be a pain for accessibility and don’t do multi-color. For simple, single-color icons, they’re a quick fix.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">SVG Icon Systems</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Today’s frameworks often use SVG components instead of sprite sheets. Each icon is a React/Vue component that renders inline SVG. It’s great for developer experience, but you lose some of the caching and performance magic of old-school sprite sheets.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">WebP and AVIF Sprite Sheets</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          WebP and AVIF can shrink your sprite sheet file sizes dramatically. A PNG sheet might be 500 KB; the same thing in WebP could be 200 KB, or 150 KB in AVIF. Most browsers support these formats, so use them for even faster loads.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-200">Lottie Animations</h3>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          For complex, vector-based animations, Lottie (JSON animations from After Effects) can be smaller and more flexible than sprite sheets. But for pixel art, game sprites, or simple icon states, sprite sheets still win on speed and simplicity.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Conclusion</h2>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Sprite sheets aren’t just a relic from pixel art history — they’re a masterclass in optimization that still holds up. From Pac-Man to progressive web apps, the principle is the same: pack smart, load fast, render beautifully.
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
          Whether you’re designing a game, building a UI, or just trying to squeeze more performance out of your site, sprite sheets remain one of the most efficient, elegant solutions ever invented.
        </p>

        <hr className="my-12 border-t border-gray-300 dark:border-gray-700" />
        <h2 className="text-3xl font-bold mt-12 mb-4 text-gray-900 dark:text-white">Sources and References</h2>
        <div className="not-prose">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This article references technical documentation and discussions on sprite sheet implementation:
            </p>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>MDN Web Docs (2024).</strong> "CSS Image Sprites." Official documentation on implementing CSS sprites.{" "}
                <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Implementing_image_sprites_in_CSS" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  developer.mozilla.org
                </a>
              </li>
              <li>
                <strong>Game Development Stack Exchange.</strong> "Why use spritesheets?" Community discussion on sprite sheet benefits for games.{" "}
                <a href="https://gamedev.stackexchange.com/questions/7069/2d-graphics-why-use-spritesheets" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  gamedev.stackexchange.com
                </a>
              </li>
              <li>
                <strong>CSS-Tricks (2024).</strong> "Musings on HTTP/2 and Bundling." Analysis of sprite sheets in modern web protocols.{" "}
                <a href="https://css-tricks.com/musings-on-http2-and-bundling/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  css-tricks.com
                </a>
              </li>
              <li>
                <strong>OCTO Talks.</strong> "HTTP/2 arrives but sprite sets ain't no dead." Performance study comparing sprite sheets and individual images.{" "}
                <a href="https://blog.octo.com/http2-arrives-but-sprite-sets-aint-no-dead" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  blog.octo.com
                </a>
              </li>
            </ol>
          </div>
        </div>

        <div className="not-prose mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Create Your Own Sprite Sheets?
          </h3>
          <p className="text-lg mb-6 text-purple-100">
            Use our free spritesheet packer to combine your images efficiently
          </p>
          <Link
            href="/spritesheet"
            className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Try Spritesheet Packer
          </Link>
        </div>

        <div className="not-prose mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Related Articles
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/articles/sprite-sheets-vs-individual-images"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Sprite Sheets vs Individual Images: Performance Analysis →
              </Link>
            </li>
            <li>
              <Link
                href="/articles/sprite-sheet-optimization"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Sprite Sheet Optimization Best Practices →
              </Link>
            </li>
            <li>
              <Link
                href="/articles/image-formats-explained"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Image Formats Explained: JPEG, PNG, WebP, AVIF & GIF →
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </div>
  );
}
