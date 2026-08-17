import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  test("composes an accessible labelled content group", () => {
    render(() => (
      <Card aria-label="Post preview" role="article">
        <CardHeader>
          <CardTitle>Feature boundaries</CardTitle>
          <CardDescription>A short summary</CardDescription>
        </CardHeader>
        <CardContent>Article body</CardContent>
        <CardFooter>Article actions</CardFooter>
      </Card>
    ));

    expect(
      screen.getByRole("article", { name: "Post preview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Feature boundaries" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A short summary")).toBeInTheDocument();
    expect(screen.getByText("Article body")).toBeInTheDocument();
    expect(screen.getByText("Article actions")).toBeInTheDocument();
  });
});
