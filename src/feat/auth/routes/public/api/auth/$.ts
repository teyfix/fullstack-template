import { createFileRoute } from "@tanstack/solid-router";

import { auth } from "../../../../auth";

const handle = ({ request }: Readonly<{ request: Request }>) =>
  auth.handler(request);

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handle, POST: handle } },
});
