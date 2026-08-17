import { createServerFn } from "@tanstack/solid-start";
import { z } from "zod";

import { requireAdminSession } from "./public/session.server";

const AdminIdentityQuerySchema = z.object({}).strict();

export const fetchAdminIdentity = createServerFn({ method: "GET" })
  .validator(AdminIdentityQuerySchema)
  .handler(async () => {
    const session = await requireAdminSession();
    return { id: session.user.id, name: session.user.name };
  });
