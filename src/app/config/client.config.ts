import { z } from "zod";

export const ClientConfigSchema = z.object({
  app: z.object({
    name: z.string().min(1),
  }),
});

export type ClientConfigValue = z.infer<typeof ClientConfigSchema>;

export function parseClientConfig(environment: {
  VITE_APP_NAME?: string | undefined;
}): ClientConfigValue {
  return ClientConfigSchema.parse({ app: { name: environment.VITE_APP_NAME } });
}

/** Vite can statically exclude every non-public environment variable here. */
export const ClientConfig = parseClientConfig({
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
});
