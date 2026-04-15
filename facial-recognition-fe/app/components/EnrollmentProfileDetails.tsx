import {
  ENROLLMENT_FIELD_LABELS,
  ENROLLMENT_METADATA_KEYS,
} from "@/lib/enrollmentFields";
import { cardInsetClass } from "@/lib/ui-classes";

export function EnrollmentProfileDetails({ metadata }: { metadata: Record<string, unknown> }) {
  const entries = ENROLLMENT_METADATA_KEYS.map((key) => {
    const raw = metadata[key];
    if (raw === null || raw === undefined || String(raw).trim() === "") return null;
    return { key, label: ENROLLMENT_FIELD_LABELS[key], value: String(raw) };
  }).filter(Boolean) as { key: string; label: string; value: string }[];

  const extraKeys = Object.keys(metadata).filter(
    (k) => !(ENROLLMENT_METADATA_KEYS as readonly string[]).includes(k),
  );

  if (entries.length === 0 && extraKeys.length === 0) return null;

  return (
    <div className={cardInsetClass}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile</p>
      {entries.length > 0 && (
        <dl className="mt-4 divide-y divide-slate-200/80">
          {entries.map(({ key, label, value }) => (
            <div
              key={key}
              className={`grid gap-1 py-3 first:pt-0 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4 ${key === "notes" ? "sm:grid-cols-1" : ""}`}
            >
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="text-sm font-medium whitespace-pre-wrap break-words text-slate-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {extraKeys.length > 0 && (
        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <p className="text-xs font-semibold text-slate-500">Additional data</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 shadow-sm">
            {JSON.stringify(
              Object.fromEntries(extraKeys.map((k) => [k, metadata[k]])),
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
