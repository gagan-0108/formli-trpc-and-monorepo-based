import { TRPCError } from "@trpc/server";
import { db, eq, and, sql, desc, asc } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  themesTable,
} from "@repo/database/schema";
import { nanoid } from "nanoid";

class FormService {
  async create(userId: string, data: { title: string; description?: string }) {
    const slug = nanoid(10);

    const [form] = await db
      .insert(formsTable)
      .values({
        userId,
        title: data.title,
        description: data.description || null,
        slug,
      })
      .returning();

    if (!form) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create form",
      });
    }

    return { ...form, responseCount: 0 };
  }

  async getById(formId: string, userId: string) {
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

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    let theme = null;
    if (form.themeId) {
      const [t] = await db
        .select()
        .from(themesTable)
        .where(eq(themesTable.id, form.themeId))
        .limit(1);
      theme = t || null;
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));

    return {
      ...form,
      fields,
      theme,
      responseCount: countResult?.count || 0,
    };
  }

  async getBySlug(slug: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    if (!form) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    if (form.status !== "published") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This form is not currently accepting responses",
      });
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.order));

    let theme = null;
    if (form.themeId) {
      const [t] = await db
        .select()
        .from(themesTable)
        .where(eq(themesTable.id, form.themeId))
        .limit(1);
      theme = t || null;
    }

    // Increment view count could be added here
    return {
      ...form,
      fields,
      theme,
      responseCount: 0,
    };
  }

  async listByUser(userId: string) {
    const forms = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.userId, userId))
      .orderBy(desc(formsTable.createdAt));

    // Get response counts for all forms
    const formIds = forms.map((f) => f.id);
    if (formIds.length === 0) return [];

    const counts = await db
      .select({
        formId: formResponsesTable.formId,
        count: sql<number>`count(*)::int`,
      })
      .from(formResponsesTable)
      .where(
        sql`${formResponsesTable.formId} IN (${sql.join(
          formIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .groupBy(formResponsesTable.formId);

    const countMap = new Map(counts.map((c) => [c.formId, c.count]));

    return forms.map((form) => ({
      ...form,
      responseCount: countMap.get(form.id) || 0,
    }));
  }

  async listPublic(page: number = 1, limit: number = 12) {
    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public")
        )
      );

    const total = totalResult?.count || 0;

    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public")
        )
      )
      .orderBy(desc(formsTable.publishedAt))
      .limit(limit)
      .offset(offset);

    // Get response counts
    const formIds = forms.map((f) => f.id);
    let countMap = new Map<string, number>();
    if (formIds.length > 0) {
      const counts = await db
        .select({
          formId: formResponsesTable.formId,
          count: sql<number>`count(*)::int`,
        })
        .from(formResponsesTable)
        .where(
          sql`${formResponsesTable.formId} IN (${sql.join(
            formIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
        .groupBy(formResponsesTable.formId);
      countMap = new Map(counts.map((c) => [c.formId, c.count]));
    }

    // Get themes
    const themeIds = forms
      .map((f) => f.themeId)
      .filter((id): id is string => id !== null);
    let themeMap = new Map<string, any>();
    if (themeIds.length > 0) {
      const themes = await db
        .select()
        .from(themesTable)
        .where(
          sql`${themesTable.id} IN (${sql.join(
            themeIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );
      themeMap = new Map(themes.map((t) => [t.id, t]));
    }

    return {
      forms: forms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        themeId: form.themeId,
        responseCount: countMap.get(form.id) || 0,
        theme: form.themeId ? themeMap.get(form.themeId) || null : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    formId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      visibility?: "public" | "unlisted";
      themeId?: string | null;
      slug?: string;
      // Welcome screen
      welcomeTitle?: string | null;
      welcomeDescription?: string | null;
      welcomeButtonText?: string | null;
      // Ending screen
      thankYouTitle?: string | null;
      thankYouMessage?: string | null;
      thankYouButtonText?: string | null;
      thankYouButtonUrl?: string | null;
      // Settings
      collectEmail?: boolean;
      closeMessage?: string | null;
      maxResponses?: number | null;
    }
  ) {
    // Verify ownership
    const [existing] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    // If slug is being updated, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const [slugExists] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.slug, data.slug))
        .limit(1);

      if (slugExists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This slug is already taken",
        });
      }
    }

    const updateData: Record<string, any> = {};
    const passthrough = [
      "title", "description", "visibility", "themeId", "slug",
      "welcomeTitle", "welcomeDescription", "welcomeButtonText",
      "thankYouTitle", "thankYouMessage", "thankYouButtonText", "thankYouButtonUrl",
      "collectEmail", "closeMessage", "maxResponses",
    ] as const;

    for (const key of passthrough) {
      if ((data as any)[key] !== undefined) {
        updateData[key] = (data as any)[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    const [updated] = await db
      .update(formsTable)
      .set(updateData)
      .where(eq(formsTable.id, formId))
      .returning();

    return updated;
  }

  async delete(formId: string, userId: string) {
    const [existing] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    await db.delete(formsTable).where(eq(formsTable.id, formId));
    return { success: true };
  }

  async publish(formId: string, userId: string) {
    const [existing] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    const [updated] = await db
      .update(formsTable)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(formsTable.id, formId))
      .returning();

    return updated;
  }

  async unpublish(formId: string, userId: string) {
    const [existing] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Form not found",
      });
    }

    const [updated] = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(eq(formsTable.id, formId))
      .returning();

    return updated;
  }
}

export default FormService;
