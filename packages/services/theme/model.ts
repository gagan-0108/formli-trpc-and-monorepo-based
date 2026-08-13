import { z } from "zod";

export const themeOutputSchema = z.object({
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
  createdAt: z.date().nullable(),
});

export type ThemeOutput = z.infer<typeof themeOutputSchema>;

export const themeListOutputSchema = z.array(themeOutputSchema);
