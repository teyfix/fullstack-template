import { z } from "zod";

export const SharedConfigSchema = z.object({
  runtime: z.object({
    environment: z.enum(["development", "test", "production"]),
  }),
});

export type SharedConfigValue = z.infer<typeof SharedConfigSchema>;

export function parseSharedConfig(
  environment: string | undefined,
): SharedConfigValue {
  return SharedConfigSchema.parse({ runtime: { environment } });
}

/** Values that are safe in both browser and server modules. */
export const SharedConfig = parseSharedConfig(process.env.NODE_ENV);
