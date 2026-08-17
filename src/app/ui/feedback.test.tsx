import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

import { AppErrorBoundary } from "./feedback";

describe("AppErrorBoundary", () => {
  test("keeps internal errors private and exposes retry", () => {
    const reset = vi.fn();
    render(() => (
      <AppErrorBoundary
        error={new Error("database password leaked")}
        reset={reset}
      />
    ));

    expect(
      screen.queryByText("database password leaked"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
