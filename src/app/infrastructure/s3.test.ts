import { describe, expect, test } from "bun:test";
import { S3Client } from "bun";

import { createS3 } from "./s3";

describe("createS3", () => {
  test("creates Bun's native S3 client", () => {
    const client = createS3({
      accessKeyId: "test",
      bucket: "assets",
      endpoint: "http://localhost:9000",
      region: "us-east-1",
      secretAccessKey: "secret",
    });

    expect(client).toBeInstanceOf(S3Client);
  });
});
