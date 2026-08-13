import { TRPCError } from "@trpc/server";
import { db, eq, and, sql, desc, asc } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  fieldResponsesTable,
  usersTable,
} from "@repo/database/schema";
import { emailService } from "../email";

class ResponseService {
  async submit(
    formId: string,
    answers: Array<{ fieldId: string; value: string }>,
    respondentEmail?: string
  ) {
    // Get the form
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
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
        message: form.closeMessage || "This form is not currently accepting responses",
      });
    }

    // Check response limit
    if (form.maxResponses) {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(formResponsesTable)
        .where(eq(formResponsesTable.formId, formId));
      const currentCount = countResult?.count || 0;
      if (currentCount >= form.maxResponses) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: form.closeMessage || "This form has reached its maximum number of responses",
        });
      }
    }

    // Get form fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    // Validate required fields
    const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));
    for (const field of fields) {
      if (field.required) {
        const answer = answerMap.get(field.id);
        if (!answer || answer.trim() === "") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Field "${field.label}" is required`,
          });
        }
      }

      // Type-specific validation
      const answer = answerMap.get(field.id);
      if (answer && answer.trim() !== "") {
        this.validateFieldAnswer(field, answer);
      }
    }

    // Insert response
    const [response] = await db
      .insert(formResponsesTable)
      .values({
        formId,
        respondentEmail: respondentEmail || null,
      })
      .returning();

    if (!response) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create response",
      });
    }

    // Insert field responses
    const fieldResponses = answers
      .filter((a) => a.value && a.value.trim() !== "")
      .map((a) => ({
        responseId: response.id,
        fieldId: a.fieldId,
        value: a.value,
      }));

    if (fieldResponses.length > 0) {
      await db.insert(fieldResponsesTable).values(fieldResponses);
    }

    // Fire-and-forget email notifications
    this.sendSubmissionEmails(formId, form.title, respondentEmail || undefined, form.thankYouMessage || undefined).catch(() => {});

    return {
      success: true,
      responseId: response.id,
      message: "Response submitted successfully",
    };
  }

  private async sendSubmissionEmails(formId: string, formTitle: string, respondentEmail?: string, thankYouMessage?: string): Promise<void> {
    try {
      const [form] = await db.select({ userId: formsTable.userId }).from(formsTable).where(eq(formsTable.id, formId)).limit(1);
      if (form) {
        const [owner] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, form.userId)).limit(1);
        const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(formResponsesTable).where(eq(formResponsesTable.formId, formId));
        const responseCount = countResult?.count || 0;
        if (owner) {
          emailService.notifyNewResponse(owner.email, formTitle, responseCount, respondentEmail);
        }
        if (respondentEmail) {
          emailService.sendSubmissionConfirmation(respondentEmail, formTitle, thankYouMessage);
        }
      }
    } catch (err) {
      // Don't throw — email failure should never break submissions
    }
  }

  private validateFieldAnswer(
    field: any,
    value: string
  ) {
    switch (field.type) {
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be a valid email address`,
          });
        }
        break;
      }
      case "number": {
        const num = Number(value);
        if (isNaN(num)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be a valid number`,
          });
        }
        if (field.validationRules) {
          if (field.validationRules.min !== undefined && num < field.validationRules.min) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `"${field.label}" must be at least ${field.validationRules.min}`,
            });
          }
          if (field.validationRules.max !== undefined && num > field.validationRules.max) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `"${field.label}" must be at most ${field.validationRules.max}`,
            });
          }
        }
        break;
      }
      case "rating": {
        const rating = Number(value);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be a rating between 1 and 5`,
          });
        }
        break;
      }
      case "short_text":
      case "long_text": {
        if (field.validationRules) {
          if (
            field.validationRules.minLength !== undefined &&
            value.length < field.validationRules.minLength
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `"${field.label}" must be at least ${field.validationRules.minLength} characters`,
            });
          }
          if (
            field.validationRules.maxLength !== undefined &&
            value.length > field.validationRules.maxLength
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `"${field.label}" must be at most ${field.validationRules.maxLength} characters`,
            });
          }
        }
        break;
      }
    }
  }

  async listByForm(
    formId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    // Verify ownership
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

    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));

    const total = totalResult?.count || 0;

    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt))
      .limit(limit)
      .offset(offset);

    // Get fields for labeling
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    const fieldMap = new Map(fields.map((f) => [f.id, f]));

    // Get all field responses for these responses
    const responseIds = responses.map((r) => r.id);
    let allFieldResponses: any[] = [];
    if (responseIds.length > 0) {
      allFieldResponses = await db
        .select()
        .from(fieldResponsesTable)
        .where(
          sql`${fieldResponsesTable.responseId} IN (${sql.join(
            responseIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );
    }

    const fieldResponseMap = new Map<string, any[]>();
    for (const fr of allFieldResponses) {
      const existing = fieldResponseMap.get(fr.responseId) || [];
      existing.push(fr);
      fieldResponseMap.set(fr.responseId, existing);
    }

    return {
      responses: responses.map((r) => ({
        id: r.id,
        formId: r.formId,
        respondentEmail: r.respondentEmail,
        submittedAt: r.submittedAt,
        answers: (fieldResponseMap.get(r.id) || []).map((fr: any) => {
          const field = fieldMap.get(fr.fieldId);
          return {
            fieldId: fr.fieldId,
            fieldLabel: field?.label || "Unknown",
            fieldType: field?.type || "short_text",
            value: fr.value,
          };
        }),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAnalytics(formId: string, userId: string) {
    // Verify ownership
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

    // Total responses
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));

    const totalResponses = totalResult?.count || 0;

    // Responses over time (last 30 days)
    const responsesOverTime = await db
      .select({
        date: sql<string>`TO_CHAR(${formResponsesTable.submittedAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .groupBy(sql`TO_CHAR(${formResponsesTable.submittedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${formResponsesTable.submittedAt}, 'YYYY-MM-DD')`);

    // Get fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    // Per-field breakdowns
    const fieldBreakdowns = [];
    for (const field of fields) {
      const allAnswers = await db
        .select({ value: fieldResponsesTable.value })
        .from(fieldResponsesTable)
        .where(eq(fieldResponsesTable.fieldId, field.id));

      const totalAnswers = allAnswers.length;

      // Count values
      const valueCounts = new Map<string, number>();
      let ratingSum = 0;
      let ratingCount = 0;

      for (const answer of allAnswers) {
        const val = answer.value;
        valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
        if (field.type === "rating") {
          const num = Number(val);
          if (!isNaN(num)) {
            ratingSum += num;
            ratingCount++;
          }
        }
      }

      const breakdown = Array.from(valueCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      fieldBreakdowns.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        breakdown,
        averageRating:
          field.type === "rating" && ratingCount > 0
            ? Math.round((ratingSum / ratingCount) * 10) / 10
            : undefined,
        totalAnswers,
      });
    }

    return {
      totalResponses,
      responsesOverTime: responsesOverTime.map((r) => ({
        date: r.date || "",
        count: r.count,
      })),
      fieldBreakdowns,
    };
  }

  async exportCSV(formId: string, userId: string) {
    // Verify ownership
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

    // Get fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    // Get all responses
    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt));

    if (responses.length === 0) {
      const headers = ["Response ID", "Email", "Submitted At", ...fields.map((f) => f.label)];
      return {
        csv: headers.join(",") + "\n",
        filename: `${form.slug}-responses.csv`,
      };
    }

    // Get all field responses
    const responseIds = responses.map((r) => r.id);
    const allFieldResponses = await db
      .select()
      .from(fieldResponsesTable)
      .where(
        sql`${fieldResponsesTable.responseId} IN (${sql.join(
          responseIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      );

    // Build lookup
    const frMap = new Map<string, Map<string, string>>();
    for (const fr of allFieldResponses) {
      if (!frMap.has(fr.responseId)) {
        frMap.set(fr.responseId, new Map());
      }
      frMap.get(fr.responseId)!.set(fr.fieldId, fr.value);
    }

    // Build CSV
    const headers = ["Response ID", "Email", "Submitted At", ...fields.map((f) => f.label)];
    const rows = responses.map((r) => {
      const answers = frMap.get(r.id) || new Map<string, string>();
      return [
        r.id,
        r.respondentEmail || "",
        r.submittedAt?.toISOString() || "",
        ...fields.map((f) => {
          const val = answers.get(f.id) || "";
          // Escape CSV values
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return {
      csv,
      filename: `${form.slug}-responses.csv`,
    };
  }
}

export default ResponseService;
