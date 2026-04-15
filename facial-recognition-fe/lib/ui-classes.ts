/**
 * Enterprise UI tokens — spacing scale (4/6/8), consistent radii, subtle elevation.
 * Use with Tailwind; pair with globals.css variables where needed.
 */

/** Max width for app chrome (header + page headers). */
export const shellMax = "max-w-7xl";

/** Content column inside pages */
export const contentMax = {
  default: "max-w-3xl",
  wide: "max-w-5xl",
} as const;

/** Section label above blocks */
export const eyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500";

/** Card: white surface, hairline border, soft shadow (SaaS default) */
export const cardClass =
  "rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-950/5 ring-1 ring-slate-950/[0.02] sm:p-8";

/** Nested / inset panel */
export const cardInsetClass =
  "rounded-lg border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5";

/** Interactive card (home features) */
export const cardInteractiveClass =
  "rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm shadow-slate-950/5 ring-1 ring-slate-950/[0.02] transition duration-200 hover:border-slate-300/90 hover:shadow-md hover:shadow-slate-950/[0.06]";

export const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20";

export const textareaNotesClass =
  "min-h-[108px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20";

export const btnPrimary =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 outline-none transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm outline-none transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

/** Small actions (e.g. “Play at moment”) */
export const btnTertiary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500/30";

export const fieldLabelClass = "text-sm font-medium text-slate-700";

export const fieldHintClass = "text-xs text-slate-500";

export const fileDropClass =
  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center outline-none transition hover:border-blue-300/80 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-500/30";

export const alertErrorClass =
  "rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm ring-1 ring-red-950/5";

export const alertSuccessClass =
  "rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm ring-1 ring-emerald-950/5";

export const alertInfoClass =
  "rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-950/5";

/** Mono badge for IDs */
export const codePillClass =
  "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-medium text-slate-800";

/** Media frame (thumbnails) */
export const mediaFrameClass = "overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80 shadow-sm";

/** Results panel header row */
export const resultsHeaderClass =
  "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5";
