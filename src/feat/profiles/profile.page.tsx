import { For } from "solid-js";

import { Card, CardContent, CardHeader, CardTitle } from "~/app/ui/card";
import { Container, Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";

import type { ProfileDomain } from "./profile.dto";
import {
  type ProfileSection,
  useProfileSections,
} from "./public/profile-section";

export type ProfilePageProps = Readonly<{
  aboutLabel: string;
  profile: ProfileDomain;
  title: string;
}>;

function ProfileSectionContribution(props: {
  profile: ProfileDomain;
  section: ProfileSection;
}) {
  return props.section.render({
    handle: props.profile.handle,
    userId: props.profile.userId,
  });
}

export function ProfilePage(props: ProfilePageProps) {
  const sections = useProfileSections();
  return (
    <Container class="py-12">
      <Stack>
        <Stack class="gap-2">
          <Text>{props.title}</Text>
          <Heading level={1}>{props.profile.displayName}</Heading>
          <Text>@{props.profile.handle}</Text>
        </Stack>
        <Card>
          <CardHeader>
            <CardTitle>{props.aboutLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text>{props.profile.bio ?? "—"}</Text>
          </CardContent>
        </Card>
        <For each={sections}>
          {(section) => (
            <ProfileSectionContribution
              profile={props.profile}
              section={section}
            />
          )}
        </For>
      </Stack>
    </Container>
  );
}
