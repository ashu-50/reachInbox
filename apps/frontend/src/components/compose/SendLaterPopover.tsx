import { IconClock, IconX } from "../icons";
import { Button } from "../ui/Button";
import { isoToLocalInputValue, localInputValueToIso } from "../../utils/date";

export function SendLaterPopover({ value, onChange, onClose }: { value: string; onChange: (iso: string) => void; onClose: () => void }) {
  const local = isoToLocalInputValue(value);
  return <div className="absolute right-0 top-10 z-40 w-[205px] rounded-lg border border-[#e6e8e7] bg-white p-3 shadow-[0_4px_14px_rgba(0,0,0,.13)]">
    <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-medium text-[#25292d]">Send Later</span><button onClick={onClose}><IconX className="h-3 w-3 text-gray-400" /></button></div>
    <label className="text-[9px] text-[#a0a5aa]">Pick date & time</label>
    <div className="mt-1 flex items-center gap-1 border-b border-[#edf0ee] pb-2"><IconClock className="h-3 w-3 text-[#a1a6aa]" /><input type="datetime-local" value={local} onChange={e => { const iso = localInputValueToIso(e.target.value); if (iso) onChange(iso); }} className="w-full bg-transparent text-[10px] outline-none" /></div>
    <div className="mt-2 space-y-1 text-[9px] text-[#626970]">
      {[1, 2, 3].map(h => <button key={h} type="button" className="block w-full rounded px-1 py-1 text-left hover:bg-gray-50" onClick={() => onChange(new Date(Date.now() + h * 3600000).toISOString())}>{h === 1 ? "In 1 hour" : `In ${h} hours`}</button>)}
    </div>
    <div className="mt-3 flex justify-end gap-2"><Button type="button" variant="ghost" className="px-2 py-1 text-[9px]" onClick={onClose}>Cancel</Button><Button type="button" variant="outline" className="px-3 py-1 text-[9px]" onClick={onClose}>Done</Button></div>
  </div>;
}
