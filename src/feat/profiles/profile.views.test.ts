import { describe, expect, test } from "bun:test";
import { formatQuery, renderExecutable } from "@teyfix/drizzle/render";
import { getViewConfig } from "drizzle-orm/pg-core";

import { activeProfile } from "./profile.views";

describe("active profile view", () => {
  test("structurally excludes deleted profiles and their deletion timestamp", async () => {
    const expectedSQL = await Bun.file(
      new URL("./profile.views.test.sql", import.meta.url),
    ).text();
    const query = getViewConfig(activeProfile).query;
    const generatedSQL = query === undefined ? "" : renderExecutable(query).sql;

    expect(activeProfile).not.toHaveProperty("deletedAt");
    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});
