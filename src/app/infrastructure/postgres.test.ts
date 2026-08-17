import { describe, expect, test } from "bun:test";

import { createPostgres } from "./postgres";

describe("createPostgres", () => {
  test("creates Bun's native PostgreSQL client", async () => {
    const client = createPostgres("postgresql://test:test@localhost/test");
    expect(typeof client).toBe("function");
    expect(client).toHaveProperty("begin");
    await client.close();
  });
});
