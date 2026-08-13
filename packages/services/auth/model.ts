import { z } from "zod";

export const signupInputSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  fullName: z.string().trim().min(1).max(100),
});

export const loginInputSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(100),
});

export const authOutputSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
  }),
});

export const userOutputSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  profileImageUrl: z.string().nullable().optional(),
});
