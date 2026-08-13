import { TRPCError } from "@trpc/server";
import { db, eq, and, sql, asc } from "@repo/database";
import {
  formFieldsTable,
  formsTable,
} from "@repo/database/schema";

class FieldService {
  async addField(
    formId: string,
    userId: string,
    data: {
      type: string;
      label: string;
      placeholder?: string;
      description?: string;
      required?: boolean;
      options?: Array<{ label: string; value: string }>;
      validationRules?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
      };
    }
  ) {
    // Verify form ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!form) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    // Get max order
    const [maxOrder] = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${formFieldsTable.order}), -1)` })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const newOrder = (maxOrder?.maxOrder ?? -1) + 1;

    const [field] = await db
      .insert(formFieldsTable)
      .values({
        formId,
        type: data.type as any,
        label: data.label,
        placeholder: data.placeholder || null,
        description: data.description || null,
        required: data.required ?? false,
        order: newOrder,
        options: data.options || null,
        validationRules: data.validationRules || null,
      })
      .returning();

    if (!field) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add field",
      });
    }

    return field;
  }

  async updateField(
    fieldId: string,
    userId: string,
    data: {
      label?: string;
      placeholder?: string | null;
      description?: string | null;
      required?: boolean;
      type?: string;
      options?: Array<{ label: string; value: string }> | null;
      validationRules?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
      } | null;
    }
  ) {
    // Verify ownership through form
    const [field] = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, fieldId))
      .limit(1);

    if (!field) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Field not found",
      });
    }

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, field.formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!form) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to update this field",
      });
    }

    const updateData: Record<string, any> = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.placeholder !== undefined) updateData.placeholder = data.placeholder;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.required !== undefined) updateData.required = data.required;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.options !== undefined) updateData.options = data.options;
    if (data.validationRules !== undefined) updateData.validationRules = data.validationRules;

    if (Object.keys(updateData).length === 0) {
      return field;
    }

    const [updated] = await db
      .update(formFieldsTable)
      .set(updateData)
      .where(eq(formFieldsTable.id, fieldId))
      .returning();

    return updated;
  }

  async deleteField(fieldId: string, userId: string) {
    const [field] = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, fieldId))
      .limit(1);

    if (!field) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Field not found",
      });
    }

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, field.formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!form) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this field",
      });
    }

    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, fieldId));
    return { success: true };
  }

  async reorderFields(formId: string, userId: string, fieldIds: string[]) {
    // Verify form ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!form) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    // Update order for each field
    const updates = fieldIds.map((id, index) =>
      db
        .update(formFieldsTable)
        .set({ order: index })
        .where(and(eq(formFieldsTable.id, id), eq(formFieldsTable.formId, formId)))
    );

    await Promise.all(updates);

    // Return updated fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    return fields;
  }
}

export default FieldService;
