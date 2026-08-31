/**
 * Lightweight, dependency-free recipient parser. Handles both .csv and
 * .txt: splits on newlines/commas/semicolons/tabs (a CSV of one email per
 * cell, one-per-line, or comma-separated all work the same way), trims,
 * lowercases for case-insensitive de-duplication, and validates each token
 * as a plausible email address before accepting it.
 *
 * This matches the backend's own recipient handling exactly
 * (apps/backend/src/services/campaign.service.ts also trims + lowercases +
 * de-dupes) - the frontend result here is a preview of what the backend
 * will end up doing, not a competing implementation.
 */

// Simple, permissive email check - good enough for client-side UX. The
// backend's zod `.email()` validator remains the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParsedRecipients {
  /** Unique, valid, lowercased email addresses, in first-seen order. */
  emails: string[];
  /** Count of tokens that looked like an attempted email but didn't validate. */
  invalidCount: number;
  /** Count of valid emails that were duplicates of an already-seen address. */
  duplicateCount: number;
}

export function parseRecipientsText(text: string): ParsedRecipients {
  const tokens = text
    .split(/[\n\r,;\t]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const seen = new Set<string>();
  const emails: string[] = [];
  let invalidCount = 0;
  let duplicateCount = 0;

  for (const token of tokens) {
    const normalized = token.toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      invalidCount += 1;
      continue;
    }
    if (seen.has(normalized)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(normalized);
    emails.push(normalized);
  }

  return { emails, invalidCount, duplicateCount };
}

const SUPPORTED_EXTENSIONS = [".csv", ".txt"];

export class UnsupportedFileTypeError extends Error {
  constructor(fileName: string) {
    super(`"${fileName}" isn't a .csv or .txt file.`);
    this.name = "UnsupportedFileTypeError";
  }
}

/** Reads and parses a File (from an <input type="file"> or drop event). */
export function parseRecipientsFile(file: File): Promise<ParsedRecipients> {
  const lowerName = file.name.toLowerCase();
  if (!SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return Promise.reject(new UnsupportedFileTypeError(file.name));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      resolve(parseRecipientsText(text));
    };
    reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
    reader.readAsText(file);
  });
}