'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Navbar } from '~/components/navbar';
import { Footer } from '~/components/footer';
import { Button } from '~/components/ui/button';

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, UPI, and net banking."
    },
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your billing cycle."
    },
    {
      q: "What happens if I exceed my response limits?",
      a: "For Pro plans, if you exceed response limits, we will still collect the responses but you will need to upgrade or purchase an add-on to view them."
    },
    {
      q: "Do you offer discounts for non-profits?",
      a: "Yes! We offer a 50% discount for registered non-profit organizations. Please contact our support team for more details."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400">
            Choose the perfect plan for your needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-24">
          {/* Free Tier */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col glass-card transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold">₹0</span>
              <span className="text-zinc-400">/forever</span>
            </div>
            <ul className="flex-1 space-y-4 mb-8">
              {['Unlimited forms', 'All 9 field types', 'Unlimited responses', '12 visual themes', 'Basic analytics', 'Shareable links'].map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-800 hover:text-white">
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-zinc-900 rounded-2xl p-8 flex flex-col relative gradient-border glow-border glass-card transition-all duration-300 hover:-translate-y-1 transform md:scale-105 z-10 border border-transparent">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-indigo-400 mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold">₹499</span>
              <span className="text-zinc-400">/mo</span>
            </div>
            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Everything in Free +</span>
              </li>
              {['Welcome & ending screens', 'Email collection', 'Advanced analytics', 'CSV export', 'Custom slugs', 'Response limits', 'Priority support'].map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border-0">
              <Link href="/signup">Start free trial</Link>
            </Button>
          </div>

          {/* Team Tier */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col glass-card transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-2xl font-bold text-white mb-2">Team</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold">₹1,999</span>
              <span className="text-zinc-400">/mo</span>
            </div>
            <ul className="flex-1 space-y-4 mb-8">
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Everything in Pro +</span>
              </li>
              {['Team collaboration', 'API access', 'Webhooks', 'Dedicated support', 'SLA guarantee'].map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-800 hover:text-white">
              <Link href="/signup">Contact sales</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-3xl w-full">
          <h2 className="text-3xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200">
                <button 
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-zinc-800/50"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="text-lg font-medium text-white">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-zinc-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
