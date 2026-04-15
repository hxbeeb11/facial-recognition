import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Outer shell for identify upload forms (matches enroll visual language). */
export function IdentifyFormCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-950/5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-blue-500/35 to-transparent sm:inset-x-12"
        aria-hidden
      />
      <div className="relative p-4 sm:p-6">{children}</div>
    </div>
  );
}

export function IdentifyPanelSection({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-linear-to-br from-slate-50/95 to-white p-4 ring-1 ring-slate-950/[0.03] sm:p-5",
        className,
      )}
    >
      <div className="mb-3.5 flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600/12 to-blue-600/5 text-blue-700 ring-1 ring-blue-600/10"
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <h2 className="text-sm font-semibold tracking-tight text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export const identifyMatchCardClass =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-950/[0.04]";

export const identifyMatchCardHeaderClass =
  "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/90 bg-linear-to-r from-slate-50/95 to-white px-5 py-3.5";

/** Accent strip for match state (photo / shared). */
export function identifyMatchCardAccentClass(matched: boolean) {
  return matched
    ? "border-l-[3px] border-l-emerald-500"
    : "border-l-[3px] border-l-slate-300";
}

/** Summary row above result cards (e.g. face counts). */
export function IdentifyResultsSummary({
  items,
  className,
}: {
  items: { label: string; value: string; tone?: "default" | "success" | "neutral" }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-linear-to-r from-white to-slate-50/90 p-3 shadow-sm ring-1 ring-slate-950/[0.03] sm:gap-3 sm:p-3.5",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
            item.tone === "success" &&
              "border-emerald-200/80 bg-emerald-50/80 text-emerald-950",
            item.tone === "neutral" && "border-slate-200/80 bg-slate-100/80 text-slate-800",
            (!item.tone || item.tone === "default") && "border-slate-200/60 bg-white text-slate-800",
          )}
        >
          <span className="text-xs font-medium text-slate-500">{item.label}</span>
          <span className="font-semibold tabular-nums tracking-tight">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Cosine distance with a simple relative bar (visual only; backend defines the real threshold).
 */
export function CosineDistancePanel({
  value,
  variant = "match",
  className,
}: {
  value: number;
  variant?: "match" | "below-threshold";
  className?: string;
}) {
  const cap = 0.85;
  const pct = Math.min(100, Math.max(5, (value / cap) * 100));
  const isMatch = variant === "match";

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 sm:p-4",
        isMatch
          ? "border-blue-200/90 bg-linear-to-br from-blue-50/90 via-white to-slate-50/30 shadow-sm shadow-blue-900/5"
          : "border-amber-200/80 bg-linear-to-br from-amber-50/60 via-white to-slate-50/20 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-2 gap-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Cosine distance
        </span>
        <span
          className={cn(
            "font-mono text-lg font-semibold tabular-nums leading-none sm:text-xl",
            isMatch ? "text-blue-900" : "text-amber-950",
          )}
        >
          {value.toFixed(4)}
        </span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200/70">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            isMatch
              ? "bg-linear-to-r from-blue-600 to-blue-400"
              : "bg-linear-to-r from-amber-500 to-amber-400",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        {isMatch
          ? "Lower is closer to the enrolled face. Your server threshold decides acceptance."
          : "Nearest gallery distance was still above your configured threshold."}
      </p>
    </div>
  );
}

/** Label + elevated frame for face crops in result rows. */
export function ResultFaceFrame({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <div className="rounded-2xl bg-white p-1.5 shadow-md shadow-slate-900/10 ring-1 ring-slate-200/90">
        {children}
      </div>
    </div>
  );
}

/** Source vs enrolled layout with optional connector arrow (photo matches). */
export function PhotoCompareRow({
  source,
  enrolled,
  showConnector = true,
}: {
  source: ReactNode;
  enrolled: ReactNode;
  showConnector?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-linear-to-br from-slate-100/80 to-slate-50/40 p-4 ring-1 ring-slate-200/70 sm:p-5">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <div className="flex justify-center sm:flex-1">{source}</div>
        {showConnector ? (
          <div
            className="flex shrink-0 items-center justify-center text-slate-300 sm:px-1"
            aria-hidden
          >
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
          </div>
        ) : null}
        <div className="flex justify-center sm:flex-1">{enrolled}</div>
      </div>
    </div>
  );
}

/** Video: first-seen timestamp + optional action slot. */
export function VideoFirstSeenPanel({
  frameIndex,
  timestampLabel,
  action,
}: {
  frameIndex: number;
  timestampLabel: string;
  action: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-linear-to-br from-indigo-50/50 via-white to-slate-50/40 p-4 shadow-sm ring-1 ring-slate-950/[0.03] sm:p-5">
      <div className="flex flex-wrap items-center gap-2 gap-y-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/15">
          <Clock className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600/80">
            First seen
          </p>
          <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
            Frame {frameIndex} · {timestampLabel}
          </p>
        </div>
        <div className="w-full sm:ml-auto sm:w-auto">{action}</div>
      </div>
    </div>
  );
}

export function IdentifyResultsIntro({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm ring-1 ring-slate-950/[0.03] sm:p-5", className)}>
      <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
