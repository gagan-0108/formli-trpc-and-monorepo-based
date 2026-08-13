import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import rateLimit from "express-rate-limit";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Formli API",
  description: "Form Builder SaaS — Create, publish, and analyze forms",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});


app.use(
  cors({
    origin: env.NODE_ENV === "prod" ? env.BASE_URL : ["http://localhost:3000", "http://localhost:8000"],
    credentials: true,
  }),
);

app.use(express.json());

// general rate limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// strict rate limiter for public submission
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later" },
});

// apply general rate limiter
app.use("/trpc", generalLimiter);
app.use("/api", generalLimiter);

// apply strict rate limiter to submission
app.use("/api/responses/submit", submissionLimiter);

app.get("/", (_, res) => {
  return res.json({ message: "formli api endpoint is running " });
});

app.get("/health", (_, res) => {
  return res.json({ message: "server is up n running", healthy: true });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (_, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
