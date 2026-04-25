"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

type Variant = "default" | "strong" | "light";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  highlight?: boolean;
};

const variantClass: Record<Variant, string> = {
  default: "glass",
  strong: "glass-strong",
  light: "glass-light",
};

export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { className, variant = "default", highlight = true, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      {...rest}
      className={cn(
        variantClass[variant],
        highlight && "glass-highlight",
        "rounded-3xl",
        className
      )}
    />
  );
});
