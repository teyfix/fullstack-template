import { defineFeature } from "../../../scripts/feature-discovery";

export const feature = defineFeature({
  contributions: [
    "database",
    "messages",
    "navigation.admin",
    "routes.admin",
    "routes.public",
    "seeds",
  ],
  dependencies: ["auth"],
  id: "profiles",
});
