import type { AuthSession } from "./auth";
import { ForbiddenError, UnauthenticatedError } from "./auth.error";

type SessionReader = (headers: Headers) => Promise<AuthSession | null>;

export type SessionAuthorizerOptions = Readonly<{
  adminUserIds?: readonly string[];
}>;

function hasAdminRole(role: string | null | undefined): boolean {
  return (
    role
      ?.split(",")
      .map((value) => value.trim())
      .includes("admin") ?? false
  );
}

export function createSessionAuthorizer(
  readSession: SessionReader,
  { adminUserIds = [] }: SessionAuthorizerOptions = {},
) {
  const bootstrapAdministrators = new Set(adminUserIds);

  return {
    async requireAdmin(headers: Headers) {
      const session = await readSession(headers);
      if (session === null) throw new UnauthenticatedError();
      if (
        !hasAdminRole(session.user.role) &&
        !bootstrapAdministrators.has(session.user.id)
      ) {
        throw new ForbiddenError();
      }
      return session;
    },
    async requireSession(headers: Headers) {
      const session = await readSession(headers);
      if (session === null) throw new UnauthenticatedError();
      return session;
    },
  };
}
