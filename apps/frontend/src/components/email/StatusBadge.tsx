export function StatusBadge({ status }: { status: string }) {
  const scheduled = status === "scheduled" || status === "processing";
  const failed = status === "failed";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-medium ${scheduled ? "bg-[#fff0df] text-[#e88722]" : failed ? "bg-[#fff0f0] text-[#c94040]" : "bg-[#f0f2f3] text-[#687078]"}`}>{status}</span>;
}
