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
  "journal"."active_blog_post"
WHERE
  (
    ("active_blog_post"."slug" = $1)
    AND ("active_blog_post"."state" = $2)
  )
LIMIT
  $3
