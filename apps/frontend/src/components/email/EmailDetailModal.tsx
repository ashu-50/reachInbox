import { Modal } from "../ui/Modal";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../../utils/date";
import type { DisplayEmail } from "./EmailRow";

export function EmailDetailModal({ email, onClose }: { email: DisplayEmail | null; onClose: () => void }) {
  if (!email) return null;
  return <Modal open={!!email} onClose={onClose} size="lg" title={email.subject}>
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#edf0ee] pb-4 text-xs"><span><b className="font-medium">To:</b> {email.recipient}</span>{email.senderEmail && <span><b className="font-medium">From:</b> {email.senderEmail}</span>}<StatusBadge status={email.status} /></div>
      <div className="py-5 text-xs leading-6 text-[#30353a]" dangerouslySetInnerHTML={{ __html: email.body }} />
      <div className="border-t border-[#edf0ee] pt-3 text-[10px] text-[#999fa4]">Scheduled: {formatDateTime(email.scheduledAt)}{email.sentAt ? ` · Sent: ${formatDateTime(email.sentAt)}` : ""}</div>
    </div>
  </Modal>;
}
