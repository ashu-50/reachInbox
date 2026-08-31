/**
 * Central date utilities. Every place in the app that shows or converts a
 * date goes through here, so formatting stays consistent and timezone
 * handling only has to be gotten right once.
 */

const shortDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit"
});

const fullDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

/** "Tue, 9:15 AM" style - used in list rows, matching the Figma's compact timestamp. */
export function formatListTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return shortDateTimeFormatter.format(date);
}

/** "Sep 1, 2026, 2:30 PM" style - used in detail views and forms. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return fullDateTimeFormatter.format(date);
}

/**
 * Converts the value of an <input type="datetime-local"> (always local
 * wall-clock time, no timezone suffix, e.g. "2026-09-01T14:30") into a
 * correct UTC ISO-8601 string for the backend. The native Date constructor
 * already interprets an unqualified "YYYY-MM-DDTHH:mm" string as local
 * time, so this is just `new Date(value).toISOString()` - no manual UTC
 * arithmetic, which is exactly the kind of subtle bug this helper exists to
 * avoid repeating in every component.
 */
export function localInputValueToIso(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Inverse of localInputValueToIso - formats a UTC ISO string back into local wall-clock "YYYY-MM-DDTHH:mm" for pre-filling a datetime-local input. */
export function isoToLocalInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** The minimum value usable in a datetime-local input right now, for the `min` attribute. */
export function nowAsLocalInputValue(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}