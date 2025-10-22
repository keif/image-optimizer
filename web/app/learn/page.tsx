import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Learn More - SoSquishy",
  description: "Discover the story behind SoSquishy - a cozy corner of the web celebrating joy, softness, and good vibes with our adorable blue droplet mascot, Squish.",
  openGraph: {
    title: "Learn More - SoSquishy",
    description: "We're all about joy, softness, and small smiles. Learn the story behind SoSquishy and our squishy philosophy.",
    images: ["/squish.png"],
  },
};

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-300 via-sky-400 to-indigo-400 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-blue-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
                We&apos;re all about joy, softness, and small smiles.
              </h1>
              <p className="text-xl sm:text-2xl text-sky-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                SoSquishy is a cozy corner of the web that celebrates cute, squishy design and good vibes.
              </p>
            </div>

            {/* Mascot Image - Floating Animation */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative animate-float">
                <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/so-squishy-squish.png"
                    alt="Squish - The SoSquishy Mascot"
                    width={320}
                    height={320}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-cyan-200 rounded-full blur-2xl opacity-30 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-sky-300/30 p-8 sm:p-12 transform hover:scale-[1.02] transition-transform duration-300">
            <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 text-center">
              How It All Began
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                Once upon a time, in a tiny corner of the internet, a single drop of imagination fell from the clouds.
                It landed softly, bounced twice, and said, &quot;I think I&apos;ll stay here.&quot;
              </p>
              <p>
                That little drop became <span className="font-bold text-blue-600">Squish</span> — our adorable blue mascot who believes
                that the world could use a little more softness, a few more smiles, and way more squishy hugs.
              </p>
              <p>
                From that moment, SoSquishy was born. We started with a simple idea: create a space where people could
                find joy in the little things. Whether it&apos;s optimizing images to make websites faster, sharing cute designs,
                or just spreading good vibes — we&apos;re here to make the web a little more wonderful.
              </p>
              <p className="text-xl font-medium text-center text-blue-600 pt-4">
                And honestly? We&apos;re just getting started. 💙
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Squish Philosophy */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-12 text-center">
            The Squish Philosophy
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stay Soft */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-sky-300/30 p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-400/40 transition-all duration-300">
              <div className="text-6xl mb-4 text-center">🫧</div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4 text-center">Stay Soft</h3>
              <p className="text-gray-700 leading-relaxed text-center">
                In a world that can feel sharp and fast, we choose empathy and kindness.
                Being soft isn&apos;t weakness — it&apos;s strength wrapped in a warm hug.
              </p>
            </div>

            {/* Spread Joy */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-sky-300/30 p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-400/40 transition-all duration-300">
              <div className="text-6xl mb-4 text-center">🌈</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4 text-center">Spread Joy</h3>
              <p className="text-gray-700 leading-relaxed text-center">
                Through art, design, and positivity, we aim to brighten your day.
                Every pixel matters. Every smile counts. Let&apos;s make the internet a happier place.
              </p>
            </div>

            {/* Be Yourself */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-sky-300/30 p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-400/40 transition-all duration-300">
              <div className="text-6xl mb-4 text-center">💧</div>
              <h3 className="text-2xl font-bold text-cyan-600 mb-4 text-center">Be Yourself</h3>
              <p className="text-gray-700 leading-relaxed text-center">
                You&apos;re perfectly squishy just the way you are. Embrace your quirks, your colors,
                and your inner droplet. There&apos;s only one you, and that&apos;s your superpower.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sparkle Divider */}
      <div className="relative py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          <div className="text-4xl animate-pulse">✨</div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>
      </div>

      {/* What's Next Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-6">
            What&apos;s Next for SoSquishy?
          </h2>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-sky-300/30 p-8 sm:p-12">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              We&apos;re dreaming big! In the coming months, we&apos;re planning to build a vibrant community
              where fellow squish-lovers can share art, optimize their images for free, and celebrate creativity together.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Plus, we&apos;re working on adorable stickers, cozy merch, and maybe even a Squish plushie or two.
              (Yes, you read that right — huggable Squish is coming!)
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Stay tuned, stay squishy, and thanks for being here. 💙
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg mb-8 text-center">
            Stay Connected
          </h2>

          {/* Social Media Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <a
              href="https://www.facebook.com/profile.php?id=61582866203089"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-center shadow-lg shadow-blue-300/50 hover:shadow-2xl hover:shadow-blue-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              Facebook
            </a>

            <a
              href="https://x.com/SoSquishyIO"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl font-bold text-center shadow-lg shadow-gray-300/50 hover:shadow-2xl hover:shadow-gray-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              X (Twitter)
            </a>

            <a
              href="https://bsky.app/profile/sosquishy.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-bold text-center shadow-lg shadow-sky-300/50 hover:shadow-2xl hover:shadow-sky-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              Bluesky
            </a>

            <a
              href="https://instagram.com/sosquishyio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white rounded-2xl font-bold text-center shadow-lg shadow-purple-300/50 hover:shadow-2xl hover:shadow-purple-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              Instagram
            </a>
          </div>

          {/* Home Button */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl shadow-lg shadow-blue-300/50 hover:shadow-2xl hover:shadow-blue-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              Go Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
