import Link from "next/link";
import { ArrowRight, Database, ScanSearch, ShieldCheck } from "lucide-react";
import { btnPrimary, btnSecondary, shellMax } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        {/* Clip layer so blur/filter paint does not extend scrollable overflow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(37,99,235,0.11),transparent)]" />
          <div className="absolute -right-24 top-1/2 h-[min(28rem,50vw)] w-[min(28rem,50vw)] -translate-y-1/2 rounded-full bg-blue-500/6 blur-3xl" />
        </div>
        <div
          className={cn(
            "relative mx-auto grid gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_min(26rem,100%)] lg:items-center lg:gap-16 lg:px-8 lg:py-24",
            shellMax,
          )}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Facial recognition
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              Enroll identities. Match faces in photos and video.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600">
              This application maintains a structured gallery of people and their face embeddings. Upload
              enrollment portraits to register each individual, then run new stills or clips through the
              same pipeline to retrieve the closest gallery match when similarity is within your configured
              threshold.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
              Designed for clear workflows: separate paths for still images and video, with distance scores
              and crops to support human review—not a black-box decision.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/enroll" className={btnPrimary}>
                Enroll a person
                <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
              <Link href="/identify/photo" className={btnSecondary}>
                Match · photo
              </Link>
              <Link href="/identify/video" className={btnSecondary}>
                Match · video
              </Link>
            </div>
            <div className="mt-12 grid gap-4 border-t border-slate-100 pt-10 sm:grid-cols-3">
              <div className="flex gap-3 text-sm text-slate-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800">Controlled gallery</span> — enrollment
                  metadata stays with each record.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-slate-600">
                <ScanSearch className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800">Similarity search</span> — nearest-neighbour
                  match with a reported distance.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-slate-600">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="font-medium text-slate-800">Persistent store</span> — embeddings and
                  profiles backed by your database.
                </span>
              </div>
            </div>
          </div>

          <aside
            className="relative rounded-2xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50/90 p-6 shadow-lg shadow-slate-950/4 ring-1 ring-slate-950/3 sm:p-8"
            aria-labelledby="home-overview-heading"
          >
            <h2
              id="home-overview-heading"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              What you can do
            </h2>
            <ol className="mt-6 space-y-5">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Register individuals</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Add a portrait and optional profile fields. The system extracts a face embedding for
                    later comparison.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Probe new media</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Submit a photo or video sample. Detected faces are embedded and compared to the
                    gallery.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Review matches</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    When distance is within threshold, see the enrolled person, score, and supporting crops
                    for verification.
                  </p>
                </div>
              </li>
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
