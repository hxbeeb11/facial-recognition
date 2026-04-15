import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { contentMax, eyebrowClass, shellMax } from "@/lib/ui-classes";

type PageShellProps = {
  title: string;
  description?: string;
  contentWidth?: "default" | "wide";
  /** Small label above the page title. */
  eyebrow?: string;
  /** Tighter header + content padding (e.g. dense forms). */
  compact?: boolean;
  /**
   * One slim row: title + description side by side. Omits eyebrow and saves vertical space.
   */
  inlineHeader?: boolean;
  children: ReactNode;
};

export function PageShell({
  title,
  description,
  contentWidth = "default",
  eyebrow = "Operations",
  compact = false,
  inlineHeader = false,
  children,
}: PageShellProps) {
  const contentPad = inlineHeader
    ? "py-4 sm:py-5"
    : compact
      ? "py-5 sm:py-6"
      : "py-8 sm:py-10";

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <header
        className={cn(
          "border-b border-slate-200/80 shadow-sm shadow-slate-950/[0.03]",
          inlineHeader
            ? "sticky top-0 z-40 bg-white/90 shadow-md shadow-slate-900/5 backdrop-blur-md backdrop-saturate-150"
            : "bg-white",
        )}
      >
        {inlineHeader ? (
          <div
            className={cn(
              "mx-auto flex max-w-full flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-x-4 sm:px-6 lg:px-8",
              shellMax,
            )}
          >
            <h1 className="shrink-0 text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {description ? (
              <>
                <span
                  className="hidden h-4 w-px shrink-0 bg-slate-200 sm:block"
                  aria-hidden
                />
                <p className="min-w-0 text-sm leading-snug text-slate-500">{description}</p>
              </>
            ) : null}
          </div>
        ) : (
          <div
            className={cn(
              "mx-auto px-4 sm:px-6 lg:px-8",
              compact ? "py-6 sm:py-7" : "py-10 sm:py-12",
              shellMax,
            )}
          >
            <p className={eyebrowClass}>{eyebrow}</p>
            <h1
              className={cn(
                "font-semibold tracking-tight text-slate-900 sm:leading-tight",
                compact ? "mt-2 text-2xl sm:text-[1.65rem]" : "mt-3 text-3xl sm:text-[2rem]",
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  "max-w-2xl leading-relaxed text-slate-600",
                  compact ? "mt-2 text-sm" : "mt-4 text-base",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-50 to-slate-100/80">
        <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", contentPad, shellMax)}>
          <div className={cn("mx-auto w-full", contentMax[contentWidth])}>{children}</div>
        </div>
      </div>
    </main>
  );
}
