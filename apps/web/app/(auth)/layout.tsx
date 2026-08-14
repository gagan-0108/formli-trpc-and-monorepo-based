'use client';

import Link from 'next/link';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] bg-gradient-radial from-zinc-900/50 to-[#09090b] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <Link href="/" className="mb-8 flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight">Formli</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
