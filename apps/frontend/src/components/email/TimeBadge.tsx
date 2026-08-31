import { IconClock } from "../icons";
import { formatListTimestamp } from "../../utils/date";
export function TimeBadge({ iso }: { iso: string }) { return <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0df] px-2 py-0.5 text-[9px] font-medium text-[#e88722]"><IconClock className="h-2.5 w-2.5" />{formatListTimestamp(iso)}</span>; }
