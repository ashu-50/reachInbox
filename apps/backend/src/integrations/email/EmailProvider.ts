export interface SendEmailInput {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailResult {
  messageId: string;
  recipient: string;
  previewUrl: string | null;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
