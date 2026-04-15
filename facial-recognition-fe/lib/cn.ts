/** Join class names; later swap for clsx + tailwind-merge if added. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
