import { z } from "zod";

import { UserIdSchema } from "~/kernel/identity/identity";

export const ProfileHandleQuerySchema = z.object({
  handle: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
});

export type ProfileHandleQuery = z.infer<typeof ProfileHandleQuerySchema>;

export const UpdateProfileModelSchema = z.object({
  bio: z.string().trim().max(500).nullable(),
  displayName: z.string().trim().min(1).max(80),
  handle: ProfileHandleQuerySchema.shape.handle,
});

export type UpdateProfileModel = z.infer<typeof UpdateProfileModelSchema>;

export const ProfileDomainSchema = z.object({
  bio: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  displayName: z.string(),
  handle: ProfileHandleQuerySchema.shape.handle,
  id: z.uuid(),
  updatedAt: z.iso.datetime({ offset: true }),
  userId: UserIdSchema,
});

export type ProfileDomain = z.infer<typeof ProfileDomainSchema>;
