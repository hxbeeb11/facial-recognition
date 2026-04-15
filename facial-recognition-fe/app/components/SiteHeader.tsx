"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanFace } from "lucide-react";
import { cn } from "@/lib/cn";
import { shellMax } from "@/lib/ui-classes";

const nav = [
  { href: "/enroll", label: "Enroll" },
  { href: "/identify/photo", label: "Photo" },
  { href: "/identify/video", label: "Video" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-sm shadow-slate-950/5 backdrop-blur-md">
      <div className={cn("mx-auto flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8", shellMax)}>
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/25"
            aria-hidden
          >
            <ScanFace className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </span>
          <span className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
            Facial recognition
          </span>
        </Link>

        <nav
          className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/90 bg-slate-50/90 p-1 shadow-inner [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {nav.map(({ href, label }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
