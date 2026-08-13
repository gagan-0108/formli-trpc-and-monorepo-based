import { z } from "zod";

export const submitResponseInputSchema = z.object({
  formId: z.string().uuid(),
  answers: z.array(
    z.object({
      fieldId: z.string().uuid(),
      value: z.string().trim().max(10000),
    })
  ),
  respondentEmail: z.string().trim().email().max(255).optional(),
});

export const listResponsesInputSchema = z.object({
  formId: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const responseDetailInputSchema = z.object({
  responseId: z.string().uuid(),
});

export const analyticsInputSchema = z.object({
  formId: z.string().uuid(),
});

export const exportCSVInputSchema = z.object({
  formId: z.string().uuid(),
});

export const submitResponseOutputSchema = z.object({
  success: z.boolean(),
  responseId: z.string(),
  message: z.string(),
});

export const responseListOutputSchema = z.object({
  responses: z.array(
    z.object({
      id: z.string(),
      formId: z.string(),
      respondentEmail: z.string().nullable(),
      submittedAt: z.date().nullable(),
      answers: z.array(
        z.object({
          fieldId: z.string(),
          fieldLabel: z.string(),
          fieldType: z.string(),
          value: z.string(),
        })
      ),
    })
  ),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export const analyticsOutputSchema = z.object({
  totalResponses: z.number(),
  responsesOverTime: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
  fieldBreakdowns: z.array(
    z.object({
      fieldId: z.string(),
      fieldLabel: z.string(),
      fieldType: z.string(),
      breakdown: z.array(
        z.object({
          value: z.string(),
          count: z.number(),
        })
      ),
      averageRating: z.number().optional(),
      totalAnswers: z.number(),
    })
  ),
});

export const csvExportOutputSchema = z.object({
  csv: z.string(),
  filename: z.string(),
});
