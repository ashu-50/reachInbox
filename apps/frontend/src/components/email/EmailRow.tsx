import { IconStar } from "../icons";
import { StatusBadge } from "./StatusBadge";
import { TimeBadge } from "./TimeBadge";
import { formatListTimestamp } from "../../utils/date";

export interface DisplayEmail { id: string; recipient: string; subject: string; body: string; status: string; scheduledAt: string; sentAt: string | null; senderEmail?: string; }
export function EmailRow({ email, onClick }: { email: DisplayEmail; onClick: () => void }) {
  const preview = email.body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return <button onClick={onClick} className="group flex w-full items-center gap-2 border-b border-[#f0f1f0] px-3 py-2 text-left hover:bg-[#fafcfb]">
    <span className="w-[105px] shrink-0 truncate text-[10px] font-medium text-[#20252a]">To: {email.recipient}</span>
    <span className="w-[76px] shrink-0">{email.status === "scheduled" || email.status === "processing" ? <TimeBadge iso={email.scheduledAt} /> : <StatusBadge status={email.status} />}</span>
    <span className="min-w-0 flex-1 truncate text-[10px] text-[#30353a]"><b className="font-medium">{email.subject}</b><span className="text-[#a3a8ad]"> - {preview}</span></span>
    <IconStar className="h-3 w-3 shrink-0 text-[#c7ccd0] group-hover:text-[#8f969b]" />
    {email.status === "sent" && <span className="hidden w-[100px] shrink-0 text-right text-[9px] text-[#9ba1a6] sm:block">{email.sentAt ? formatListTimestamp(email.sentAt) : "-"}</span>}
  </button>;
}
