import { z } from "zod";

// ─── Shared Sub-Schemas ───────────────────────────────────────

const welcomeScreenSchema = z.object({
  welcomeTitle: z.string().max(255).nullable().optional(),
  welcomeDescription: z.string().max(1000).nullable().optional(),
  welcomeButtonText: z.string().max(50).nullable().optional(),
});

const endingScreenSchema = z.object({
  thankYouTitle: z.string().max(255).nullable().optional(),
  thankYouMessage: z.string().max(1000).nullable().optional(),
  thankYouButtonText: z.string().max(50).nullable().optional(),
  thankYouButtonUrl: z.string().max(2048).nullable().optional(),
});

const formSettingsSchema = z.object({
  collectEmail: z.boolean().optional(),
  closeMessage: z.string().max(500).nullable().optional(),
  maxResponses: z.number().int().positive().nullable().optional(),
});

// Reusable theme sub-schema for embedded theme data
const themeSubSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  coverEmoji: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  backgroundPattern: z.string().nullable().optional(),
  backgroundImage: z.string().nullable().optional(),
});

// Compact theme for list views (explore page)
const themeCompactSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  coverEmoji: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string(),
  borderRadius: z.string(),
  backgroundPattern: z.string().nullable().optional(),
  backgroundImage: z.string().nullable().optional(),
});

// ─── Input Schemas ────────────────────────────────────────────

export const createFormInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(500).optional(),
});

export const updateFormInputSchema = z
  .object({
    formId: z.string().uuid(),
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(500).optional(),
    visibility: z.enum(["public", "unlisted"]).optional(),
    themeId: z.string().uuid().nullable().optional(),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(100)
      .regex(/^[a-z0-9_-]+$/, "Slug must be lowercase alphanumeric with hyphens or underscores")
      .optional(),
  })
  .merge(welcomeScreenSchema)
  .merge(endingScreenSchema)
  .merge(formSettingsSchema);

export const formIdInputSchema = z.object({
  formId: z.string().uuid(),
});

export const formSlugInputSchema = z.object({
  slug: z.string().trim().min(1).max(100),
});

export const listPublicFormsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
});

// ─── Output Schemas ───────────────────────────────────────────

export const formOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.enum(["draft", "published", "closed"]),
  visibility: z.enum(["public", "unlisted"]),
  themeId: z.string().nullable(),

  // Welcome screen
  welcomeTitle: z.string().nullable().optional(),
  welcomeDescription: z.string().nullable().optional(),
  welcomeButtonText: z.string().nullable().optional(),

  // Ending screen
  thankYouTitle: z.string().nullable().optional(),
  thankYouMessage: z.string().nullable().optional(),
  thankYouButtonText: z.string().nullable().optional(),
  thankYouButtonUrl: z.string().nullable().optional(),

  // Settings
  collectEmail: z.boolean().nullable().optional(),
  closeMessage: z.string().nullable().optional(),
  maxResponses: z.number().nullable().optional(),

  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  publishedAt: z.date().nullable(),
  responseCount: z.number().optional(),
});

export const formListOutputSchema = z.array(formOutputSchema);

export const formWithFieldsOutputSchema = formOutputSchema.extend({
  fields: z.array(
    z.object({
      id: z.string(),
      formId: z.string(),
      type: z.enum([
        "short_text",
        "long_text",
        "email",
        "number",
        "single_select",
        "multi_select",
        "checkbox",
        "rating",
        "date",
      ]),
      label: z.string(),
      placeholder: z.string().nullable(),
      description: z.string().nullable(),
      required: z.boolean(),
      order: z.number(),
      options: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .nullable(),
      validationRules: z
        .object({
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          min: z.number().optional(),
          max: z.number().optional(),
          pattern: z.string().optional(),
        })
        .nullable(),
    })
  ),
  theme: themeSubSchema.nullable().optional(),
});

export const publicFormListOutputSchema = z.object({
  forms: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      themeId: z.string().nullable(),
      responseCount: z.number(),
      theme: themeCompactSchema.nullable().optional(),
    })
  ),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});
