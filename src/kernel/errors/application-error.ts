export type ApplicationErrorOptions<
  TFeature extends string,
  TScope extends string,
  TCode extends string,
> = Readonly<{
  cause?: unknown;
  code: TCode;
  feature: TFeature;
  message: string;
  scope: TScope;
}>;

/** Stable, observable application failure. Concrete errors stay feature-owned. */
export abstract class ApplicationError<
  TFeature extends string,
  TScope extends string,
  TCode extends string,
> extends Error {
  abstract readonly status: number;
  readonly code: TCode;
  readonly feature: TFeature;
  readonly scope: TScope;

  protected constructor({
    cause,
    code,
    feature,
    message,
    scope,
  }: ApplicationErrorOptions<TFeature, TScope, TCode>) {
    super(message, { cause });
    this.code = code;
    this.feature = feature;
    this.scope = scope;
    this.name = new.target.name;
  }

  toJSON() {
    return {
      code: this.code,
      feature: this.feature,
      message: this.message,
      name: this.name,
      scope: this.scope,
    } as const;
  }
}
