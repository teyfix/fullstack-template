SELECT
  "id",
  "image",
  "name"
FROM
  "better_auth"."user"
WHERE
  "better_auth"."user"."id" = $1
LIMIT
  $2
