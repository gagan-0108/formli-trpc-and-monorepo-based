"use client";

import { useState } from "react";
import { Palette, ChevronDown } from "lucide-react";
import type { Theme } from "~/lib/theme";
import { CATEGORY_LABELS, groupThemesByCategory } from "~/lib/theme";

interface ThemeDropdownProps {
  themes: Theme[] | undefined;
  themeId: string | null;
  setThemeId: (id: string | null) => void;
}

export function ThemeDropdown({ themes, themeId, setThemeId }: ThemeDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedTheme = themes?.find((t) => t.id === themeId);
  const groups = themes ? groupThemesByCategory(themes) : {};

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-[#0f0f12] hover:bg-white/[0.02] transition-colors text-sm"
      >
        {selectedTheme ? (
          <>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: selectedTheme.primaryColor }} />
              <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: selectedTheme.backgroundColor }} />
            </div>
            <span className="text-xs font-medium text-zinc-300">{selectedTheme.coverEmoji} {selectedTheme.name}</span>
          </>
        ) : (
          <>
            <Palette className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-300">Theme</span>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-[340px] max-h-[70vh] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0c0c0f] shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* No theme */}
            <button
              onClick={() => { setThemeId(null); setOpen(false); }}
              className={`w-full text-left p-3 rounded-xl border transition-all mb-4 flex flex-col gap-2 ${
                !themeId ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/[0.06] bg-black/20 hover:bg-white/[0.04] hover:border-white/[0.1]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs shadow-inner">
                  ⬛
                </div>
                <div>
                  <div className={`text-sm font-medium ${!themeId ? "text-indigo-400" : "text-zinc-200"}`}>No Theme</div>
                  <div className="text-xs text-zinc-500">Default Black & White</div>
                </div>
              </div>
            </button>

            {Object.entries(groups).map(([cat, catThemes]) => (
              <div key={cat} className="mb-5 last:mb-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 px-1">
                  {CATEGORY_LABELS[cat] || cat}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {catThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => { setThemeId(theme.id); setOpen(false); }}
                      className={`text-left p-2.5 rounded-xl border transition-all flex flex-col gap-2 ${
                        themeId === theme.id ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/[0.06] bg-black/20 hover:bg-white/[0.04] hover:border-white/[0.1]"
                      }`}
                    >
                      <div className="flex gap-1 h-6 w-full rounded-md overflow-hidden shadow-sm">
                        <div className="flex-1" style={{ backgroundColor: theme.primaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: theme.secondaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: theme.backgroundColor }} />
                      </div>
                      <div className="flex items-center gap-1.5 px-0.5">
                        <span className="text-sm">{theme.coverEmoji}</span>
                        <span className={`text-xs font-medium truncate ${themeId === theme.id ? "text-indigo-400" : "text-zinc-300"}`}>{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
