import { useMemo, useState } from "react";
import { IconFilter, IconRefresh, IconSearch } from "../icons";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { useEmailSearch } from "../../hooks/useEmails";
import { EmailDetailModal } from "./EmailDetailModal";
import { EmailRow, type DisplayEmail } from "./EmailRow";
import type { EmailSearchResult, ScheduledEmailWithSender } from "../../types/email";

function scheduledAdapter(e: ScheduledEmailWithSender): DisplayEmail { return { id: e.id, recipient: e.recipient, subject: e.subject, body: e.body, status: e.status, scheduledAt: e.scheduledAt, sentAt: e.sentAt, senderEmail: e.sender?.email }; }
function searchAdapter(e: EmailSearchResult): DisplayEmail { return { id: e.id, recipient: e.recipient, subject: e.subject, body: e.body, status: e.status, scheduledAt: e.scheduledAt, sentAt: e.sentAt }; }

export function EmailListView({ title, items, status, errorMessage, refetch, mode = "normal" }: { title: string; items: ScheduledEmailWithSender[] | EmailSearchResult[]; status: "loading" | "success" | "error"; errorMessage: string | null; refetch: () => Promise<void>; mode?: "normal" | "failed" }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DisplayEmail | null>(null);
  const search = useEmailSearch(query);
  const displayItems = useMemo(() => {
    if (query.trim()) return search.results.map(searchAdapter);
    return items.map((e) => "sender" in e ? scheduledAdapter(e) : searchAdapter(e));
  }, [query, search.results, items]);
  return <div className="h-full">
    <div className="flex h-[54px] items-center gap-2 border-b border-[#edf0ee] px-3">
      <div className="relative w-[330px] max-w-[55%]"><IconSearch className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#a5aaae]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="h-7 w-full rounded-full bg-[#f5f7f6] pl-7 pr-3 text-[10px] outline-none placeholder:text-[#a4a9ad]" /></div>
      <button className="rounded-full p-1.5 text-[#9da3a8] hover:bg-gray-50"><IconFilter className="h-3 w-3" /></button>
      <button onClick={() => void refetch()} className="rounded-full p-1.5 text-[#9da3a8] hover:bg-gray-50"><IconRefresh className="h-3 w-3" /></button>
      <h1 className="ml-auto hidden text-xs font-semibold text-[#262b30] sm:block">{title}{mode === "failed" ? " · Failed" : ""}</h1>
    </div>
    {status === "loading" && !query.trim() && <div>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-3 border-b border-[#f0f1f0] px-3 py-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-16" /><Skeleton className="h-3 flex-1" /></div>)}</div>}
    {status === "error" && !query.trim() && <ErrorState message={errorMessage ?? "Unknown error"} onRetry={() => void refetch()} />}
    {status === "success" && displayItems.length === 0 && <EmptyState title={query ? "No emails found" : mode === "failed" ? "No failed emails" : `No ${title.toLowerCase()} emails`} description={query ? "Try a different search term." : "Your email activity will appear here."} />}
    {(status === "success" || query.trim()) && displayItems.map(e => <EmailRow key={e.id} email={e} onClick={() => setSelected(e)} />)}
    {query.trim() && search.status === "loading" && <div className="px-4 py-5 text-xs text-gray-400">Searching…</div>}
    {query.trim() && search.status === "error" && <div className="px-4 py-5 text-xs text-red-500">{search.errorMessage}</div>}
    <EmailDetailModal email={selected} onClose={() => setSelected(null)} />
  </div>;
}
