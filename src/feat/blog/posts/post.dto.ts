import { z } from "zod";

import { UserIdSchema } from "~/kernel/identity/identity";

const SlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const PostSlugQuerySchema = z.object({ slug: SlugSchema });
export type PostSlugQuery = z.infer<typeof PostSlugQuerySchema>;

export const PostListQuerySchema = z.object({
  pagination: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      take: z.coerce.number().int().min(1).max(50).default(12),
    })
    .default({ page: 1, take: 12 }),
});
export type PostListQuery = z.infer<typeof PostListQuerySchema>;

export const CreatePostModelSchema = z.object({
  authorId: UserIdSchema,
  body: z.string().trim().min(1),
  excerpt: z.string().trim().min(1).max(300),
  slug: SlugSchema,
  state: z.enum(["draft", "published"]).default("draft"),
  title: z.string().trim().min(1).max(160),
});
export type CreatePostModel = z.infer<typeof CreatePostModelSchema>;

export const AdminCreatePostModelSchema = CreatePostModelSchema.omit({
  authorId: true,
  state: true,
}).extend({ state: z.enum(["draft", "published"]) });
export type AdminCreatePostModel = z.infer<typeof AdminCreatePostModelSchema>;

export const PostDomainSchema = z.object({
  authorId: UserIdSchema,
  body: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  excerpt: z.string(),
  id: z.uuid(),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  slug: SlugSchema,
  state: z.enum(["draft", "published"]),
  title: z.string(),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type PostDomain = z.infer<typeof PostDomainSchema>;

export const PostSummaryDomainSchema = PostDomainSchema.pick({
  authorId: true,
  excerpt: true,
  id: true,
  publishedAt: true,
  slug: true,
  title: true,
});
export type PostSummaryDomain = z.infer<typeof PostSummaryDomainSchema>;
