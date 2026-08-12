import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import {
  usersTable,
  formsTable,
  formFieldsTable,
  formResponsesTable,
  fieldResponsesTable,
  themesTable,
} from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// ===================== CREATIVE THEMES =====================

// Helper to create SVG data URL for CSS background-image
function svgBg(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const THEMES = [
  // --- Anime ---
  {
    name: "Anime Pop",
    category: "anime",
    coverEmoji: "🌸",
    primaryColor: "#EC4899",
    secondaryColor: "#F472B6",
    backgroundColor: "#1A0B18",
    textColor: "#FDF2F8",
    accentColor: "#F9A8D4",
    fontFamily: "Inter",
    borderRadius: "16px",
    backgroundPattern: "radial-gradient(circle, rgba(236,72,153,0.06) 1px, transparent 1px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".07"><path d="M30 40c-4-8 4-16 10-12s2 14-6 16c-2 0-4-2-4-4z" fill="#EC4899"/><path d="M150 30c-3-7 5-14 10-10s1 12-7 14" fill="#F472B6"/><path d="M90 80c-4-8 4-16 10-12s2 14-6 16" fill="#F9A8D4"/><path d="M170 120c-3-7 5-14 10-10s1 12-7 14" fill="#EC4899"/><path d="M50 150c-4-8 4-16 10-12s2 14-6 16" fill="#F472B6"/><path d="M120 170c-3-7 5-14 10-10" fill="#F9A8D4"/><circle cx="20" cy="100" r="1.5" fill="#EC4899"/><circle cx="80" cy="20" r="1" fill="#F472B6"/><circle cx="140" cy="80" r="1.5" fill="#F9A8D4"/><circle cx="180" cy="170" r="1.5" fill="#F472B6"/></g></svg>`),
  },
  {
    name: "Shonen Battle",
    category: "anime",
    coverEmoji: "⚔️",
    primaryColor: "#EF4444",
    secondaryColor: "#F97316",
    backgroundColor: "#1A0A0A",
    textColor: "#FEF2F2",
    accentColor: "#FCA5A5",
    fontFamily: "Inter",
    borderRadius: "8px",
    backgroundPattern: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(239,68,68,0.03) 20px, rgba(239,68,68,0.03) 21px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".06" stroke-linecap="round"><line x1="0" y1="40" x2="60" y2="0" stroke="#EF4444" stroke-width="1.5"/><line x1="80" y1="200" x2="140" y2="120" stroke="#F97316" stroke-width="1"/><line x1="160" y1="60" x2="200" y2="20" stroke="#EF4444" stroke-width="1.5"/><path d="M100 50l5-15 5 15-15-10h20z" fill="#EF4444"/><path d="M160 150l4-12 4 12-12-8h16z" fill="#F97316"/></g></svg>`),
  },

  // --- Cars ---
  {
    name: "Racing Red",
    category: "cars",
    coverEmoji: "🏎️",
    primaryColor: "#DC2626",
    secondaryColor: "#991B1B",
    backgroundColor: "#0A0A0A",
    textColor: "#FAFAFA",
    accentColor: "#F87171",
    fontFamily: "Inter",
    borderRadius: "4px",
    backgroundPattern: "repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".05"><rect x="0" y="0" width="25" height="25" fill="#DC2626"/><rect x="50" y="0" width="25" height="25" fill="#DC2626"/><rect x="25" y="25" width="25" height="25" fill="#DC2626"/><rect x="75" y="25" width="25" height="25" fill="#DC2626"/><rect x="100" y="0" width="25" height="25" fill="#DC2626"/><rect x="150" y="0" width="25" height="25" fill="#DC2626"/><rect x="125" y="25" width="25" height="25" fill="#DC2626"/><rect x="175" y="25" width="25" height="25" fill="#DC2626"/></g></svg>`),
  },
  {
    name: "Midnight Drive",
    category: "cars",
    coverEmoji: "🌃",
    primaryColor: "#3B82F6",
    secondaryColor: "#1D4ED8",
    backgroundColor: "#0A0F1A",
    textColor: "#DBEAFE",
    accentColor: "#60A5FA",
    fontFamily: "Inter",
    borderRadius: "8px",
    backgroundPattern: "linear-gradient(0deg, rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><g opacity=".06"><rect x="20" y="100" width="15" height="100" fill="#3B82F6" rx="1"/><rect x="40" y="70" width="12" height="130" fill="#1D4ED8" rx="1"/><rect x="60" y="90" width="18" height="110" fill="#3B82F6" rx="1"/><rect x="100" y="60" width="10" height="140" fill="#60A5FA" rx="1"/><rect x="150" y="50" width="8" height="150" fill="#1D4ED8" rx="1"/><rect x="200" y="55" width="25" height="145" fill="#60A5FA" rx="1"/><rect x="260" y="65" width="18" height="135" fill="#1D4ED8" rx="1"/></g></svg>`),
  },

  // --- Gaming ---
  {
    name: "Retro Arcade",
    category: "gaming",
    coverEmoji: "🕹️",
    primaryColor: "#A855F7",
    secondaryColor: "#7C3AED",
    backgroundColor: "#0F0A1A",
    textColor: "#F3E8FF",
    accentColor: "#C084FC",
    fontFamily: "Inter",
    borderRadius: "4px",
    backgroundPattern: "repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(168,85,247,0.04) 15px, rgba(168,85,247,0.04) 16px), repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(168,85,247,0.04) 15px, rgba(168,85,247,0.04) 16px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".07"><rect x="20" y="100" width="6" height="6" fill="#A855F7"/><rect x="28" y="100" width="6" height="6" fill="#A855F7"/><rect x="24" y="94" width="6" height="6" fill="#A855F7"/><rect x="24" y="106" width="6" height="6" fill="#A855F7"/><path d="M150 25l6 6-6 6-6-6z" fill="#C084FC"/><rect x="80" y="40" width="8" height="8" rx="1" fill="#7C3AED"/><circle cx="100" cy="120" r="5" fill="none" stroke="#7C3AED" stroke-width="1.5"/><path d="M50 160l6 6-6 6-6-6z" fill="#A855F7"/></g></svg>`),
  },
  {
    name: "Neon Cyberpunk",
    category: "gaming",
    coverEmoji: "💜",
    primaryColor: "#06B6D4",
    secondaryColor: "#0891B2",
    backgroundColor: "#030712",
    textColor: "#ECFEFF",
    accentColor: "#22D3EE",
    fontFamily: "Inter",
    borderRadius: "2px",
    backgroundPattern: "linear-gradient(0deg, rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".06" fill="none"><path d="M20 20h30v10h-10v20h-10v-20h-10z" stroke="#06B6D4" stroke-width="1"/><circle cx="80" cy="30" r="3" stroke="#22D3EE" stroke-width=".8"/><line x1="83" y1="30" x2="120" y2="30" stroke="#06B6D4" stroke-width=".5"/><path d="M140 15v30h20v-10h-10v-20z" stroke="#0891B2" stroke-width="1"/><rect x="80" y="110" width="20" height="20" stroke="#0891B2" stroke-width=".8"/><circle cx="90" cy="120" r="4" stroke="#22D3EE" stroke-width=".5"/></g></svg>`),
  },

  // --- Startups ---
  {
    name: "Startup Launch",
    category: "startup",
    coverEmoji: "🚀",
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    backgroundColor: "#0B1A14",
    textColor: "#ECFDF5",
    accentColor: "#34D399",
    fontFamily: "Inter",
    borderRadius: "10px",
    backgroundPattern: "radial-gradient(circle, rgba(16,185,129,0.04) 1px, transparent 1px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".06"><path d="M50 80l5-30 5 30c-3 2-7 2-10 0z" fill="#10B981"/><path d="M45 80h15" stroke="#34D399" stroke-width="1"/><circle cx="55" cy="55" r="2" fill="#10B981"/><path d="M160 40l4-25 4 25c-2 2-6 2-8 0z" fill="#34D399"/><circle cx="120" cy="140" r="8" fill="none" stroke="#10B981" stroke-width=".8"/><circle cx="120" cy="140" r="3" fill="#10B981" opacity=".5"/></g></svg>`),
  },
  {
    name: "Product Hunt",
    category: "startup",
    coverEmoji: "🔥",
    primaryColor: "#F97316",
    secondaryColor: "#EA580C",
    backgroundColor: "#1A130B",
    textColor: "#FFF7ED",
    accentColor: "#FB923C",
    fontFamily: "Inter",
    borderRadius: "12px",
    backgroundPattern: "radial-gradient(circle, rgba(249,115,22,0.05) 1px, transparent 1px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".06"><path d="M40 60l8-20 8 20z" fill="#F97316"/><path d="M36 62h24" stroke="#FB923C" stroke-width="1"/><path d="M130 40l6-15 6 15z" fill="#EA580C"/><path d="M127 42h18" stroke="#F97316" stroke-width="1"/><path d="M80 130l8-20 8 20z" fill="#FB923C"/><circle cx="30" cy="150" r="4" fill="none" stroke="#F97316" stroke-width="1"/></g></svg>`),
  },

  // --- Movies ---
  {
    name: "Hollywood",
    category: "movies",
    coverEmoji: "🎬",
    primaryColor: "#EAB308",
    secondaryColor: "#CA8A04",
    backgroundColor: "#0F0D08",
    textColor: "#FEFCE8",
    accentColor: "#FDE047",
    fontFamily: "Inter",
    borderRadius: "8px",
    backgroundPattern: "radial-gradient(circle, rgba(234,179,8,0.03) 1.5px, transparent 1.5px)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".06"><rect x="10" y="20" width="30" height="50" rx="2" fill="none" stroke="#EAB308" stroke-width="1"/><rect x="12" y="22" width="8" height="6" fill="#EAB308"/><rect x="12" y="30" width="8" height="6" fill="#EAB308"/><rect x="30" y="22" width="8" height="6" fill="#EAB308"/><rect x="30" y="30" width="8" height="6" fill="#EAB308"/><path d="M100 20l3 9h10l-8 6 3 9-8-6-8 6 3-9-8-6h10z" fill="#FDE047"/><path d="M160 60l2 7h7l-6 4 2 7-5-4-5 4 2-7-6-4h7z" fill="#EAB308"/></g></svg>`),
  },
  {
    name: "Film Noir",
    category: "movies",
    coverEmoji: "🎞️",
    primaryColor: "#A1A1AA",
    secondaryColor: "#71717A",
    backgroundColor: "#09090B",
    textColor: "#FAFAFA",
    accentColor: "#D4D4D8",
    fontFamily: "Inter",
    borderRadius: "0px",
    backgroundPattern: "none",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"><g opacity=".04"><line x1="15" y1="0" x2="15" y2="200" stroke="#A1A1AA" stroke-width=".5" stroke-dasharray="3 8"/><line x1="35" y1="10" x2="35" y2="200" stroke="#71717A" stroke-width=".5" stroke-dasharray="2 12"/><line x1="55" y1="5" x2="55" y2="200" stroke="#D4D4D8" stroke-width=".5" stroke-dasharray="4 10"/><line x1="75" y1="15" x2="75" y2="200" stroke="#A1A1AA" stroke-width=".5" stroke-dasharray="2 15"/><line x1="90" y1="0" x2="90" y2="200" stroke="#71717A" stroke-width=".5" stroke-dasharray="3 9"/></g></svg>`),
  },

  // --- Minimal ---
  {
    name: "Minimal Snow",
    category: "minimal",
    coverEmoji: "❄️",
    primaryColor: "#1E293B",
    secondaryColor: "#475569",
    backgroundColor: "#FFFFFF",
    textColor: "#0F172A",
    accentColor: "#64748B",
    fontFamily: "Inter",
    borderRadius: "8px",
    backgroundPattern: "none",
    backgroundImage: null,
  },
  {
    name: "Deep Space",
    category: "space",
    coverEmoji: "🌌",
    primaryColor: "#6366F1",
    secondaryColor: "#4F46E5",
    backgroundColor: "#07051A",
    textColor: "#E0E7FF",
    accentColor: "#818CF8",
    fontFamily: "Inter",
    borderRadius: "12px",
    backgroundPattern: "radial-gradient(1px 1px at 20px 30px, rgba(99,102,241,0.15), transparent), radial-gradient(1px 1px at 80px 60px, rgba(129,140,248,0.1), transparent), radial-gradient(1px 1px at 140px 20px, rgba(99,102,241,0.12), transparent)",
    backgroundImage: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g opacity=".08"><circle cx="20" cy="30" r="1.5" fill="#818CF8"/><circle cx="60" cy="15" r="1" fill="#6366F1"/><circle cx="100" cy="45" r="2" fill="#818CF8"/><circle cx="140" cy="20" r="1" fill="#6366F1"/><circle cx="180" cy="50" r="1.5" fill="#4F46E5"/><circle cx="30" cy="80" r="1" fill="#818CF8"/><circle cx="110" cy="120" r="2" fill="#818CF8"/><circle cx="170" cy="140" r="1" fill="#6366F1"/><circle cx="40" cy="170" r="1.5" fill="#818CF8"/><circle cx="130" cy="165" r="1.5" fill="#4F46E5"/><circle cx="55" cy="100" r="6" fill="none" stroke="#6366F1" stroke-width=".5"/><circle cx="160" cy="60" r="4" fill="none" stroke="#4F46E5" stroke-width=".5"/></g></svg>`),
  },
];

// ===================== SEED FUNCTION =====================

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. Insert themes
  console.log("🎨 Inserting creative themes...");
  const insertedThemes = await db.insert(themesTable).values(THEMES).returning();
  console.log(`   ✅ ${insertedThemes.length} themes inserted`);
  for (const t of insertedThemes) {
    console.log(`      ${t.coverEmoji} ${t.name} (${t.category})`);
  }

  // 2. Create demo user
  console.log("\n👤 Creating demo user...");
  const passwordHash = await bcrypt.hash("demo123", 10);
  let userId = "";

  const [insertedUser] = await db
    .insert(usersTable)
    .values({
      fullName: "Demo User",
      email: "demo@formli.com",
      passwordHash,
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  if (insertedUser) {
    userId = insertedUser.id;
  } else {
    console.log("   ⚠️ Demo user already exists, fetching...");
    const { eq } = await import("drizzle-orm");
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, "demo@formli.com"))
      .limit(1);
    if (!existing) {
      console.error("   ❌ Failed to find or create demo user");
      process.exit(1);
    }
    userId = existing.id;
  }
  console.log(`   ✅ Demo user: demo@formli.com / demo123 (ID: ${userId})`);

  // 2b. Create test user
  console.log("\n👤 Creating test user...");
  const testPasswordHash = await bcrypt.hash("test123", 10);
  await db
    .insert(usersTable)
    .values({
      fullName: "Test User",
      email: "test@gmail.com",
      passwordHash: testPasswordHash,
      emailVerified: true,
    })
    .onConflictDoNothing();
  console.log("   ✅ Test user: test@gmail.com / test123");

  // 3. Create sample forms
  console.log("\n📝 Creating sample forms...\n");

  const animeTheme = insertedThemes.find((t) => t.name === "Anime Pop")!;
  const hollywoodTheme = insertedThemes.find((t) => t.name === "Hollywood")!;
  const startupTheme = insertedThemes.find((t) => t.name === "Startup Launch")!;
  const racingTheme = insertedThemes.find((t) => t.name === "Racing Red")!;
  const arcadeTheme = insertedThemes.find((t) => t.name === "Retro Arcade")!;

  // ---- FORM 1: Movie Survey ----
  const [movieForm] = await db
    .insert(formsTable)
    .values({
      userId,
      title: "🎬 Ultimate Movie Buff Survey",
      description: "Tell us about your movie preferences! From genres to all-time favorites.",
      slug: "movie-survey",
      status: "published",
      visibility: "public",
      themeId: hollywoodTheme.id,
      welcomeTitle: "Welcome, cinephile! 🍿",
      welcomeDescription: "This quick survey is about your movie tastes. Takes 2 minutes.",
      welcomeButtonText: "Roll camera",
      thankYouTitle: "That's a wrap! 🎬",
      thankYouMessage: "Thanks for sharing your movie picks with us.",
      publishedAt: new Date(),
    })
    .returning();

  const movieFields = await db
    .insert(formFieldsTable)
    .values([
      { formId: movieForm!.id, type: "short_text" as const, label: "What is your name?", placeholder: "Enter your name", required: true, order: 0 },
      { formId: movieForm!.id, type: "email" as const, label: "Your email address", placeholder: "name@example.com", required: true, order: 1 },
      { formId: movieForm!.id, type: "single_select" as const, label: "What's your favorite movie genre?", required: true, order: 2, options: [{ label: "Action", value: "action" }, { label: "Comedy", value: "comedy" }, { label: "Drama", value: "drama" }, { label: "Sci-Fi", value: "scifi" }, { label: "Horror", value: "horror" }, { label: "Romance", value: "romance" }] },
      { formId: movieForm!.id, type: "rating" as const, label: "Rate your overall movie-watching experience this year", required: true, order: 3 },
      { formId: movieForm!.id, type: "long_text" as const, label: "What's your all-time favorite movie and why?", placeholder: "Tell us about your favorite movie...", required: false, order: 4 },
      { formId: movieForm!.id, type: "number" as const, label: "How many movies do you watch per month?", placeholder: "0", required: false, order: 5 },
    ])
    .returning();
  console.log("   ✅ Movie Survey created (Hollywood theme)");

  // ---- FORM 2: Anime Poll ----
  const [animeForm] = await db
    .insert(formsTable)
    .values({
      userId,
      title: "🌸 Anime Fan Poll 2025",
      description: "Which anime are you watching this season? Share your top picks!",
      slug: "anime-poll",
      status: "published",
      visibility: "public",
      themeId: animeTheme.id,
      welcomeTitle: "Konnichiwa, fellow weeb! 🌸",
      welcomeDescription: "Tell us about your anime preferences. Senpai will notice you.",
      welcomeButtonText: "Let's go!",
      thankYouTitle: "Arigatou! 🎌",
      thankYouMessage: "Your anime picks have been recorded. See you next season!",
      publishedAt: new Date(),
    })
    .returning();

  const animeFields = await db
    .insert(formFieldsTable)
    .values([
      { formId: animeForm!.id, type: "short_text" as const, label: "What's your anime name / alias?", placeholder: "Your weeb name", required: true, order: 0 },
      { formId: animeForm!.id, type: "multi_select" as const, label: "Which genres do you enjoy?", required: true, order: 1, options: [{ label: "Shonen", value: "shonen" }, { label: "Seinen", value: "seinen" }, { label: "Slice of Life", value: "sol" }, { label: "Isekai", value: "isekai" }, { label: "Mecha", value: "mecha" }, { label: "Romance", value: "romance" }] },
      { formId: animeForm!.id, type: "single_select" as const, label: "Favorite anime of all time?", required: true, order: 2, options: [{ label: "Attack on Titan", value: "aot" }, { label: "One Piece", value: "one_piece" }, { label: "Naruto", value: "naruto" }, { label: "Demon Slayer", value: "demon_slayer" }, { label: "Fullmetal Alchemist", value: "fma" }, { label: "Death Note", value: "death_note" }] },
      { formId: animeForm!.id, type: "rating" as const, label: "Rate this anime season (Spring 2025)", required: true, order: 3 },
      { formId: animeForm!.id, type: "checkbox" as const, label: "Do you read manga too?", required: false, order: 4 },
    ])
    .returning();
  console.log("   ✅ Anime Poll created (Anime Pop theme)");

  // ---- FORM 3: Startup Feedback ----
  const [startupForm] = await db
    .insert(formsTable)
    .values({
      userId,
      title: "🚀 Startup Product Feedback",
      description: "Help us improve our product! Share your honest feedback.",
      slug: "startup-feedback",
      status: "published",
      visibility: "public",
      themeId: startupTheme.id,
      collectEmail: true,
      welcomeTitle: "We'd love your feedback 🚀",
      welcomeDescription: "Help us build a better product. Takes 3 minutes.",
      welcomeButtonText: "Give feedback",
      thankYouTitle: "You're awesome! 🎉",
      thankYouMessage: "Your feedback will directly shape our roadmap. Thank you!",
      thankYouButtonText: "Visit our website",
      thankYouButtonUrl: "https://formli.dev",
      publishedAt: new Date(),
    })
    .returning();

  const startupFields = await db
    .insert(formFieldsTable)
    .values([
      { formId: startupForm!.id, type: "email" as const, label: "Your email", placeholder: "you@company.com", required: true, order: 0 },
      { formId: startupForm!.id, type: "short_text" as const, label: "Your company / role", placeholder: "CEO at Acme Inc.", required: false, order: 1 },
      { formId: startupForm!.id, type: "rating" as const, label: "How would you rate our product?", required: true, order: 2 },
      { formId: startupForm!.id, type: "single_select" as const, label: "How did you hear about us?", required: true, order: 3, options: [{ label: "Twitter / X", value: "twitter" }, { label: "Product Hunt", value: "producthunt" }, { label: "Friend / Colleague", value: "referral" }, { label: "Google Search", value: "google" }, { label: "Other", value: "other" }] },
      { formId: startupForm!.id, type: "long_text" as const, label: "What's one thing we could improve?", placeholder: "Be honest, we love feedback!", required: false, order: 4 },
      { formId: startupForm!.id, type: "date" as const, label: "When did you first try our product?", required: false, order: 5 },
      { formId: startupForm!.id, type: "checkbox" as const, label: "Would you recommend us to a friend?", required: false, order: 6 },
    ])
    .returning();
  console.log("   ✅ Startup Feedback created (Startup Launch theme)");

  // ---- FORM 4: Draft ----
  await db.insert(formsTable).values({
    userId,
    title: "📋 Internal Team Survey (Draft)",
    description: "A draft form for internal use — not yet published.",
    slug: "team-survey-draft",
    status: "draft",
    visibility: "unlisted",
    themeId: arcadeTheme.id,
  });
  console.log("   ✅ Draft form created");

  // 4. Sample responses
  console.log("\n💬 Creating sample responses...\n");

  // Movie responses
  const movieResps = [
    { name: "Alice Cooper", email: "alice@test.com", genre: "scifi", rating: "5", movie: "Interstellar — the visuals and soundtrack are unmatched", count: "8" },
    { name: "Bob Martin", email: "bob@test.com", genre: "action", rating: "4", movie: "The Dark Knight — Heath Ledger's Joker is legendary", count: "12" },
    { name: "Carol White", email: "carol@test.com", genre: "comedy", rating: "3", movie: "The Grand Budapest Hotel", count: "4" },
    { name: "David Kim", email: "david@test.com", genre: "drama", rating: "5", movie: "Parasite — a masterpiece of storytelling", count: "6" },
    { name: "Eva Green", email: "eva@test.com", genre: "horror", rating: "4", movie: "Get Out — brilliant social commentary", count: "10" },
    { name: "Frank Ocean", email: "frank@test.com", genre: "scifi", rating: "5", movie: "Blade Runner 2049", count: "15" },
    { name: "Grace Lee", email: "grace@test.com", genre: "romance", rating: "4", movie: "Pride & Prejudice (2005)", count: "3" },
    { name: "Henry Ford", email: "henry@test.com", genre: "action", rating: "3", movie: "Mad Max: Fury Road", count: "5" },
    { name: "Iris West", email: "iris@test.com", genre: "drama", rating: "5", movie: "Shawshank Redemption", count: "7" },
    { name: "Jack Ryan", email: "jack@test.com", genre: "scifi", rating: "4", movie: "The Matrix — revolutionary cinema", count: "20" },
    { name: "Karen Page", email: "karen@test.com", genre: "comedy", rating: "4", movie: "Superbad", count: "2" },
    { name: "Leo Messi", email: "leo@test.com", genre: "action", rating: "5", movie: "John Wick", count: "9" },
  ];

  for (const resp of movieResps) {
    const [response] = await db.insert(formResponsesTable).values({ formId: movieForm!.id, respondentEmail: resp.email, submittedAt: new Date(Date.now() - Math.random() * 30 * 86400000) }).returning();
    await db.insert(fieldResponsesTable).values([
      { responseId: response!.id, fieldId: movieFields[0]!.id, value: resp.name },
      { responseId: response!.id, fieldId: movieFields[1]!.id, value: resp.email },
      { responseId: response!.id, fieldId: movieFields[2]!.id, value: resp.genre },
      { responseId: response!.id, fieldId: movieFields[3]!.id, value: resp.rating },
      { responseId: response!.id, fieldId: movieFields[4]!.id, value: resp.movie },
      { responseId: response!.id, fieldId: movieFields[5]!.id, value: resp.count },
    ]);
  }
  console.log(`   ✅ ${movieResps.length} movie responses inserted`);

  // Anime responses
  const animeResps = [
    { name: "Otaku_King", genres: "shonen,isekai", fav: "one_piece", rating: "5", manga: "true" },
    { name: "SakuraChan", genres: "sol,romance", fav: "demon_slayer", rating: "4", manga: "true" },
    { name: "NarutoFan99", genres: "shonen,seinen", fav: "naruto", rating: "4", manga: "true" },
    { name: "MechaLord", genres: "mecha,seinen", fav: "fma", rating: "5", manga: "false" },
    { name: "TitanSlayer", genres: "shonen,seinen", fav: "aot", rating: "5", manga: "true" },
    { name: "DeathNote_L", genres: "seinen", fav: "death_note", rating: "5", manga: "true" },
    { name: "WeebMaster", genres: "isekai,sol", fav: "one_piece", rating: "3", manga: "false" },
    { name: "AnimeFan2025", genres: "shonen,romance", fav: "demon_slayer", rating: "4", manga: "true" },
    { name: "GundamPilot", genres: "mecha", fav: "fma", rating: "4", manga: "false" },
    { name: "SliceOfLifer", genres: "sol,romance", fav: "death_note", rating: "3", manga: "true" },
  ];

  for (const resp of animeResps) {
    const [response] = await db.insert(formResponsesTable).values({ formId: animeForm!.id, submittedAt: new Date(Date.now() - Math.random() * 30 * 86400000) }).returning();
    await db.insert(fieldResponsesTable).values([
      { responseId: response!.id, fieldId: animeFields[0]!.id, value: resp.name },
      { responseId: response!.id, fieldId: animeFields[1]!.id, value: resp.genres },
      { responseId: response!.id, fieldId: animeFields[2]!.id, value: resp.fav },
      { responseId: response!.id, fieldId: animeFields[3]!.id, value: resp.rating },
      { responseId: response!.id, fieldId: animeFields[4]!.id, value: resp.manga },
    ]);
  }
  console.log(`   ✅ ${animeResps.length} anime responses inserted`);

  // Startup responses
  const startupResps = [
    { email: "ceo@startup.io", role: "CEO at TechCorp", rating: "5", source: "producthunt", improve: "Add more integrations with Slack and Notion", date: "2025-01-15", recommend: "true" },
    { email: "pm@bigco.com", role: "Product Manager", rating: "4", source: "twitter", improve: "The onboarding flow could be smoother", date: "2025-02-20", recommend: "true" },
    { email: "dev@indie.dev", role: "Indie Developer", rating: "5", source: "google", improve: "Better API documentation", date: "2025-03-10", recommend: "true" },
    { email: "designer@agency.com", role: "UI Designer", rating: "3", source: "referral", improve: "More theme customization options", date: "2025-01-30", recommend: "false" },
    { email: "founder@saas.co", role: "Founder", rating: "4", source: "producthunt", improve: "Would love webhook support", date: "2025-04-05", recommend: "true" },
    { email: "analyst@data.io", role: "Data Analyst", rating: "4", source: "google", improve: "More chart types in analytics", date: "2025-02-15", recommend: "true" },
    { email: "marketer@growth.io", role: "Growth Lead", rating: "5", source: "twitter", improve: "Email notification templates", date: "2025-03-22", recommend: "true" },
    { email: "cto@enterprise.com", role: "CTO", rating: "4", source: "referral", improve: "SSO support for enterprise", date: "2025-04-18", recommend: "true" },
  ];

  for (const resp of startupResps) {
    const [response] = await db.insert(formResponsesTable).values({ formId: startupForm!.id, respondentEmail: resp.email, submittedAt: new Date(Date.now() - Math.random() * 30 * 86400000) }).returning();
    await db.insert(fieldResponsesTable).values([
      { responseId: response!.id, fieldId: startupFields[0]!.id, value: resp.email },
      { responseId: response!.id, fieldId: startupFields[1]!.id, value: resp.role },
      { responseId: response!.id, fieldId: startupFields[2]!.id, value: resp.rating },
      { responseId: response!.id, fieldId: startupFields[3]!.id, value: resp.source },
      { responseId: response!.id, fieldId: startupFields[4]!.id, value: resp.improve },
      { responseId: response!.id, fieldId: startupFields[5]!.id, value: resp.date },
      { responseId: response!.id, fieldId: startupFields[6]!.id, value: resp.recommend },
    ]);
  }
  console.log(`   ✅ ${startupResps.length} startup responses inserted`);

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Credentials:");
  console.log("   Demo:  demo@formli.com / demo123");
  console.log("   Test:  test@gmail.com / test123");
  console.log("\n🌐 Public Forms:");
  console.log("   /f/movie-survey   (Hollywood theme)");
  console.log("   /f/anime-poll     (Anime Pop theme)");
  console.log("   /f/startup-feedback (Startup Launch theme)");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
