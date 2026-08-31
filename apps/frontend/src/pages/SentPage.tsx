import { useState } from "react";
import { EmailListView } from "../components/email/EmailListView";
import { useFailedEmails, useSentEmails } from "../hooks/useEmails";
import { Button } from "../components/ui/Button";
export function SentPage() {
  const [failed, setFailed] = useState(false);
  const sent = useSentEmails(); const failedState = useFailedEmails(); const state = failed ? failedState : sent;
  return <div className="relative h-full"><div className="absolute right-4 top-3 z-10 flex rounded-full bg-[#f4f6f5] p-0.5"><Button variant={failed ? "ghost" : "outline"} className="px-3 py-1 text-[9px]" onClick={() => setFailed(false)}>Sent</Button><Button variant={failed ? "outline" : "ghost"} className="px-3 py-1 text-[9px]" onClick={() => setFailed(true)}>Failed</Button></div><EmailListView title="Sent" items={state.items} status={state.status} errorMessage={state.errorMessage} refetch={state.refetch} mode={failed ? "failed" : "normal"} /></div>;
}
