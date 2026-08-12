import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { themesTable } from "./theme";

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "closed",
]);

export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  status: formStatusEnum("status").notNull().default("draft"),
  visibility: formVisibilityEnum("visibility").notNull().default("unlisted"),

  themeId: uuid("theme_id").references(() => themesTable.id, {
    onDelete: "set null",
  }),

  // Welcome screen (Typeform-style intro before questions)
  welcomeTitle: text("welcome_title"),
  welcomeDescription: text("welcome_description"),
  welcomeButtonText: varchar("welcome_button_text", { length: 50 }).default("Start"),

  // Custom ending (Typeform-style thank-you)
  thankYouTitle: text("thank_you_title"),
  thankYouMessage: text("thank_you_message"),
  thankYouButtonText: varchar("thank_you_button_text", { length: 50 }),
  thankYouButtonUrl: text("thank_you_button_url"),

  // Form settings
  collectEmail: boolean("collect_email").default(false),
  closeMessage: text("close_message"),
  maxResponses: integer("max_responses"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  publishedAt: timestamp("published_at"),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;

