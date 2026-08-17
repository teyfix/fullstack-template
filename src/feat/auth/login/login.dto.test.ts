import { describe, expect, test } from "bun:test";

import { LoginModelSchema } from "./login.dto";

describe("login model", () => {
  test("is shared by the Solid form and auth request", () => {
    expect(
      LoginModelSchema.parse({
        email: "ada@example.test",
        password: "correct-horse-battery-staple",
      }).email,
    ).toBe("ada@example.test");
    expect(() =>
      LoginModelSchema.parse({ email: "not-an-email", password: "short" }),
    ).toThrow();
  });
});
