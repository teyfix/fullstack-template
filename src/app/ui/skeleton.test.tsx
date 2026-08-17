import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  test("forwards an accessible loading status", () => {
    render(() => <Skeleton aria-label="Loading article" role="status" />);

    expect(
      screen.getByRole("status", { name: "Loading article" }),
    ).toBeInTheDocument();
  });
});
