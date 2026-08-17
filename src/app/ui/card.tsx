import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";

import { cn } from "./cn";

type DivProps = ComponentProps<"div">;

export function Card(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        local.class,
      )}
      {...rest}
    />
  );
}

export function CardHeader(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn("grid gap-2 px-6", local.class)}
      data-slot="card-header"
      {...rest}
    />
  );
}

export function CardTitle(props: ComponentProps<"h2">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <h2
      class={cn("font-semibold leading-none", local.class)}
      data-slot="card-title"
      {...rest}
    />
  );
}

export function CardDescription(props: ComponentProps<"p">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <p
      class={cn("text-muted-foreground text-sm", local.class)}
      data-slot="card-description"
      {...rest}
    />
  );
}

export function CardContent(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class={cn("px-6", local.class)} data-slot="card-content" {...rest} />
  );
}

export function CardFooter(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn("flex items-center px-6", local.class)}
      data-slot="card-footer"
      {...rest}
    />
  );
}
