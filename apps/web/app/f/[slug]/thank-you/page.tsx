"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  // This page is a fallback — the main thank-you is now shown
  // inline in the form renderer. This handles direct URL visits.
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md page-enter">
        <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center mx-auto mb-8">
          <Check className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold mb-3">Thank you</h1>
        <p className="text-zinc-500 mb-10">
          Your response has been submitted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6">
              Create your own form
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="text-zinc-500 hover:text-white">
              Explore forms
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="mt-16">
          <a href="/" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            formli
          </a>
        </div>
      </div>
    </div>
  );
}
