import { describe, expect, test } from "bun:test";

import { ForbiddenError, UnauthenticatedError } from "./auth.error";

describe("auth errors", () => {
  test("keeps generic codes meaningful through feature and scope", () => {
    expect(new UnauthenticatedError().toJSON()).toMatchObject({
      code: "unauthenticated",
      feature: "auth",
      scope: "session",
    });
    expect(new ForbiddenError()).toMatchObject({
      code: "forbidden",
      feature: "auth",
      scope: "authorization",
      status: 403,
    });
  });
});
