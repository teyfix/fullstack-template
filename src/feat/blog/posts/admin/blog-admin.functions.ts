import { createServerFn } from "@tanstack/solid-start";
import { z } from "zod";

import { authorizeBlogAdministration } from "./post-auth.integration.server";

const BlogAdminQuerySchema = z.object({}).strict();

export const fetchBlogAdminIdentity = createServerFn({
  method: "GET",
})
  .validator(BlogAdminQuerySchema)
  .handler(async () => await authorizeBlogAdministration());
