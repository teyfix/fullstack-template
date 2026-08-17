SELECT
  "id",
  "author_id",
  "body",
  "post_id",
  "state",
  "created_at",
  "updated_at"
FROM
  "journal"."active_blog_comment"
WHERE
  (
    ("active_blog_comment"."post_id" = $1)
    AND ("active_blog_comment"."state" = $2)
  )
ORDER BY
  "active_blog_comment"."created_at" ASC,
  "active_blog_comment"."id" ASC
