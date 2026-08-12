import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull().default("minimal"),
  coverEmoji: varchar("cover_emoji", { length: 10 }).notNull().default("🎨"),

  primaryColor: varchar("primary_color", { length: 7 }).notNull(),
  secondaryColor: varchar("secondary_color", { length: 7 }).notNull(),
  backgroundColor: varchar("background_color", { length: 7 }).notNull(),
  textColor: varchar("text_color", { length: 7 }).notNull(),
  accentColor: varchar("accent_color", { length: 7 }).notNull(),

  fontFamily: varchar("font_family", { length: 100 }).notNull().default("Inter"),
  borderRadius: varchar("border_radius", { length: 10 }).notNull().default("8px"),

  // CSS background pattern applied to the form renderer
  backgroundPattern: text("background_pattern"),

  // SVG doodle/illustration background as a data URL
  backgroundImage: text("background_image"),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
