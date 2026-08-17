SELECT
  "id",
  "image",
  "name"
FROM
  "better_auth"."user"
WHERE
  "better_auth"."user"."id" IN ($1, $2)
ORDER BY
  "better_auth"."user"."id" ASC
