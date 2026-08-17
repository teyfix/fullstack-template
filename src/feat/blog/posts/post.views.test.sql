SELECT
  "id",
  "author_id",
  "body",
  "excerpt",
  "published_at",
  "slug",
  "state",
  "title",
  "created_at",
  "updated_at"
FROM
  "journal"."blog_post"
WHERE
  ("journal"."blog_post"."deleted_at" IS NULL)
