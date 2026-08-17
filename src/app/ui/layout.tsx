import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "./cn";

type LayoutProps = ComponentProps<"div">;

export function Container(props: LayoutProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", local.class)}
      {...rest}
    />
  );
}

export function Stack(props: LayoutProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cn("flex flex-col gap-6", local.class)} {...rest} />;
}

export function Cluster(props: LayoutProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn("flex flex-wrap items-center gap-3", local.class)}
      {...rest}
    />
  );
}
