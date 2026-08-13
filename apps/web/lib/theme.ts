import type { CSSProperties } from "react";

// ─── Theme Type ───────────────────────────────────────────────
// Matches the full theme shape from the database / API.
// Using this instead of `as any` across the app.
export interface Theme {
  id: string;
  name: string;
  category: string;
  coverEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  backgroundPattern?: string | null;
  backgroundImage?: string | null;
  createdAt?: Date | null;
}

// ─── Category Labels ──────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  anime: "🎌 Anime",
  cars: "🏎️ Cars & Speed",
  gaming: "🎮 Gaming",
  startup: "🚀 Startups",
  movies: "🎬 Movies",
  minimal: "✨ Minimal",
  space: "🌌 Space",
} as const;

// ─── Theme Style Resolver ─────────────────────────────────────
// Single source of truth for converting a theme into CSS styles.
// Handles layering SVG doodle backgrounds on top of CSS patterns.

interface ThemeStyles {
  container: CSSProperties;
  primaryColor: string;
  textColor: string;
  borderRadius: string;
}

const DEFAULT_STYLES: ThemeStyles = {
  container: {
    backgroundColor: "#000000",
    color: "#fafafa",
  },
  primaryColor: "#fafafa",
  textColor: "#fafafa",
  borderRadius: "8px",
};

export function resolveThemeStyles(theme: Theme | null | undefined): ThemeStyles {
  if (!theme) return DEFAULT_STYLES;

  const bgPattern = theme.backgroundPattern;
  const bgImage = theme.backgroundImage;

  const hasImage = bgImage && bgImage !== "none";
  const hasPattern = bgPattern && bgPattern !== "none";

  // Build layered backgroundImage: SVG on top, CSS gradient beneath
  const layers = [
    hasImage ? bgImage : null,
    hasPattern ? bgPattern : null,
  ].filter(Boolean);

  const backgroundImage = layers.length > 0 ? layers.join(", ") : undefined;

  // Dynamic backgroundSize: one size per layer
  let backgroundSize: string | undefined;
  if (hasImage && hasPattern) {
    backgroundSize = "200px 200px, 24px 24px";
  } else if (hasImage) {
    backgroundSize = "200px 200px";
  } else if (hasPattern) {
    backgroundSize = "24px 24px";
  }

  return {
    container: {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
      fontFamily: theme.fontFamily || undefined,
      backgroundImage,
      backgroundSize,
      backgroundRepeat: backgroundImage ? "repeat" : undefined,
    },
    primaryColor: theme.primaryColor,
    textColor: theme.textColor,
    borderRadius: theme.borderRadius || "8px",
  };
}

// ─── Card Header Styles ───────────────────────────────────────
// Used by dashboard and explore page for theme preview strips.
export function resolveCardHeaderStyles(theme: Theme | null | undefined): CSSProperties {
  if (!theme) return {};

  const { container } = resolveThemeStyles(theme);
  return {
    backgroundColor: container.backgroundColor,
    backgroundImage: container.backgroundImage as string | undefined,
    backgroundSize: container.backgroundSize as string | undefined,
    backgroundRepeat: container.backgroundRepeat as string | undefined,
  };
}

// ─── Group Themes by Category ─────────────────────────────────
export function groupThemesByCategory(themes: Theme[]): Record<string, Theme[]> {
  return themes.reduce<Record<string, Theme[]>>((acc, t) => {
    const cat = t.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});
}
