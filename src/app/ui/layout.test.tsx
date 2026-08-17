import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { Cluster, Container, Stack } from "./layout";

describe("layout primitives", () => {
  test("forward semantic and accessible props", () => {
    render(() => (
      <Container aria-label="Article index" role="main">
        <Stack aria-label="Articles" role="region">
          <span>First article</span>
        </Stack>
        <Cluster aria-label="Article actions" role="toolbar">
          <button type="button">Publish</button>
        </Cluster>
      </Container>
    ));

    expect(
      screen.getByRole("main", { name: "Article index" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Articles" })).toHaveTextContent(
      "First article",
    );
    expect(
      screen.getByRole("toolbar", { name: "Article actions" }),
    ).toContainElement(screen.getByRole("button", { name: "Publish" }));
  });
});
