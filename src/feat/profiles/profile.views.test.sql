SELECT
  "id",
  "bio",
  "display_name",
  "handle",
  "user_id",
  "created_at",
  "updated_at"
FROM
  "journal"."profile"
WHERE
  ("journal"."profile"."deleted_at" IS NULL)
