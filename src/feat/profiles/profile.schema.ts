import "@tanstack/solid-start/server-only";

import { createDrizzleSchemaFactory, dateToIsoWire } from "@teyfix/drizzle/zod";
import { z } from "zod";

import { UserIdSchema } from "~/kernel/identity/identity";

import { ProfileDomainSchema } from "./profile.dto";
import { activeProfile } from "./profile.views";

const { createSelectSchema } = createDrizzleSchemaFactory(z);

/** Server-only adapter from the active Drizzle view to the wire domain. */
export const ProfileDatabaseDomainSchema = createSelectSchema(activeProfile, {
  createdAt: dateToIsoWire(z),
  updatedAt: dateToIsoWire(z),
  userId: UserIdSchema,
}).transform((value) => ProfileDomainSchema.parse(value));
