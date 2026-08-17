import "@tanstack/solid-start/server-only";

import { generateImageUrl } from "@imgproxy/imgproxy-node";
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

export function createImgproxyBackend({
  bucket,
  endpoint,
  key,
  salt,
}: ImgproxyBackendOptions): ImageBackend {
  return {
    url({ height, quality, source, width }) {
      const assetKey = AssetKeySchema.parse(source);
      return generateImageUrl({
        endpoint,
        key,
        options: {
          format: "webp",
          quality,
          resize: {
            enlarge: false,
            height,
            resizing_type: "fit",
            width,
          },
        },
        salt,
        url: `s3://${bucket}/${assetKey}`,
      });
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
