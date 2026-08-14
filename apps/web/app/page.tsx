"use client";

import Link from "next/link";
import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "~/providers/auth-provider";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? "/dashboard" : "/signup";
  const ctaText = isAuthenticated ? "Go to dashboard" : "Start building";
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero — dead simple */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 dot-grid">
        <div className="relative z-10 max-w-3xl mx-auto text-center page-enter">
          <p className="text-sm tracking-widest uppercase text-zinc-500 mb-6">
            Form Builder
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
            Build forms
            <br />
            <span className="text-zinc-500">people fill.</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto mb-12 leading-relaxed">
            Create, publish, and analyze beautiful forms.
            <br className="hidden sm:block" />
            No clutter. No noise. Just forms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ctaHref}>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-zinc-200 text-base px-8 h-12 rounded-full group"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-base px-8 h-12 rounded-full"
              >
                Explore forms
              </Button>
            </Link>
          </div>
        </div>

        {/* Subtle bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Features — 3 column, ultra minimal */}
      <section className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm tracking-widest uppercase text-zinc-600 mb-12 text-center">
            Inspired by the best
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                num: "01",
                title: "One question at a time",
                desc: "Like Typeform — each question gets a full screen. No overwhelming forms.",
              },
              {
                num: "02",
                title: "Welcome & ending screens",
                desc: "Set the tone with a welcome screen. Close with a custom thank-you message and CTA.",
              },
              {
                num: "03",
                title: "Keyboard navigation",
                desc: "Respondents press Enter to advance. Fast, intuitive, no mouse needed.",
              },
              {
                num: "04",
                title: "9 field types",
                desc: "Text, email, number, rating, selects, checkbox, date — everything you need.",
              },
              {
                num: "05",
                title: "Visual themes",
                desc: "12 creative themes with doodle backgrounds — Anime, Cars, Gaming, Movies, and more.",
              },
              {
                num: "06",
                title: "Analytics & CSV export",
                desc: "Track responses in real-time. View charts. Export everything to CSV.",
              },
            ].map((f) => (
              <div key={f.num} className="group">
                <span className="text-xs text-zinc-600 font-mono">{f.num}</span>
                <h3 className="text-lg font-semibold mt-2 mb-3">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — stripped */}
      <section className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm tracking-widest uppercase text-zinc-600 mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "Create", desc: "Add questions, set up your welcome screen, pick a theme." },
              { step: "Publish", desc: "Get a shareable link. Collect emails from respondents." },
              { step: "Analyze", desc: "View responses, charts, and export to CSV." },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-zinc-700 mb-2">{item.step}</div>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
            Ready?
          </h2>
          <p className="text-zinc-500 mb-10">
            Free to use. No credit card. No bullshit.
          </p>
          <Link href={ctaHref}>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 text-base px-10 h-12 rounded-full"
            >
              {isAuthenticated ? "Go to dashboard" : "Get started free"}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
