import { describe, expect, test } from "bun:test";

import { authClient } from "./auth-client";

describe("auth client", () => {
  test("exposes Solid session state and the matching admin plugin", () => {
    expect(authClient.useSession).toBeFunction();
    expect(authClient.signIn.email).toBeFunction();
    expect(authClient.admin.banUser).toBeFunction();
  });
});
