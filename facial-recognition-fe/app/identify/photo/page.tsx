"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, FileImage, ImageIcon, Loader2, UserX2, Users } from "lucide-react";
import { EnrollmentProfileDetails } from "@/app/components/EnrollmentProfileDetails";
import {
  CosineDistancePanel,
  IdentifyFormCard,
  IdentifyPanelSection,
  IdentifyResultsIntro,
  IdentifyResultsSummary,
  PhotoCompareRow,
  ResultFaceFrame,
  identifyMatchCardAccentClass,
  identifyMatchCardClass,
  identifyMatchCardHeaderClass,
} from "@/app/components/identify/IdentifyChrome";
import { PageShell } from "@/app/components/PageShell";
import { SourceFaceCrop } from "@/app/components/SourceFaceCrop";
import { Badge } from "@/app/components/ui/Badge";
import { cn } from "@/lib/cn";
import { getApiBase } from "@/lib/config";
import {
  alertErrorClass,
  alertInfoClass,
  btnPrimary,
  codePillClass,
  mediaFrameClass,
} from "@/lib/ui-classes";
import type { FaceMatchItem, IdentifyImageResponse } from "@/lib/types";

const dropClass = cn(
  "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200/90 bg-linear-to-b from-slate-50/80 to-white px-4 py-8 text-center outline-none transition-all duration-200 hover:border-blue-400/50 hover:from-blue-50/40 hover:shadow-md hover:shadow-blue-900/5 focus-visible:ring-2 focus-visible:ring-blue-500/35",
  "min-h-36",
);

