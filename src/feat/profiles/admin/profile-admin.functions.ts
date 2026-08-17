import { createServerFn } from "@tanstack/solid-start";
import { z } from "zod";

import { authorizeProfileAdministration } from "./profile-auth.integration.server";

const ProfileAdminQuerySchema = z.object({}).strict();

export const fetchProfileAdminIdentity = createServerFn({
  method: "GET",
})
  .validator(ProfileAdminQuerySchema)
  .handler(async () => await authorizeProfileAdministration());
