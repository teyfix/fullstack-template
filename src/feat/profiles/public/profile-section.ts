import { createContext, type JSX, useContext } from "solid-js";

import type { UserId } from "~/kernel/identity/identity";

/** Extension point: providers own the section and disappear with their feature. */
export interface ProfileSection {
  readonly id: string;
  readonly order: number;
  render(options: Readonly<{ handle: string; userId: UserId }>): JSX.Element;
}

export const ProfileSectionsContext = createContext<readonly ProfileSection[]>(
  [],
);

export function useProfileSections(): readonly ProfileSection[] {
  return useContext(ProfileSectionsContext);
}

export function orderProfileSections(
  sections: readonly ProfileSection[],
): readonly ProfileSection[] {
  return [...sections].sort(
    (left, right) =>
      left.order - right.order || left.id.localeCompare(right.id),
  );
}
