"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Film, Loader2, Play, UserRound, Video } from "lucide-react";
import { EnrollmentProfileDetails } from "@/app/components/EnrollmentProfileDetails";
import {
  CosineDistancePanel,
  IdentifyFormCard,
  IdentifyPanelSection,
  IdentifyResultsIntro,
  IdentifyResultsSummary,
  PhotoCompareRow,
  ResultFaceFrame,
  VideoFirstSeenPanel,
  identifyMatchCardAccentClass,
  identifyMatchCardClass,
  identifyMatchCardHeaderClass,
} from "@/app/components/identify/IdentifyChrome";
import { PageShell } from "@/app/components/PageShell";
import { Badge } from "@/app/components/ui/Badge";
import { cn } from "@/lib/cn";
import { getApiBase } from "@/lib/config";
import {
  alertErrorClass,
  alertInfoClass,
  btnPrimary,
  btnTertiary,
  codePillClass,
  mediaFrameClass,
} from "@/lib/ui-classes";
import type { IdentifyVideoResponse, VideoMatchItem } from "@/lib/types";

function formatTimestamp(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00.0";
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}

const dropClass = cn(
  "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200/90 bg-linear-to-b from-slate-50/80 to-white px-4 py-8 text-center outline-none transition-all duration-200 hover:border-blue-400/50 hover:from-blue-50/40 hover:shadow-md hover:shadow-blue-900/5 focus-visible:ring-2 focus-visible:ring-blue-500/35",
  "min-h-36",
);

