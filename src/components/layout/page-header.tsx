"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, icon, actions, className }: Props) {
  return (
    <header className={cn("flex items-end justify-between gap-3 mb-6", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="hidden sm:grid w-12 h-12 place-items-center rounded-2xl bg-macaron-soft glass-highlight">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-warm">{title}</h1>
          {subtitle && <p className="text-sm opacity-70 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}