export default function IdentifyPhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<FaceMatchItem[] | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMatches(null);

    if (!file) {
      setError("Please add a photo.");
      return;
    }

    const fd = new FormData();
    fd.append("image", file);

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/identify/image`, {
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
      setMatches((data as IdentifyImageResponse).matches ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Photo matching"
      inlineHeader
      contentWidth="wide"
      description="Upload an image; we detect faces and compare them to your gallery using your match threshold."
    >
      <IdentifyFormCard>
        <IdentifyPanelSection icon={ImageIcon} title="Source image">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            Any image that may contain faces. Each detection is scored; enrolled people appear when the
            distance is within your configured limit.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className={dropClass}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/bmp"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                <div className="flex w-full flex-col items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Selected source preview"
                    className="max-h-44 w-auto max-w-full rounded-xl object-contain shadow-md ring-1 ring-slate-200/80"
                  />
                  <span className="text-xs font-medium text-slate-600">{file?.name}</span>
                  <span className="text-[11px] text-slate-400">Click to replace</span>
                </div>
              ) : (
                <>
                  <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200/80 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-200/60">
                    <ImageIcon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">Drop or click to upload</span>
                  <span className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP</span>
                </>
              )}
            </label>

            {error ? (
              <p className={alertErrorClass} role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-400">Runs on your API; no image is stored by this step alone.</span>
              <button
                type="submit"
                disabled={loading}
                className={cn(btnPrimary, "w-full rounded-xl shadow-md shadow-blue-900/20 sm:w-auto sm:min-w-50")}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running…
                  </>
                ) : (
                  "Run identification"
                )}
              </button>
            </div>
          </form>
        </IdentifyPanelSection>
      </IdentifyFormCard>

      {matches && matches.length > 0 && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <IdentifyResultsIntro
              className="flex-1"
              title="Results"
              description="Each card is one detected face. Compare source crops to enrolled portraits, then review distance and profile."
            />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/15">
              <Users className="h-5 w-5" aria-hidden />
            </div>
          </div>

          <IdentifyResultsSummary
            items={[
              { label: "Faces", value: String(matches.length), tone: "default" },
              {
                label: "Matched",
                value: String(matches.filter((x) => x.matched).length),
                tone: "success",
              },
              {
                label: "No match",
                value: String(matches.filter((x) => !x.matched).length),
                tone: "neutral",
              },
            ]}
          />

          {previewUrl && file && (
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-linear-to-br from-white via-slate-50/50 to-blue-50/20 p-4 shadow-md shadow-slate-900/5 ring-1 ring-slate-950/[0.04] sm:flex-row sm:items-center sm:gap-5 sm:p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/15">
                <FileImage className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Source file
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">{file.name}</p>
              </div>
              <div className={cn(mediaFrameClass, "h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-inner")}>
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}

          <ul className="space-y-6">
            {matches.map((m) => (
              <li
                key={m.face_index}
                className={cn(identifyMatchCardClass, identifyMatchCardAccentClass(!!m.matched))}
              >
                <div className={identifyMatchCardHeaderClass}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/[0.06] text-xs font-bold text-slate-600">
                      {m.face_index + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">Detected face</span>
                  </div>
                  {m.matched ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Gallery match
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      <UserX2 className="h-3.5 w-3.5" aria-hidden />
                      No match
                    </Badge>
                  )}
                </div>

                <div className="space-y-5 p-5 sm:space-y-6 sm:p-6">
                  {m.matched && m.person ? (
                    <>
                      {previewUrl && m.facial_area && m.matched_embedding_id ? (
                        <PhotoCompareRow
                          source={
                            <ResultFaceFrame label="From your image">
                              <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                                <SourceFaceCrop
                                  imageUrl={previewUrl}
                                  area={m.facial_area}
                                  className="block max-w-40"
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
                                  className="aspect-4/5 w-full max-w-40 object-cover"
                                />
                              </div>
                            </ResultFaceFrame>
                          }
                        />
                      ) : (
                        <div className="flex flex-wrap gap-6">
                          {previewUrl && m.facial_area ? (
                            <ResultFaceFrame label="From your image">
                              <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                                <SourceFaceCrop
                                  imageUrl={previewUrl}
                                  area={m.facial_area}
                                  className="block max-w-40"
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
                                  className="aspect-4/5 w-full max-w-40 object-cover"
                                />
                              </div>
                            </ResultFaceFrame>
                          ) : null}
                        </div>
                      )}

                      <div className="grid gap-5 lg:grid-cols-[1fr_min(280px)] lg:items-start">
                        <div className="min-w-0 space-y-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                              Matched identity
                            </p>
                            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                              {m.person.full_name}
                            </h3>
                            {m.person.external_id != null && m.person.external_id !== "" && (
                              <p className={cn(codePillClass, "mt-2 inline-block text-sm")}>
                                {m.person.external_id}
                              </p>
                            )}
                          </div>
                          {m.person.metadata != null && Object.keys(m.person.metadata).length > 0 && (
                            <EnrollmentProfileDetails metadata={m.person.metadata} />
                          )}
                        </div>
                        {m.cosine_distance != null && (
                          <CosineDistancePanel value={m.cosine_distance} variant="match" />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-5">
                      {previewUrl && m.facial_area ? (
                        <ResultFaceFrame label="From your image">
                          <div className={cn(mediaFrameClass, "overflow-hidden rounded-xl")}>
                            <SourceFaceCrop
                              imageUrl={previewUrl}
                              area={m.facial_area}
                              className="block max-w-40"
                            />
                          </div>
                        </ResultFaceFrame>
                      ) : null}
                      <div className="flex gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 ring-1 ring-slate-200/60">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/80">
                          <UserX2 className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">No enrolled match</p>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                            This detection is outside your current threshold. Enroll the person or tune
                            sensitivity in backend settings.
                          </p>
                        </div>
                      </div>
                      {m.cosine_distance != null && (
                        <CosineDistancePanel value={m.cosine_distance} variant="below-threshold" />
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {matches && matches.length === 0 && !loading && !error && (
        <p className={cn(alertInfoClass, "mt-6 rounded-2xl")}>
          No face detected in this image. Try another file or a clearer shot.
        </p>
      )}
    </PageShell>
  );
}
