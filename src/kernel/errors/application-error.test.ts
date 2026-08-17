import { describe, expect, test } from "bun:test";

import { ApplicationError } from "./application-error";

class ExampleError extends ApplicationError<"example", "read", "not_found"> {
  readonly status = 404;

  constructor() {
    super({
      code: "not_found",
      feature: "example",
      message: "The example was not found.",
      scope: "read",
    });
  }
}

describe("ApplicationError", () => {
  test("serializes the complete observability tuple", () => {
    const error = new ExampleError();

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.toJSON()).toEqual({
      code: "not_found",
      feature: "example",
      message: "The example was not found.",
      name: "ExampleError",
      scope: "read",
    });
  });
});
