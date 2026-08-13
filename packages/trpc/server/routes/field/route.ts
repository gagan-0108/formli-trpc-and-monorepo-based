import { z } from "../../schema";
import { fieldService } from "../../services";
import {
  addFieldInputSchema,
  updateFieldInputSchema,
  deleteFieldInputSchema,
  reorderFieldsInputSchema,
  fieldOutputSchema,
} from "@repo/services/field/model";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Fields"];
const getPath = generatePath("/fields");

export const fieldRouter = router({
  add: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/"), tags: TAGS, protect: true },
    })
    .input(addFieldInputSchema)
    .output(fieldOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { formId, ...data } = input;
      return fieldService.addField(formId, ctx.user.id, data);
    }),

  update: protectedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/update"), tags: TAGS, protect: true },
    })
    .input(updateFieldInputSchema)
    .output(fieldOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { fieldId, ...data } = input;
      return fieldService.updateField(fieldId, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/delete"), tags: TAGS, protect: true },
    })
    .input(deleteFieldInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return fieldService.deleteField(input.fieldId, ctx.user.id);
    }),

  reorder: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/reorder"), tags: TAGS, protect: true },
    })
    .input(reorderFieldsInputSchema)
    .output(z.array(fieldOutputSchema))
    .mutation(async ({ ctx, input }) => {
      return fieldService.reorderFields(input.formId, ctx.user.id, input.fieldIds);
    }),
});
