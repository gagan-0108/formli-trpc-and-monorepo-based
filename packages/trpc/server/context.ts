import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import AuthService from "@repo/services/auth";

const authService = new AuthService();

export async function createContext({ req }: CreateExpressContextOptions) {
  let user: {
    id: string;
    email: string;
    fullName: string;
    profileImageUrl: string | null;
  } | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      user = await authService.verifyToken(token);
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }

  return { user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
