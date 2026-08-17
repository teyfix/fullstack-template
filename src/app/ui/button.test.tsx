import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
  test("uses the primary medium button by default", () => {
    render(() => <Button>Publish</Button>);

    const button = screen.getByRole("button", { name: "Publish" });
    expect(button).toHaveClass("bg-primary", "h-9");
  });

  test("selects independent visual and size variants", () => {
    const classes = buttonVariants({ size: "sm", variant: "outline" });

    expect(classes).toContain("border-input");
    expect(classes).toContain("h-8");
    expect(classes).not.toContain("bg-primary");
  });
});
