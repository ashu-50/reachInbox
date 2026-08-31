import { useEffect, useRef } from "react";
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconListOrdered, IconListBullet, IconQuote, IconUndo, IconRedo } from "../icons";

const actions = [
  ["undo", IconUndo], ["redo", IconRedo], ["bold", IconBold], ["italic", IconItalic], ["underline", IconUnderline], ["insertOrderedList", IconListOrdered], ["insertUnorderedList", IconListBullet], ["formatBlock", IconQuote], ["strikeThrough", IconStrikethrough]
] as const;
export function RichTextEditor({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);
  const exec = (command: string) => { ref.current?.focus(); document.execCommand(command, false, command === "formatBlock" ? "blockquote" : undefined); onChange(ref.current?.innerHTML ?? ""); };
  return <div className={`overflow-hidden rounded-lg bg-[#fafafa] ${error ? "ring-1 ring-red-300" : ""}`}>
    <div ref={ref} contentEditable suppressContentEditableWarning onInput={e => onChange(e.currentTarget.innerHTML)} data-placeholder="Type Your Reply..." className="min-h-[245px] px-3 py-3 text-[12px] leading-5 text-[#30353a] outline-none empty:before:text-[#a9aeb2] empty:before:content-[attr(data-placeholder)]" />
    <div className="mx-3 mb-3 flex h-7 items-center gap-0 rounded-full bg-white px-1 text-[#858b90] shadow-sm">
      {actions.map(([cmd, Icon], i) => <span key={cmd} className="flex items-center"><button type="button" onMouseDown={e => e.preventDefault()} onClick={() => exec(cmd)} className="flex h-6 w-7 items-center justify-center rounded hover:bg-gray-100" title={cmd}><Icon className="h-3.5 w-3.5" /></button>{i === 1 || i === 4 || i === 6 ? <span className="h-4 w-px bg-[#e8e9e9]" /> : null}</span>)}
    </div>
    {error && <p className="px-3 pb-2 text-[9px] text-red-500">{error}</p>}
  </div>;
}
