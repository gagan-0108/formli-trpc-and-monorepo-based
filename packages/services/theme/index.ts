import { db, eq } from "@repo/database";
import { themesTable } from "@repo/database/schema";

class ThemeService {
  async list() {
    return db.select().from(themesTable).orderBy(themesTable.name);
  }

  async getById(themeId: string) {
    const [theme] = await db
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, themeId))
      .limit(1);
    return theme || null;
  }
}

export default ThemeService;
