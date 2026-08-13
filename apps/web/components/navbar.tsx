"use client";

import Link from "next/link";
import { useAuth } from "~/providers/auth-provider";
import { Button } from "~/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function FormliLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-[17px] font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
        formli
      </span>
    </Link>
  );
}

function UserDropdown({ email, logout }: { email: string; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full pl-0.5 pr-2.5 py-0.5 hover:bg-white/5 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
          {initial}
        </div>
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2.5 border-b border-white/[0.06]">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm text-zinc-300 truncate mt-0.5">{email}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <FormliLogo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/explore"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Pricing
            </Link>
            <div className="w-px h-5 bg-white/10 mx-2" />
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">
                        Dashboard
                      </Button>
                    </Link>
                    <UserDropdown email={user.email} logout={logout} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white border-0 rounded-full px-5 text-xs font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                      >
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-zinc-950/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/explore"
              className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <div className="h-px bg-white/[0.06] my-2" />
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user && (
                      <div className="flex items-center gap-2.5 px-3 py-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-zinc-500 truncate flex-1">{user.email}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="block w-full text-left px-3 py-2.5 text-sm text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-3 pt-1">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white border-0 rounded-full font-medium shadow-lg shadow-indigo-500/25"
                      >
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
