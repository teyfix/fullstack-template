import "@tanstack/solid-start/server-only";

import { createDrizzleSchemaFactory, dateToIsoWire } from "@teyfix/drizzle/zod";
import { z } from "zod";

import { UserIdSchema } from "~/kernel/identity/identity";

import { PostDomainSchema, PostSummaryDomainSchema } from "./post.dto";
import { activePost } from "./post.views";

const { createSelectSchema } = createDrizzleSchemaFactory(z);
const nullableDateToIsoWire = z
  .date()
  .nullable()
  .transform((value) => value?.toISOString() ?? null);

export const PostDatabaseDomainSchema = createSelectSchema(activePost, {
  authorId: UserIdSchema,
  createdAt: dateToIsoWire(z),
  publishedAt: nullableDateToIsoWire,
  updatedAt: dateToIsoWire(z),
}).transform((value) => PostDomainSchema.parse(value));

export const PostSummaryDatabaseDomainSchema = createSelectSchema(activePost, {
  authorId: UserIdSchema,
  publishedAt: nullableDateToIsoWire,
})
  .pick({
    authorId: true,
    excerpt: true,
    id: true,
    publishedAt: true,
    slug: true,
    title: true,
  })
  .transform((value) => PostSummaryDomainSchema.parse(value));
