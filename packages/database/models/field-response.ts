import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { formResponsesTable } from "./form-response";
import { formFieldsTable } from "./form-field";

export const fieldResponsesTable = pgTable("field_responses", {
  id: uuid("id").primaryKey().defaultRandom(),

  responseId: uuid("response_id")
    .notNull()
    .references(() => formResponsesTable.id, { onDelete: "cascade" }),

  fieldId: uuid("field_id")
    .notNull()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  // Store all values as text — parse based on field type when needed
  value: text("value").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectFieldResponse = typeof fieldResponsesTable.$inferSelect;
export type InsertFieldResponse = typeof fieldResponsesTable.$inferInsert;
