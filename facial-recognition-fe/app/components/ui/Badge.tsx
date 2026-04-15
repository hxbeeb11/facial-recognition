import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  success:
    "border border-emerald-200/80 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-950/5",
  neutral: "border border-slate-200 bg-slate-100 text-slate-700 ring-1 ring-slate-950/5",
  warning: "border border-amber-200/80 bg-amber-50 text-amber-950 ring-1 ring-amber-950/5",
  info: "border border-blue-200/80 bg-blue-50 text-blue-900 ring-1 ring-blue-950/5",
  outline: "border border-slate-200 bg-white text-slate-700",
} as const;

export type BadgeVariant = keyof typeof variants;

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
};

export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
