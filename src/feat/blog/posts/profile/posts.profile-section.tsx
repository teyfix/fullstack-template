import { Link } from "@tanstack/solid-router";
import {
  "blog.posts.list.read" as blogPostsListRead,
  "blog.posts.profile.section.title" as blogPostsProfileSectionTitle,
} from "~/app/paraglide/messages.js";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/ui/card";
import type { ProfileSection } from "~/feat/profiles/public/profile-section";

export const postsProfileSection: ProfileSection = {
  id: "blog.posts",
  order: 20,
  render: ({ handle }) => (
    <Card>
      <CardHeader>
        <CardTitle>{blogPostsProfileSectionTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          class="font-medium text-primary text-sm underline-offset-4 hover:underline"
          params={{ handle }}
          to="/profiles/$handle/posts"
        >
          {blogPostsListRead()}
        </Link>
      </CardContent>
    </Card>
  ),
};

export const profileSections = [postsProfileSection] as const;
