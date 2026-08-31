import { EmailListView } from "../components/email/EmailListView";
import { useScheduledEmails } from "../hooks/useEmails";
export function ScheduledPage() { const state = useScheduledEmails(); return <EmailListView title="Scheduled" {...state} />; }
