import "@tanstack/solid-start/server-only";

import { S3Client } from "bun";

import { ServerConfig } from "~/app/config/server.config";

export type S3ClientOptions = Readonly<{
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  region: string;
  secretAccessKey: string;
}>;

export function createS3(options: S3ClientOptions): S3Client {
  return new S3Client(options);
}

/** Bun-native S3-compatible client, configured for the template's MinIO. */
export const s3 = createS3({
  accessKeyId: ServerConfig.s3.accessKey,
  bucket: ServerConfig.s3.bucket,
  endpoint: ServerConfig.s3.endpoint,
  region: ServerConfig.s3.region,
  secretAccessKey: ServerConfig.s3.secretKey,
});
