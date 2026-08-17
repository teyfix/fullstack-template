SELECT
  "author_id",
  "excerpt",
  "id",
  "published_at",
  "slug",
  "title"
FROM
  "journal"."active_blog_post"
WHERE
  "active_blog_post"."state" = $1
ORDER BY
  "active_blog_post"."published_at" DESC,
  "active_blog_post"."id" DESC
LIMIT
  $2
OFFSET
  $3
