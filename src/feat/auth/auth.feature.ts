import { defineFeature } from "../../../scripts/feature-discovery";

export const feature = defineFeature({
  contributions: [
    "database",
    "identity.provider",
    "messages",
    "navigation.admin",
    "navigation.public",
    "routes.admin",
    "routes.public",
  ],
  dependencies: [],
  id: "auth",
});
