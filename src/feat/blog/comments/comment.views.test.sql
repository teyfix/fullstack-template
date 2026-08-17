SELECT
  "id",
  "author_id",
  "body",
  "post_id",
  "state",
  "created_at",
  "updated_at"
FROM
  "journal"."blog_comment"
WHERE
  ("journal"."blog_comment"."deleted_at" IS NULL)
