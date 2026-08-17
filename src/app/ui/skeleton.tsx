import * as SkeletonPrimitive from "@kobalte/core/skeleton";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "./cn";

export type SkeletonProps = ComponentProps<typeof SkeletonPrimitive.Root>;

/** Accessible loading placeholder backed by Kobalte. */
export function Skeleton(props: SkeletonProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <SkeletonPrimitive.Root
      class={cn("animate-pulse rounded-md bg-muted", local.class)}
      {...rest}
    />
  );
}
