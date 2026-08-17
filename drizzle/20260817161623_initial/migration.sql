CREATE SCHEMA "journal";
--> statement-breakpoint
CREATE SCHEMA "better_auth";
--> statement-breakpoint
CREATE TYPE "journal"."blog_comment_state" AS ENUM('pending', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "journal"."blog_post_state" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "better_auth"."account" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "better_auth"."session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"impersonated_by" text
);
--> statement-breakpoint
CREATE TABLE "better_auth"."user" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp
);
--> statement-breakpoint
CREATE TABLE "better_auth"."verification" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal"."blog_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"post_id" uuid NOT NULL,
	"state" "journal"."blog_comment_state" DEFAULT 'pending'::"journal"."blog_comment_state" NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(6) with time zone,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal"."blog_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"excerpt" text NOT NULL,
	"published_at" timestamp(6) with time zone,
	"slug" text NOT NULL UNIQUE,
	"state" "journal"."blog_post_state" DEFAULT 'draft'::"journal"."blog_post_state" NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(6) with time zone,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal"."profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bio" text,
	"display_name" text NOT NULL,
	"handle" text NOT NULL UNIQUE,
	"user_id" uuid NOT NULL UNIQUE,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp(6) with time zone,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "better_auth"."account" ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "better_auth"."account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "better_auth"."session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "better_auth"."verification" ("identifier");--> statement-breakpoint
CREATE INDEX "blog_comment_author_id_idx" ON "journal"."blog_comment" ("author_id");--> statement-breakpoint
CREATE INDEX "blog_comment_post_id_idx" ON "journal"."blog_comment" ("post_id");--> statement-breakpoint
CREATE INDEX "blog_post_author_id_idx" ON "journal"."blog_post" ("author_id");--> statement-breakpoint
CREATE INDEX "blog_post_published_at_idx" ON "journal"."blog_post" ("published_at");--> statement-breakpoint
CREATE INDEX "profile_user_id_idx" ON "journal"."profile" ("user_id");--> statement-breakpoint
ALTER TABLE "better_auth"."account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "better_auth"."session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "journal"."blog_comment" ADD CONSTRAINT "blog_comment_post_id_blog_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "journal"."blog_post"("id") ON DELETE CASCADE;--> statement-breakpoint
CREATE VIEW "journal"."active_blog_comment" AS (select "id", "author_id", "body", "post_id", "state", "created_at", "updated_at" from "journal"."blog_comment" where ("journal"."blog_comment"."deleted_at" is null));--> statement-breakpoint
CREATE VIEW "journal"."active_blog_post" AS (select "id", "author_id", "body", "excerpt", "published_at", "slug", "state", "title", "created_at", "updated_at" from "journal"."blog_post" where ("journal"."blog_post"."deleted_at" is null));--> statement-breakpoint
CREATE VIEW "journal"."active_profile" AS (select "id", "bio", "display_name", "handle", "user_id", "created_at", "updated_at" from "journal"."profile" where ("journal"."profile"."deleted_at" is null));