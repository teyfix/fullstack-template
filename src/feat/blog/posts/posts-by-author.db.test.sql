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
  (
    ("active_blog_post"."author_id" = $1)
    AND ("active_blog_post"."state" = $2)
  )
ORDER BY
  "active_blog_post"."published_at" DESC,
  "active_blog_post"."id" DESC
LIMIT
  $3
