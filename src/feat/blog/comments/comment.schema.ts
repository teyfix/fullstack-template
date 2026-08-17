import "@tanstack/solid-start/server-only";

import { createDrizzleSchemaFactory, dateToIsoWire } from "@teyfix/drizzle/zod";
import { z } from "zod";

import { UserIdSchema } from "~/kernel/identity/identity";

import { CommentDomainSchema } from "./comment.dto";
import { activeComment } from "./comment.views";

const { createSelectSchema } = createDrizzleSchemaFactory(z);

export const CommentDatabaseDomainSchema = createSelectSchema(activeComment, {
  authorId: UserIdSchema,
  createdAt: dateToIsoWire(z),
  updatedAt: dateToIsoWire(z),
}).transform((value) => CommentDomainSchema.parse(value));
