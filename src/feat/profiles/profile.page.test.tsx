import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import type { UserId } from "~/kernel/identity/identity";

import { ProfilePage } from "./profile.page";
import {
  type ProfileSection,
  ProfileSectionsContext,
} from "./public/profile-section";

const profile = {
  bio: "Mathematician",
  createdAt: "2026-08-17T12:00:00.000Z",
  displayName: "Ada Lovelace",
  handle: "ada-lovelace",
  id: "10000000-0000-4000-8000-000000000001",
  updatedAt: "2026-08-17T12:00:00.000Z",
  userId: "00000000-0000-4000-8000-000000000001" as UserId,
} as const;

describe("ProfilePage", () => {
  test("renders sections supplied through the profiles extension contract", () => {
    const section: ProfileSection = {
      id: "example.activity",
      order: 10,
      render: ({ handle }) => `Activity for ${handle}`,
    };

    render(() => (
      <ProfileSectionsContext.Provider value={[section]}>
        <ProfilePage aboutLabel="About" profile={profile} title="Profile" />
      </ProfileSectionsContext.Provider>
    ));

    expect(screen.getByText("Activity for ada-lovelace")).toBeInTheDocument();
  });
});
