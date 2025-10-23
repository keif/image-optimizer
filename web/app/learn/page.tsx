import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Gauge, Code2, ArrowRight } from "lucide-react";

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
                Optimize your images and sprite sheets with ease and speed.
              </h1>
              <p className="text-xl sm:text-2xl text-sky-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                SoSquishy is your go-to service for lightweight, efficient image optimization that keeps your web and game projects fast and visually delightful.
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
                In the fast-paced world of web and game development, every byte counts. SoSquishy was born from a simple idea: make image and sprite sheet optimization effortless, effective, and accessible.
              </p>
              <p>
                Our mascot, <span className="font-bold text-blue-600">Squish</span>, embodies the perfect balance of performance and charm — a little drop that keeps your visuals crisp while keeping file sizes light.
              </p>
              <p>
                With a focus on clean compression and smart optimization, SoSquishy helps developers and creators deliver faster-loading, visually delightful experiences without the hassle.
              </p>
              <p className="text-xl font-medium text-center text-blue-600 pt-4">
                Fast, simple, and a bit playful — that’s the SoSquishy way. 💙
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Squish Philosophy - REDESIGNED */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with subtitle */}
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
              The Squish Philosophy
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              At SoSquishy, performance and personality go hand in hand. We believe optimization should be smart, measurable, and never boring.
            </p>
          </div>

          {/* Three Philosophy Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Smart Compression */}
            <div className="group relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-white/20 p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Smart Compression
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Advanced image techniques powered by WebP, AVIF, and intelligent sprite merging. Clean, efficient optimization that preserves visual quality while dramatically reducing file sizes.
              </p>
            </div>

            {/* Performance First */}
            <div className="group relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-white/20 p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 group-hover:scale-110">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Performance First
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Real speed improvements you can measure. Achieve 50-70% faster load times with optimized assets that improve Core Web Vitals and user experience metrics.
              </p>
            </div>

            {/* Designed for Developers */}
            <div className="group relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl border border-white/20 p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300 group-hover:scale-110">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Designed for Developers
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                RESTful APIs, CLI tools, and seamless integrations that fit into your workflow. Optimization should be effortless, not an engineering project.
              </p>
            </div>
          </div>

          {/* Section Footer CTA */}
          <div className="flex justify-center">
            <Link
              href="/articles"
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white text-lg font-medium transition-colors"
            >
              <span>Explore the technical details</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sparkle Divider */}
      <div className="relative py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          <Sparkles className="w-8 h-8 text-white/80 animate-pulse" />
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
              We&apos;re building smarter optimization tools that adapt to your needs, whether you&apos;re working on web projects or game assets.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Expect enhanced compression algorithms, seamless export options, and integrations designed to keep your workflows fast and simple.
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Stay tuned for a faster, lighter, and more playful web. 💙
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg mb-8">
            Ready to Optimize?
          </h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Start compressing images and sprite sheets with Squish. Fast, simple, and free.
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl shadow-lg shadow-blue-300/50 hover:shadow-2xl hover:shadow-blue-400/60 hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
