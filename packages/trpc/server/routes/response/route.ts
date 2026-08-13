import { z } from "../../schema";
import { responseService } from "../../services";
import {
  submitResponseInputSchema,
  listResponsesInputSchema,
  analyticsInputSchema,
  exportCSVInputSchema,
  submitResponseOutputSchema,
  responseListOutputSchema,
  analyticsOutputSchema,
  csvExportOutputSchema,
} from "@repo/services/response/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

export const responseRouter = router({
  submit: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/submit"), tags: TAGS },
    })
    .input(submitResponseInputSchema)
    .output(submitResponseOutputSchema)
    .mutation(async ({ input }) => {
      return responseService.submit(
        input.formId,
        input.answers,
        input.respondentEmail
      );
    }),

  listByForm: protectedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/list"), tags: TAGS, protect: true },
    })
    .input(listResponsesInputSchema)
    .output(responseListOutputSchema)
    .query(async ({ ctx, input }) => {
      return responseService.listByForm(
        input.formId,
        ctx.user.id,
        input.page,
        input.limit
      );
    }),

  getAnalytics: protectedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/analytics"), tags: TAGS, protect: true },
    })
    .input(analyticsInputSchema)
    .output(analyticsOutputSchema)
    .query(async ({ ctx, input }) => {
      return responseService.getAnalytics(input.formId, ctx.user.id);
    }),

  exportCSV: protectedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/export-csv"), tags: TAGS, protect: true },
    })
    .input(exportCSVInputSchema)
    .output(csvExportOutputSchema)
    .query(async ({ ctx, input }) => {
      return responseService.exportCSV(input.formId, ctx.user.id);
    }),
});
