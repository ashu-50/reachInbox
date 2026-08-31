import { useRef, useState } from "react";
import { IconX, IconUpload } from "../icons";
import { parseRecipientsFile, parseRecipientsText } from "../../utils/csvParser";

export function RecipientInput({ recipients, onChange, error }: { recipients: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [draft, setDraft] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addText = (text: string) => {
    const parsed = parseRecipientsText(text);
    const merged = [...recipients];
    for (const email of parsed.emails) if (!merged.includes(email)) merged.push(email);
    onChange(merged);
  };
  const commit = () => { if (draft.trim()) { addText(draft); setDraft(""); } };
  const remove = (email: string) => onChange(recipients.filter(x => x !== email));
  return <div>
    <div className={`flex min-h-[34px] flex-wrap items-center gap-1 border-b px-0 py-1 ${error ? "border-red-300" : "border-[#edf0ee]"}`}>
      {recipients.slice(0, 4).map(email => <span key={email} className="inline-flex items-center gap-1 rounded-full border border-[#00a63c] bg-[#effbf4] px-2 py-0.5 text-[9px] text-[#257043]">{email}<button type="button" onClick={() => remove(email)}><IconX className="h-2.5 w-2.5" /></button></span>)}
      {recipients.length > 4 && <span className="rounded-full border border-[#00a63c] bg-[#effbf4] px-2 py-0.5 text-[9px] text-[#257043]">+{recipients.length - 4}</span>}
      <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === "," || e.key === ";") { e.preventDefault(); commit(); } }} onBlur={commit} className="h-7 min-w-[160px] flex-1 bg-transparent px-1 text-[11px] outline-none placeholder:text-[#a5aaae]" placeholder={recipients.length ? "" : "recipient@example.com"} />
      <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setFileError(null); try { const parsed = await parseRecipientsFile(file); onChange([...new Set([...recipients, ...parsed.emails])]); if (!parsed.emails.length) setFileError("No valid email addresses were found in this file."); } catch (err) { setFileError(err instanceof Error ? err.message : "Could not read the file."); } finally { e.target.value = ""; } }} />
      <button type="button" onClick={() => fileRef.current?.click()} className="mr-1 inline-flex items-center gap-1 text-[10px] font-medium text-[#00a63c] hover:underline"><IconUpload className="h-3 w-3" />Upload List</button>
    </div>
    {(error || fileError) && <p className="mt-1 text-[9px] text-red-500">{error ?? fileError}</p>}
  </div>;
}
