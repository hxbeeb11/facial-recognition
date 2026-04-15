"use client";

import { type ReactNode, FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { PageShell } from "@/app/components/PageShell";
import { cn } from "@/lib/cn";
import { getApiBase } from "@/lib/config";
import {
  alertErrorClass,
  alertSuccessClass,
  btnPrimary,
  fieldLabelClass,
  inputClass,
} from "@/lib/ui-classes";

const initialProfile = {
  jobTitle: "",
  department: "",
  email: "",
  phone: "",
  location: "",
  notes: "",
};

function FormSection({
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
        "rounded-2xl border border-slate-200/70 bg-linear-to-br from-slate-50/95 to-white p-4 shadow-sm shadow-slate-900/[0.03] ring-1 ring-slate-950/[0.03] sm:p-5",
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

const inputModern = cn(
  inputClass,
  "rounded-xl border-slate-200/90 bg-white/90 transition-[border-color,box-shadow] focus:border-blue-500/90 focus:shadow-sm focus:shadow-blue-500/10",
);

export default function EnrollPage() {
  const [fullName, setFullName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [profile, setProfile] = useState(initialProfile);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

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
    setSavedName(null);

    if (!file) {
      setError("Please add a photo.");
      return;
    }
    if (!fullName.trim()) {
      setError("Name is required.");
      return;
    }

    const fd = new FormData();
    fd.append("full_name", fullName.trim());
    if (externalId.trim()) fd.append("external_id", externalId.trim());
    if (profile.jobTitle.trim()) fd.append("job_title", profile.jobTitle.trim());
    if (profile.department.trim()) fd.append("department", profile.department.trim());
    if (profile.email.trim()) fd.append("email", profile.email.trim());
    if (profile.phone.trim()) fd.append("phone", profile.phone.trim());
    if (profile.location.trim()) fd.append("location", profile.location.trim());
    if (profile.notes.trim()) fd.append("notes", profile.notes.trim());
    fd.append("image", file);

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/enroll`, {
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
      setSavedName(fullName.trim());
      setFullName("");
      setExternalId("");
      setProfile(initialProfile);
      setFile(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
        setError(
          "Could not reach the API (browser blocked the request). Use the same host for the app and API (e.g. open the site as http://127.0.0.1:3000 not http://localhost:3000 if the API is 127.0.0.1), check NEXT_PUBLIC_API_BASE_URL, or confirm the backend is running on port 8000.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const notesClass = cn(
    "min-h-[4.5rem] w-full resize-y rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500/90 focus:shadow-sm focus:shadow-blue-500/10 focus:ring-2 focus:ring-blue-500/15",
  );

  const dropClass = cn(
    "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200/90 bg-linear-to-b from-slate-50/80 to-white px-4 py-6 text-center outline-none transition-all duration-200 hover:border-blue-400/50 hover:from-blue-50/40 hover:shadow-md hover:shadow-blue-900/5 focus-visible:ring-2 focus-visible:ring-blue-500/35",
    "min-h-30 flex-1 sm:min-h-0 lg:min-h-42",
  );

  return (
    <PageShell
      title="Enroll"
      description="Portrait and full name are required. Everything else is optional."
      inlineHeader
      contentWidth="wide"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-950/5">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-blue-500/35 to-transparent sm:inset-x-12"
            aria-hidden
          />
          <div className="relative p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_min(300px,100%)] lg:gap-5">
              <FormSection icon={User} title="Identity">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={fieldLabelClass}>
                      Full name <span className="font-normal text-red-600">*</span>
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputModern}
                      placeholder="e.g. Jane Doe"
                      autoComplete="name"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={fieldLabelClass}>Reference ID</span>
                    <input
                      type="text"
                      value={externalId}
                      onChange={(e) => setExternalId(e.target.value)}
                      className={inputModern}
                      placeholder="Employee or internal ID"
                      autoComplete="off"
                    />
                  </label>
                </div>
              </FormSection>

              <FormSection icon={Camera} title="Portrait" className="flex flex-col lg:min-h-0">
                <label className={cn(dropClass, "flex-1")}>
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
                        alt="Selected portrait preview"
                        className="max-h-36 w-auto max-w-full rounded-xl object-contain shadow-md ring-1 ring-slate-200/80"
                      />
                      <span className="text-xs font-medium text-slate-600">{file?.name}</span>
                      <span className="text-[11px] text-slate-400">Click to replace</span>
                    </div>
                  ) : (
                    <>
                      <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200/80 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-200/60">
                        <Camera className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                      <span className="text-sm font-semibold text-slate-800">Drop or click to upload</span>
                      <span className="mt-1 max-w-[14rem] text-xs leading-relaxed text-slate-500">
                        Front-facing works best · JPG, PNG, WebP ·{" "}
                        <span className="font-medium text-red-600">Required</span>
                      </span>
                    </>
                  )}
                </label>
              </FormSection>
            </div>

            <div className="mt-4 lg:mt-5">
              <FormSection icon={Briefcase} title="Work">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={fieldLabelClass}>Job title</span>
                    <input
                      type="text"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
                      className={inputModern}
                      placeholder="e.g. Analyst"
                      autoComplete="organization-title"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={fieldLabelClass}>Department</span>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                      className={inputModern}
                      placeholder="e.g. Operations"
                      autoComplete="organization"
                    />
                  </label>
                </div>
              </FormSection>
            </div>

            <div className="mt-4 grid gap-4 lg:mt-5">
              <FormSection icon={Mail} title="Contact">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={fieldLabelClass}>Email</span>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className={inputModern}
                      placeholder="name@company.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={fieldLabelClass}>Phone</span>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className={inputModern}
                      placeholder="+1 · ext."
                      autoComplete="tel"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={fieldLabelClass}>Location</span>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      className={inputModern}
                      placeholder="City or office"
                      autoComplete="address-level2"
                    />
                  </label>
                </div>
              </FormSection>

              <FormSection icon={FileText} title="Notes">
                <label className="flex flex-col gap-1.5">
                  <span className="sr-only">Additional notes</span>
                  <textarea
                    value={profile.notes}
                    onChange={(e) => setProfile((p) => ({ ...p, notes: e.target.value }))}
                    className={notesClass}
                    placeholder="Optional context for your team"
                    rows={3}
                  />
                </label>
              </FormSection>
            </div>

            {error ? (
              <p className={cn(alertErrorClass, "mt-4")} role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Embeddings are created from the portrait after save.
              </p>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  btnPrimary,
                  "w-full rounded-xl shadow-md shadow-blue-900/20 sm:w-auto sm:min-w-50",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save enrollment"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {savedName ? (
        <div className={cn(alertSuccessClass, "mt-3")}>
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-semibold text-emerald-950">Enrollment saved</p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-900/90">
                <span className="font-semibold">{savedName}</span> is enrolled. Use Photo or Video matching
                to compare new media against the gallery.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
