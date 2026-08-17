import {
  ApplicationError,
  type ApplicationErrorOptions,
} from "~/kernel/errors/application-error";

type AuthErrorOptions<TScope extends string, TCode extends string> = Omit<
  ApplicationErrorOptions<"auth", TScope, TCode>,
  "feature"
>;

abstract class AuthError<
  TScope extends string,
  TCode extends string,
> extends ApplicationError<"auth", TScope, TCode> {
  protected constructor(options: AuthErrorOptions<TScope, TCode>) {
    super({ ...options, feature: "auth" });
  }
}

export class UnauthenticatedError extends AuthError<
  "session",
  "unauthenticated"
> {
  readonly status = 401;

  constructor(options: ErrorOptions = {}) {
    super({
      cause: options.cause,
      code: "unauthenticated",
      message: "Authentication is required.",
      scope: "session",
    });
  }
}

export class ForbiddenError extends AuthError<"authorization", "forbidden"> {
  readonly status = 403;

  constructor(options: ErrorOptions = {}) {
    super({
      cause: options.cause,
      code: "forbidden",
      message: "Permission is required.",
      scope: "authorization",
    });
  }
}
