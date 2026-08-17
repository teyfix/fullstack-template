import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { cn } from "./cn";

export type HeadingProps = ComponentProps<"h2"> & {
  level?: 1 | 2 | 3 | 4;
};

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

const headingClasses = {
  1: "text-4xl font-bold tracking-tight sm:text-5xl",
  2: "text-3xl font-semibold tracking-tight",
  3: "text-2xl font-semibold tracking-tight",
  4: "text-xl font-semibold tracking-tight",
} as const;

export function Heading(props: HeadingProps) {
  const [local, rest] = splitProps(props, ["class", "level"]);
  const level = () => local.level ?? 2;

  return (
    <Dynamic
      class={cn(headingClasses[level()], local.class)}
      component={headingTags[level()]}
      {...rest}
    />
  );
}

export function Text(props: ComponentProps<"p">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p class={cn("text-muted-foreground leading-7", local.class)} {...rest} />
  );
}
