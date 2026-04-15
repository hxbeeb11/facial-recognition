/** Keys stored in person.metadata from enrollment — keep in sync with backend enroll form. */
export const ENROLLMENT_METADATA_KEYS = [
  "job_title",
  "department",
  "email",
  "phone",
  "location",
  "notes",
] as const;

export const ENROLLMENT_FIELD_LABELS: Record<(typeof ENROLLMENT_METADATA_KEYS)[number], string> =
  {
    job_title: "Job title",
    department: "Department",
    email: "Email",
    phone: "Phone",
    location: "Location",
    notes: "Notes",
  };
