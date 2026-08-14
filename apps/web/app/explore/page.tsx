'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '~/components/navbar';
import { Footer } from '~/components/footer';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import { trpc } from '~/trpc/client';
import { resolveCardHeaderStyles } from '~/lib/theme';
import type { Theme } from '~/lib/theme';
import { Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExplorePage() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = trpc.form.listPublic.useQuery({ page, limit });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Explore public forms
          </h1>
          <p className="text-lg text-zinc-400">
            Discover forms created by the community
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                <Skeleton className="h-16 w-full bg-zinc-800" />
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <Skeleton className="h-6 w-3/4 bg-zinc-800" />
                  <Skeleton className="h-4 w-full bg-zinc-800" />
                  <Skeleton className="h-4 w-5/6 bg-zinc-800" />
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <Skeleton className="h-4 w-24 bg-zinc-800" />
                    <Skeleton className="h-9 w-28 bg-zinc-800 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <p className="text-red-400">Failed to load public forms. Please try again later.</p>
          </div>
        ) : !data?.forms || data.forms.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col items-center">
            <FileText className="w-16 h-16 text-zinc-600 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No forms found</h3>
            <p className="text-zinc-400">Check back later for new community forms.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {data.forms.map((form) => (
                <div key={form.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col glass-card transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700">
                  <div 
                    className="h-16 w-full"
                    style={resolveCardHeaderStyles(form.theme as Theme)}
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{form.title}</h3>
                    <p className="text-zinc-400 text-sm mb-6 line-clamp-2 flex-1">
                      {form.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-zinc-500 text-sm">
                        <Users className="w-4 h-4 mr-1.5" />
                        <span>{form.responseCount} responses</span>
                      </div>
                      <Button asChild size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 transition-colors">
                        <Link href={`/f/${form.slug}`}>Fill this form</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-zinc-400 font-medium">
                  Page {page} of {data.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
