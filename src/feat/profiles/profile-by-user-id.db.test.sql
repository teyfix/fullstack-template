SELECT
  "id",
  "bio",
  "display_name",
  "handle",
  "user_id",
  "created_at",
  "updated_at"
FROM
  "journal"."active_profile"
WHERE
  "active_profile"."user_id" = $1
LIMIT
  $2
