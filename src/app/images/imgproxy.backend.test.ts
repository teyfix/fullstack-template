import { describe, expect, test } from "bun:test";

import { createImgproxyBackend } from "./imgproxy.backend";

const backend = createImgproxyBackend({
  bucket: "journal",
  endpoint: "https://imgproxy.example.test",
  key: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  salt: "abcdef0123456789abcdef0123456789",
});

describe("createImgproxyBackend", () => {
  test("signs a private S3 source into a public rendition URL", () => {
    const url = backend.url({
      alt: "A notebook",
      height: 600,
      quality: 82,
      source: "posts/notebook.jpg",
      width: 800,
    });

    expect(url).toStartWith("https://imgproxy.example.test/");
    expect(url).toContain("/rs:fit:800:600:f/");
    expect(url).not.toContain("posts/notebook.jpg");
  });

  test("rejects absolute storage paths", () => {
    expect(() =>
      backend.url({
        alt: "",
        height: 1,
        quality: 80,
        source: "/private.jpg",
        width: 1,
      }),
    ).toThrow("bucket-relative");
  });
});
