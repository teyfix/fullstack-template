import { describe, expect, test } from "bun:test";

import { resolveImage } from "./image.model";

describe("resolveImage", () => {
  test("keeps storage identifiers behind a pluggable backend", () => {
    const image = resolveImage(
      {
        url: ({ source, width }) =>
          `https://images.example.test/${width}/${source}`,
      },
      {
        alt: "A notebook",
        height: 600,
        quality: 80,
        source: "posts/notebook.jpg",
        width: 800,
      },
    );

    expect(image).toEqual({
      alt: "A notebook",
      height: 600,
      src: "https://images.example.test/800/posts/notebook.jpg",
      width: 800,
    });
  });
});
