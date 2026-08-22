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

    expect(url).toBe(
      "https://imgproxy.example.test/7mMFm_MUHPs6l8EyhHLShCywI1JMiN-b44YmHgmmUIE/f:webp/q:82/rs:fit:800:600:f/czM6Ly9qb3VybmFsL3Bvc3RzL25vdGVib29rLmpwZw",
    );
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
