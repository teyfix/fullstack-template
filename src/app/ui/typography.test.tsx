import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { Heading, Text } from "./typography";

describe("typography", () => {
  test("uses the requested heading level and a level-two default", () => {
    render(() => (
      <>
        <Heading level={1}>Journal</Heading>
        <Heading>Recent posts</Heading>
        <Text>Notes from the team.</Text>
      </>
    ));

    expect(
      screen.getByRole("heading", { level: 1, name: "Journal" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Recent posts" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Notes from the team.")).toBeInTheDocument();
  });
});
