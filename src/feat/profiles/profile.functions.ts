import { createServerFn } from "@tanstack/solid-start";

import { fetchProfileByHandleDomain } from "./profile.db";
import { ProfileHandleQuerySchema } from "./profile.dto";

export const fetchProfile = createServerFn({ method: "GET" })
  .validator(ProfileHandleQuerySchema)
  .handler(async ({ data }) => {
    return await fetchProfileByHandleDomain({ params: data, searchParams: {} });
  });
