import "@tanstack/solid-start/server-only";

import { z } from "zod";

export const ServerConfigSchema = z.object({
  app: z.object({
    name: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/, "Must be a PostgreSQL-safe schema name"),
  }),
  auth: z.object({
    adminUserIds: z.array(z.uuid()),
    secret: z.string().min(32),
    url: z.url(),
  }),
  images: z.object({
    imgproxy: z.object({
      key: z.string().regex(/^[0-9a-f]{64}$/i),
      salt: z.string().regex(/^[0-9a-f]{32}$/i),
      url: z.url(),
    }),
  }),
  postgres: z.object({
    adminUrl: z.url({ protocol: /^postgres(ql)?$/ }),
    url: z.url({ protocol: /^postgres(ql)?$/ }),
  }),
  redis: z.object({
    url: z.url({ protocol: /^rediss?$/ }),
  }),
  s3: z.object({
    accessKey: z.string().min(1),
    bucket: z.string().min(1),
    endpoint: z.url(),
    region: z.string().min(1),
    secretKey: z.string().min(1),
  }),
});

export type ServerConfigValue = z.infer<typeof ServerConfigSchema>;

const ServerEnvironmentSchema = z
  .object({
    APP_NAME: z.string(),
    BETTER_AUTH_ADMIN_USER_IDS: z.string().optional().default(""),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    IMGPROXY_KEY: z.string(),
    IMGPROXY_SALT: z.string(),
    IMGPROXY_URL: z.string(),
    POSTGRES_ADMIN_URL: z.string(),
    POSTGRES_URL: z.string(),
    REDIS_URL: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_BUCKET: z.string(),
    S3_ENDPOINT: z.string(),
    S3_REGION: z.string(),
    S3_SECRET_KEY: z.string(),
  })
  .transform((environment) => ({
    app: { name: environment.APP_NAME },
    auth: {
      adminUserIds: environment.BETTER_AUTH_ADMIN_USER_IDS.split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
      secret: environment.BETTER_AUTH_SECRET,
      url: environment.BETTER_AUTH_URL,
    },
    images: {
      imgproxy: {
        key: environment.IMGPROXY_KEY,
        salt: environment.IMGPROXY_SALT,
        url: environment.IMGPROXY_URL,
      },
    },
    postgres: {
      adminUrl: environment.POSTGRES_ADMIN_URL,
      url: environment.POSTGRES_URL,
    },
    redis: { url: environment.REDIS_URL },
    s3: {
      accessKey: environment.S3_ACCESS_KEY,
      bucket: environment.S3_BUCKET,
      endpoint: environment.S3_ENDPOINT,
      region: environment.S3_REGION,
      secretKey: environment.S3_SECRET_KEY,
    },
  }))
  .pipe(ServerConfigSchema);

export function parseServerConfig(
  environment: Record<string, string | undefined>,
): ServerConfigValue {
  return ServerEnvironmentSchema.parse(environment);
}

/** Server-only configuration. Never import from a browser-reachable module. */
export const ServerConfig = parseServerConfig(process.env);
