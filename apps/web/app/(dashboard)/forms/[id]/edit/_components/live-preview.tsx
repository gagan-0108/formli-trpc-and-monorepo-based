"use client";

import { Star, Smartphone, CheckCircle2 } from "lucide-react";
import type { Theme } from "~/lib/theme";
import { resolveThemeStyles } from "~/lib/theme";

interface LivePreviewProps {
  form: {
    fields?: Array<{
      id: string;
      type: string;
      label: string;
      required: boolean;
      placeholder?: string | null;
      options?: Array<{ label: string; value: string }> | null;
    }>;
  } | null;
  themeId: string | null;
  themes: Theme[] | undefined;
  title: string;
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeButtonText: string;
}

export function LivePreview({
  form,
  themeId,
  themes,
  title,
  welcomeTitle,
  welcomeDescription,
  welcomeButtonText,
}: LivePreviewProps) {
  const theme = themes?.find((t) => t.id === themeId) || null;
  const styles = resolveThemeStyles(theme);
  const { primaryColor, textColor, borderRadius } = styles;
  const bgColor = styles.container.backgroundColor as string;
  const fields = form?.fields || [];
  const firstField = fields[0];

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        Live Preview
      </div>
      
      {/* Phone frame mockup */}
      <div className="w-[340px]">
        <div className="rounded-[2.5rem] border border-white/[0.08] bg-[#0c0c0f] p-3 shadow-2xl relative">
          
          {/* Hardware buttons */}
          <div className="absolute top-24 -left-[2px] w-[2px] h-12 bg-white/10 rounded-l-md" />
          <div className="absolute top-40 -left-[2px] w-[2px] h-12 bg-white/10 rounded-l-md" />
          <div className="absolute top-28 -right-[2px] w-[2px] h-16 bg-white/10 rounded-r-md" />

          {/* Screen */}
          <div 
            className="rounded-[2rem] overflow-hidden aspect-[9/19.5] relative"
            style={{ backgroundColor: bgColor }}
          >
            {/* Dynamic Island / Notch area */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20 pointer-events-none">
              <div className="w-32 h-6 bg-black rounded-b-3xl" />
            </div>

            {/* Content */}
            <div
              className="w-full h-full overflow-y-auto pt-12 pb-8 px-6 flex flex-col relative z-10"
              style={{
                color: textColor,
                fontFamily: theme?.fontFamily || "Inter",
                ...styles.container.backgroundImage ? {
                  backgroundImage: styles.container.backgroundImage as string,
                  backgroundSize: styles.container.backgroundSize as string,
                  backgroundRepeat: styles.container.backgroundRepeat as string,
                } : {},
              }}
            >
              {/* Welcome screen preview */}
              {welcomeTitle ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl font-bold mb-3 leading-tight" style={{ color: textColor }}>
                    {welcomeTitle}
                  </h2>
                  {welcomeDescription && (
                    <p className="text-sm opacity-70 mb-8 leading-relaxed max-w-[240px]">{welcomeDescription}</p>
                  )}
                  <div
                    className="px-8 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-105"
                    style={{ backgroundColor: primaryColor, color: bgColor, borderRadius }}
                  >
                    {welcomeButtonText || "Start"}
                  </div>
                </div>
              ) : firstField ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-xs opacity-50 mb-2 font-mono font-medium tracking-widest">1 → {fields.length}</div>
                  <h3 className="text-[1.1rem] font-bold mb-6 leading-snug" style={{ color: textColor }}>
                    {firstField.label}
                    {firstField.required && <span style={{ color: primaryColor }}> *</span>}
                  </h3>
                  <div className="mb-8">
                    <FirstFieldPreview field={firstField} primaryColor={primaryColor} textColor={textColor} borderRadius={borderRadius} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="px-6 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-md"
                      style={{ backgroundColor: primaryColor, color: bgColor, borderRadius }}
                    >
                      OK <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs opacity-40 font-medium">Press Enter ↵</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm opacity-40 text-center font-medium">Add questions to see preview</p>
                </div>
              )}

              {/* Bottom progress indicator */}
              <div className="mt-auto pt-6">
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: "20%", backgroundColor: primaryColor }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium opacity-40 truncate pr-2 max-w-[60%]">{title || "Untitled Form"}</span>
                  <span className="text-[10px] font-medium opacity-40 whitespace-nowrap">
                    {fields.length} question{fields.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── First Field Miniature Preview ────────────────────────────
function FirstFieldPreview({
  field,
  primaryColor,
  textColor,
  borderRadius,
}: {
  field: { type: string; placeholder?: string | null; options?: Array<{ label: string; value: string }> | null };
  primaryColor: string;
  textColor: string;
  borderRadius: string;
}) {
  if (field.type === "long_text") {
    return (
      <div className="w-full border-b-2 pb-3 text-sm opacity-40 transition-colors" style={{ borderColor: `${primaryColor}40` }}>
        {field.placeholder || "Type your answer here..."}
      </div>
    );
  }

  if (field.type === "rating") {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className="w-7 h-7 transition-all"
            style={{ color: n <= 3 ? primaryColor : `${primaryColor}33` }}
            fill={n <= 3 ? primaryColor : "none"}
          />
        ))}
      </div>
    );
  }

  if (field.type === "single_select" || field.type === "multi_select") {
    return (
      <div className="space-y-3">
        {(field.options || []).slice(0, 4).map((opt, i) => (
          <div
            key={i}
            className="px-4 py-3 text-sm border-2 opacity-70 font-medium transition-all"
            style={{ borderColor: `${primaryColor}40`, borderRadius }}
          >
            {opt.label}
          </div>
        ))}
        {(field.options || []).length > 4 && (
          <div className="text-xs opacity-40 px-1 font-medium">
            + {(field.options || []).length - 4} more options
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full border-b-2 pb-3 text-sm opacity-40 transition-colors" style={{ borderColor: `${primaryColor}40` }}>
      {field.placeholder || "Type here..."}
    </div>
  );
}
