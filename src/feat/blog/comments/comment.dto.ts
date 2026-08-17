import { z } from "zod";

import { UserIdSchema } from "~/kernel/identity/identity";

export const CommentListQuerySchema = z.object({
  postId: z.uuid(),
});
export type CommentListQuery = z.infer<typeof CommentListQuerySchema>;

export const CreateCommentModelSchema = z.object({
  authorId: UserIdSchema,
  body: z.string().trim().min(1).max(2_000),
  postId: z.uuid(),
});
export type CreateCommentModel = z.infer<typeof CreateCommentModelSchema>;

export const CommentDomainSchema = z.object({
  authorId: UserIdSchema,
  body: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  id: z.uuid(),
  postId: z.uuid(),
  state: z.enum(["pending", "published", "rejected"]),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type CommentDomain = z.infer<typeof CommentDomainSchema>;
