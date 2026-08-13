import { zodUndefinedModel } from "../../schema";
import { themeService } from "../../services";
import { themeListOutputSchema } from "@repo/services/theme/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Themes"];
const getPath = generatePath("/themes");

export const themeRouter = router({
  list: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/"), tags: TAGS },
    })
    .input(zodUndefinedModel)
    .output(themeListOutputSchema)
    .query(async () => {
      return themeService.list();
    }),
});
