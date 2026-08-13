import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date",
]);

export const addFieldInputSchema = z.object({
  formId: z.string().uuid(),
  type: fieldTypeSchema,
  label: z.string().min(1).max(255),
  placeholder: z.string().max(255).optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  validationRules: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const updateFieldInputSchema = z.object({
  fieldId: z.string().uuid(),
  label: z.string().min(1).max(255).optional(),
  placeholder: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  required: z.boolean().optional(),
  type: fieldTypeSchema.optional(),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .nullable(),
  validationRules: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export const deleteFieldInputSchema = z.object({
  fieldId: z.string().uuid(),
});

export const reorderFieldsInputSchema = z.object({
  formId: z.string().uuid(),
  fieldIds: z.array(z.string().uuid()),
});

export const fieldOutputSchema = z.object({
  id: z.string(),
  formId: z.string(),
  type: fieldTypeSchema,
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
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});
