import * as ButtonPrimitive from "@kobalte/core/button";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "./cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2",
        icon: "size-9",
        lg: "h-10 px-6",
        sm: "h-8 px-3",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      },
    },
  },
);

export type ButtonProps = ComponentProps<typeof ButtonPrimitive.Root> &
  VariantProps<typeof buttonVariants>;

/** Application button primitive backed by Kobalte accessibility behavior. */
export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["class", "size", "variant"]);

  return (
    <ButtonPrimitive.Root
      class={cn(
        buttonVariants({ size: local.size, variant: local.variant }),
        local.class,
      )}
      {...rest}
    />
  );
}
