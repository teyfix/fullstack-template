import { defineFeature } from "../../../scripts/feature-discovery";

export const feature = defineFeature({
  contributions: [
    "database",
    "messages",
    "navigation.admin",
    "navigation.public",
    "profile.sections",
    "routes.admin",
    "routes.public",
    "seeds",
  ],
  dependencies: ["auth", "profiles"],
  id: "blog",
});
