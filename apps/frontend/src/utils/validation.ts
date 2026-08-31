/**
 * These mirror createCampaignSchema
 * (apps/backend/src/services/campaign.schema.ts) for immediate UX feedback
 * only. The backend re-validates everything server-side and is the actual
 * source of truth - if these two ever drift, the backend wins and its
 * VALIDATION_ERROR message is shown to the user regardless.
 */
export const CAMPAIGN_LIMITS = {
  subjectMaxLength: 500,
  delayMinMs: 0,
  delayMaxMs: 3_600_000,
  hourlyLimitMax: 10_000,
  recipientsMax: 50_000
} as const;

export interface ComposeFormValues {
  subject: string;
  body: string;
  startTimeLocal: string;
  delayBetweenEmails: string;
  hourlyLimit: string;
  senderId: string;
  recipients: string[];
}

export type ComposeFormErrors = Partial<Record<keyof ComposeFormValues, string>>;

export function validateComposeForm(values: ComposeFormValues): ComposeFormErrors {
  const errors: ComposeFormErrors = {};

  if (!values.subject.trim()) {
    errors.subject = "Subject is required.";
  } else if (values.subject.length > CAMPAIGN_LIMITS.subjectMaxLength) {
    errors.subject = `Subject must be ${CAMPAIGN_LIMITS.subjectMaxLength} characters or fewer.`;
  }

  if (!stripHtml(values.body).trim()) {
    errors.body = "Email body is required.";
  }

  if (!values.startTimeLocal) {
    errors.startTimeLocal = "Pick a date and time to send.";
  } else {
    const date = new Date(values.startTimeLocal);
    if (Number.isNaN(date.getTime())) {
      errors.startTimeLocal = "That date/time isn't valid.";
    } else if (date.getTime() < Date.now() - 60_000) {
      errors.startTimeLocal = "Scheduled time can't be in the past.";
    }
  }

  const delay = Number(values.delayBetweenEmails);
  if (values.delayBetweenEmails === "" || Number.isNaN(delay) || !Number.isInteger(delay)) {
    errors.delayBetweenEmails = "Enter a whole number of milliseconds.";
  } else if (delay < CAMPAIGN_LIMITS.delayMinMs || delay > CAMPAIGN_LIMITS.delayMaxMs) {
    errors.delayBetweenEmails = `Must be between ${CAMPAIGN_LIMITS.delayMinMs} and ${CAMPAIGN_LIMITS.delayMaxMs} ms.`;
  }

  const hourly = Number(values.hourlyLimit);
  if (values.hourlyLimit === "" || Number.isNaN(hourly) || !Number.isInteger(hourly)) {
    errors.hourlyLimit = "Enter a whole number.";
  } else if (hourly <= 0 || hourly > CAMPAIGN_LIMITS.hourlyLimitMax) {
    errors.hourlyLimit = `Must be between 1 and ${CAMPAIGN_LIMITS.hourlyLimitMax}.`;
  }

  if (!values.senderId) {
    errors.senderId = "Choose a sender.";
  }

  if (values.recipients.length === 0) {
    errors.recipients = "Add at least one recipient.";
  } else if (values.recipients.length > CAMPAIGN_LIMITS.recipientsMax) {
    errors.recipients = `Too many recipients (max ${CAMPAIGN_LIMITS.recipientsMax.toLocaleString()}).`;
  }

  return errors;
}

/** Strips HTML tags to check whether a contentEditable body is actually empty. */
export function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? "";
}