export type ClassValue = string | number | false | null | undefined;

/** Minimal classnames joiner - avoids adding a dependency for something this small. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}