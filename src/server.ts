import handler, { createServerEntry } from "@tanstack/solid-start/server-entry";

import { paraglideMiddleware } from "./app/paraglide/server.js";

export default createServerEntry({
  fetch(request: Request): Promise<Response> {
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
});
