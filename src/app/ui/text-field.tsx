import * as TextFieldPrimitive from "@kobalte/core/text-field";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "./cn";

export function TextField(
  props: ComponentProps<typeof TextFieldPrimitive.Root>,
) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TextFieldPrimitive.Root class={cn("grid gap-2", local.class)} {...rest} />
  );
}

export function TextFieldLabel(
  props: ComponentProps<typeof TextFieldPrimitive.Label>,
) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TextFieldPrimitive.Label
      class={cn("font-medium text-sm", local.class)}
      {...rest}
    />
  );
}

export function TextFieldInput(
  props: ComponentProps<typeof TextFieldPrimitive.Input>,
) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TextFieldPrimitive.Input
      class={cn(
        "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        local.class,
      )}
      {...rest}
    />
  );
}

export function TextFieldTextArea(
  props: ComponentProps<typeof TextFieldPrimitive.TextArea>,
) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TextFieldPrimitive.TextArea
      class={cn(
        "min-h-28 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
}

export function TextFieldDescription(
  props: ComponentProps<typeof TextFieldPrimitive.Description>,
) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TextFieldPrimitive.Description
      class={cn("text-muted-foreground text-sm", local.class)}
      {...rest}
    />
  );
}

export function TextFieldErrorMessage(
  props: ComponentProps<typeof TextFieldPrimitive.ErrorMessage>,
) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <TextFieldPrimitive.ErrorMessage
      class={cn("text-destructive text-sm", local.class)}
      {...rest}
    />
  );
}
