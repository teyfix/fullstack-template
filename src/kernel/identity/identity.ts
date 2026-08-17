import { z } from "zod";

/** Provider-neutral identity used by domain features. */
export const UserIdSchema = z.uuid().brand<"UserId">();

export type UserId = z.infer<typeof UserIdSchema>;

export const IdentityDomainSchema = z.object({
  id: UserIdSchema,
  image: z.url().nullable(),
  name: z.string().trim().min(1),
});

export type IdentityDomain = z.infer<typeof IdentityDomainSchema>;

/**
 * Read-only port implemented by the authentication feature at composition time.
 * Consumers know identities, never Better Auth tables or session internals.
 */
export interface IdentityDirectory {
  findById(id: UserId): Promise<IdentityDomain | null>;
  findByIds(
    ids: readonly UserId[],
  ): Promise<ReadonlyMap<UserId, IdentityDomain>>;
}
