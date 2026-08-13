import { z, zodUndefinedModel } from "../../schema";
import { formService } from "../../services";
import {
  createFormInputSchema,
  updateFormInputSchema,
  formIdInputSchema,
  formSlugInputSchema,
  listPublicFormsInputSchema,
  formOutputSchema,
  formListOutputSchema,
  formWithFieldsOutputSchema,
  publicFormListOutputSchema,
} from "@repo/services/form/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  create: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/"), tags: TAGS, protect: true },
    })
    .input(createFormInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return formService.create(ctx.user.id, input);
    }),

  getById: protectedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/{formId}"), tags: TAGS, protect: true },
    })
    .input(formIdInputSchema)
    .output(formWithFieldsOutputSchema)
    .query(async ({ ctx, input }) => {
      return formService.getById(input.formId, ctx.user.id);
    }),

  list: protectedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/mine"), tags: TAGS, protect: true },
    })
    .input(zodUndefinedModel)
    .output(formListOutputSchema)
    .query(async ({ ctx }) => {
      return formService.listByUser(ctx.user.id);
    }),

  update: protectedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/update"), tags: TAGS, protect: true },
    })
    .input(updateFormInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { formId, ...data } = input;
      return formService.update(formId, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/delete"), tags: TAGS, protect: true },
    })
    .input(formIdInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return formService.delete(input.formId, ctx.user.id);
    }),

  publish: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/publish"), tags: TAGS, protect: true },
    })
    .input(formIdInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return formService.publish(input.formId, ctx.user.id);
    }),

  unpublish: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/unpublish"), tags: TAGS, protect: true },
    })
    .input(formIdInputSchema)
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return formService.unpublish(input.formId, ctx.user.id);
    }),

  getBySlug: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/public/{slug}"), tags: TAGS },
    })
    .input(formSlugInputSchema)
    .output(formWithFieldsOutputSchema)
    .query(async ({ input }) => {
      return formService.getBySlug(input.slug);
    }),

  listPublic: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/explore"), tags: TAGS },
    })
    .input(listPublicFormsInputSchema)
    .output(publicFormListOutputSchema)
    .query(async ({ input }) => {
      return formService.listPublic(input.page, input.limit);
    }),
});
