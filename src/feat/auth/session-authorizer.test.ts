import { describe, expect, test } from "bun:test";

import { ForbiddenError, UnauthenticatedError } from "./auth.error";
import { createSessionAuthorizer } from "./session-authorizer";

const headers = new Headers({ cookie: "session=test" });
const session = {
  session: {
    createdAt: new Date(),
    expiresAt: new Date(),
    id: "00000000-0000-4000-8000-000000000010",
    ipAddress: null,
    token: "token",
    updatedAt: new Date(),
    userAgent: null,
    userId: "00000000-0000-4000-8000-000000000001",
  },
  user: {
    banExpires: null,
    banned: false,
    banReason: null,
    createdAt: new Date(),
    email: "admin@example.test",
    emailVerified: true,
    id: "00000000-0000-4000-8000-000000000001",
    image: null,
    name: "Admin",
    role: "admin",
    updatedAt: new Date(),
  },
} as const;

describe("session authorization", () => {
  test("distinguishes absent sessions from insufficient permissions", async () => {
    await expect(
      createSessionAuthorizer(async () => null).requireSession(headers),
    ).rejects.toBeInstanceOf(UnauthenticatedError);

    await expect(
      createSessionAuthorizer(async () => ({
        ...session,
        user: { ...session.user, role: "user" },
      })).requireAdmin(headers),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  test("returns an administrator session", async () => {
    await expect(
      createSessionAuthorizer(async () => session).requireAdmin(headers),
    ).resolves.toBe(session);

    await expect(
      createSessionAuthorizer(async () => ({
        ...session,
        user: { ...session.user, role: "editor,admin" },
      })).requireAdmin(headers),
    ).resolves.toMatchObject({ user: { role: "editor,admin" } });
  });

  test("recognizes a configured bootstrap administrator", async () => {
    const regularSession = {
      ...session,
      user: { ...session.user, role: "user" },
    };

    await expect(
      createSessionAuthorizer(async () => regularSession, {
        adminUserIds: [regularSession.user.id],
      }).requireAdmin(headers),
    ).resolves.toBe(regularSession);
  });
});
