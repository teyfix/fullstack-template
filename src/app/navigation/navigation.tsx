import { type Component, For, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

import { cn } from "../ui/cn";

export type NavigationContribution = Readonly<{
  component: Component;
  id: string;
  order: number;
}>;

export type NavigationProps = Readonly<{
  ariaLabel: string;
  children?: JSX.Element;
  class?: string;
  contributions: readonly NavigationContribution[];
}>;

export const navigationLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

export const navigationLinkActiveClass = "bg-accent text-accent-foreground";

export function orderNavigationContributions(
  contributions: readonly NavigationContribution[],
): readonly NavigationContribution[] {
  return [...contributions].sort(
    (left, right) =>
      left.order - right.order || left.id.localeCompare(right.id),
  );
}

function NavigationContributionView(props: {
  contribution: NavigationContribution;
}) {
  return <Dynamic component={props.contribution.component} />;
}

/** Application-owned semantic wrapper for generated feature navigation. */
export function Navigation(props: NavigationProps) {
  return (
    <nav
      aria-label={props.ariaLabel}
      class={cn("flex flex-wrap items-center gap-1", props.class)}
    >
      {props.children}
      <For each={orderNavigationContributions(props.contributions)}>
        {(contribution) => (
          <NavigationContributionView contribution={contribution} />
        )}
      </For>
    </nav>
  );
}
