import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { Picture } from "./picture";

describe("Picture", () => {
  test("renders the serializable resolved image without provider logic", () => {
    render(() => (
      <Picture
        alt="A notebook"
        height={600}
        src="https://images.example.test/notebook.webp"
        width={800}
      />
    ));
    const image = screen.getByRole("img", { name: "A notebook" });

    expect(image.closest("picture")).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "https://images.example.test/notebook.webp",
    );
    expect(image).toHaveAttribute("loading", "lazy");
  });
});