export default function IdentifyVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyVideoResponse | null>(null);

  useEffect(() => {
    if (!file) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function seekTo(sec: number) {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, sec);
    void el.play().catch(() => {});
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please add a video file.");
      return;
    }

    const fd = new FormData();
    fd.append("video", file);

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/identify/video`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail ?? data);
        throw new Error(detail || `Something went wrong (${res.status})`);
      }
      setResult(data as IdentifyVideoResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const matches = result?.matches ?? [];

  return (
    <PageShell
      title="Video matching"
      inlineHeader
      contentWidth="wide"
      description="Upload a clip; we sample frames, detect faces, and report gallery matches with timestamps and crops."
    >
      <IdentifyFormCard>
        <IdentifyPanelSection icon={Film} title="Video file">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            MP4, WebM, and other formats your browser can read. Processing uses sampled frames only; very
            long files may be truncated per server limits.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className={dropClass}>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/*"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200/80 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-200/60">
                <Film className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {file ? file.name : "Drop or click to choose video"}
              </span>
              <span className="mt-1 text-xs text-slate-500">MP4, WebM, QuickTime…</span>
            </label>

            {error ? (
              <p className={alertErrorClass} role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-400">Heavier than photo ID — RetinaFace + embeddings per sample.</span>
              <button
                type="submit"
                disabled={loading}
                className={cn(btnPrimary, "w-full rounded-xl shadow-md shadow-blue-900/20 sm:w-auto sm:min-w-50")}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Run identification"
                )}
              </button>
            </div>
          </form>
        </IdentifyPanelSection>
      </IdentifyFormCard>

      {result && matches.length > 0 && videoUrl && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <IdentifyResultsIntro
              className="flex-1"
              title="Source clip"
              description="Scrub with the player; each match card can jump to the first frame where we found that person."
            />
            <div className="flex shrink-0 items-center gap-2">
              {result.video_fps != null && (
                <Badge variant="info" className="rounded-xl px-3 py-1.5">
                  {result.video_fps} fps
                </Badge>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700 ring-1 ring-slate-200/80">
                <Video className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </div>

          <IdentifyResultsSummary
            items={[{ label: "People matched", value: String(matches.length), tone: "success" }]}
          />

          <div className="overflow-hidden rounded-2xl border border-slate-800/20 bg-slate-950 shadow-2xl shadow-slate-900/40 ring-1 ring-slate-900/40">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-linear-to-r from-slate-900 to-slate-800 px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Clip preview
              </span>
              <span className="text-[10px] text-slate-500">Native controls</span>
            </div>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="max-h-[min(440px,54vh)] w-full"
              preload="metadata"
            />
          </div>

          <IdentifyResultsIntro
            title="Matches"
            description="Side-by-side: best frame crop from your video and the enrolled portrait. Distance and timeline on the right."
          />

          <ul className="space-y-6">
            {matches.map((m: VideoMatchItem) => (
              <li
                key={m.person.id}
                className={cn(identifyMatchCardClass, identifyMatchCardAccentClass(true))}
              >
                <div className={identifyMatchCardHeaderClass}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-800 ring-1 ring-emerald-600/20">
                      <UserRound className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        Matched identity
                      </p>
                      <span className="text-base font-semibold tracking-tight text-slate-900">
                        {m.person.full_name}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" className="rounded-lg">
                    In gallery
                  </Badge>
                </div>

                <div className="space-y-5 p-5 sm:space-y-6 sm:p-6">
                  <div className="grid gap-5 lg:grid-cols-[1fr_min(300px)] lg:items-start">
                    <div className="min-w-0 space-y-4">
                      {m.face_crop_jpeg_base64 && m.matched_embedding_id ? (
                        <PhotoCompareRow
                          source={
                            <ResultFaceFrame label="Best frame crop">
                              <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                                <img
                                  src={`data:image/jpeg;base64,${m.face_crop_jpeg_base64}`}
                                  alt=""
                                  className="max-h-48 w-auto max-w-full object-contain"
                                />
                              </div>
                            </ResultFaceFrame>
                          }
                          enrolled={
                            <ResultFaceFrame label="Enrolled portrait">
                              <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                                <img
                                  src={`${getApiBase()}/api/v1/gallery/embeddings/${m.matched_embedding_id}/image`}
                                  alt={`Portrait of ${m.person.full_name}`}
                                  className="aspect-4/5 w-full max-w-44 object-cover"
                                />
                              </div>
                            </ResultFaceFrame>
                          }
                        />
                      ) : (
                        <div className="flex flex-wrap gap-6">
                          {m.face_crop_jpeg_base64 ? (
                            <ResultFaceFrame label="Best frame crop">
                              <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                                <img
                                  src={`data:image/jpeg;base64,${m.face_crop_jpeg_base64}`}
                                  alt=""
                                  className="max-h-48 w-auto object-contain"
                                />
                              </div>
                            </ResultFaceFrame>
                          ) : null}
                          {m.matched_embedding_id ? (
                            <ResultFaceFrame label="Enrolled portrait">
                              <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                                <img
                                  src={`${getApiBase()}/api/v1/gallery/embeddings/${m.matched_embedding_id}/image`}
                                  alt={`Portrait of ${m.person.full_name}`}
                                  className="aspect-4/5 w-full max-w-44 object-cover"
                                />
                              </div>
                            </ResultFaceFrame>
                          ) : null}
                        </div>
                      )}
                      {m.person.external_id != null && m.person.external_id !== "" && (
                        <p className={codePillClass}>{m.person.external_id}</p>
                      )}
                      {m.person.metadata != null && Object.keys(m.person.metadata).length > 0 && (
                        <EnrollmentProfileDetails metadata={m.person.metadata} />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col gap-4">
                      <CosineDistancePanel value={m.best_cosine_distance} variant="match" />
                      <VideoFirstSeenPanel
                        frameIndex={m.first_seen_frame_index}
                        timestampLabel={formatTimestamp(m.first_seen_timestamp_sec)}
                        action={
                          <button
                            type="button"
                            onClick={() => seekTo(m.first_seen_timestamp_sec)}
                            className={cn(
                              btnTertiary,
                              "w-full rounded-xl border-indigo-200/80 bg-white px-4 py-2.5 text-indigo-900 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/80 sm:w-auto",
                            )}
                          >
                            <Play className="h-4 w-4 text-indigo-600" aria-hidden />
                            Jump to moment
                          </button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && matches.length === 0 && !loading && !error && (
        <p className={cn(alertInfoClass, "mt-6 rounded-2xl")}>
          No enrolled individuals matched in the sampled frames. Try a clearer clip or enroll more people.
        </p>
      )}
    </PageShell>
  );
}
