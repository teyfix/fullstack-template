import "@tanstack/solid-start/server-only";

import { z } from "zod";

import { ServerConfig } from "~/app/config/server.config";

import type { ImageBackend } from "./image.model";

const AssetKeySchema = z
  .string()
  .min(1)
  .refine((key) => !key.startsWith("/"), "Asset keys must be bucket-relative");

export type ImgproxyBackendOptions = Readonly<{
  bucket: string;
  endpoint: string;
  key: string;
  salt: string;
}>;

function encodeSource(source: string): string {
  return Buffer.from(source).toString("base64url");
}

function signPath(path: string, key: string, salt: string): string {
  const signer = new Bun.CryptoHasher("sha256", Buffer.from(key, "hex"));
  signer.update(Buffer.from(salt, "hex"));
  signer.update(path);
  return signer.digest("base64url");
}

export function createImgproxyBackend({
  bucket,
  endpoint,
  key,
  salt,
}: ImgproxyBackendOptions): ImageBackend {
  return {
    url({ height, quality, source, width }) {
      const assetKey = AssetKeySchema.parse(source);
      const normalizedEndpoint = endpoint.endsWith("/")
        ? endpoint.slice(0, -1)
        : endpoint;
      const sourceUrl = encodeSource(`s3://${bucket}/${assetKey}`);
      const path = `/f:webp/q:${quality}/rs:fit:${width}:${height}:f/${sourceUrl}`;
      const signature = signPath(path, key, salt);
      return `${normalizedEndpoint}/${signature}${path}`;
    },
  };
}

/** Import only from server-owned image resolution code. */
export const imgproxyBackend = createImgproxyBackend({
  bucket: ServerConfig.s3.bucket,
  endpoint: ServerConfig.images.imgproxy.url,
  key: ServerConfig.images.imgproxy.key,
  salt: ServerConfig.images.imgproxy.salt,
});
