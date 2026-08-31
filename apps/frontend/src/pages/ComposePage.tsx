import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCampaign } from "../api/campaignApi";
import { useSenders } from "../hooks/useSenders";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { RecipientInput } from "../components/compose/RecipientInput";
import { RichTextEditor } from "../components/compose/RichTextEditor";
import { SendLaterPopover } from "../components/compose/SendLaterPopover";
import { IconArrowLeft, IconClock, IconPaperclip } from "../components/icons";
import { localInputValueToIso, nowAsLocalInputValue } from "../utils/date";
import { validateComposeForm, type ComposeFormValues } from "../utils/validation";
import { useToast } from "../components/ui/Toast";

function initialStart() { const d = new Date(Date.now() + 5 * 60_000); d.setSeconds(0, 0); const off = d.getTimezoneOffset() * 60_000; return new Date(d.getTime() - off).toISOString().slice(0, 16); }

export function ComposePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { senders, status: senderStatus, createSender } = useSenders();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [senderId, setSenderId] = useState("");
  const [delay, setDelay] = useState("2000");
  const [hourlyLimit, setHourlyLimit] = useState("100");
  const [startLocal, setStartLocal] = useState(initialStart);
  const [laterOpen, setLaterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [senderModal, setSenderModal] = useState(false);
  const [newSender, setNewSender] = useState({ name: "", email: "", hourlyLimit: "100" });

  const startIso = useMemo(() => localInputValueToIso(startLocal) ?? new Date(Date.now() + 5 * 60_000).toISOString(), [startLocal]);
  const values: ComposeFormValues = { subject, body, startTimeLocal: startLocal, delayBetweenEmails: delay, hourlyLimit, senderId, recipients };

  const schedule = async () => {
    const next = validateComposeForm(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const result = await createCampaign({ subject: subject.trim(), body, startTime: startIso, delayBetweenEmails: Number(delay), hourlyLimit: Number(hourlyLimit), senderId, recipients });
      toast.success(`Scheduled ${result.scheduledCount} of ${result.totalRecipients} recipients.`);
      navigate("/scheduled");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not schedule campaign.";
      toast.error(message);
    } finally { setSubmitting(false); }
  };

  const saveSender = async () => {
    if (!newSender.name.trim() || !newSender.email.trim()) return;
    try {
      const sender = await createSender({ email: newSender.email, name: newSender.name, hourlyLimit: Number(newSender.hourlyLimit) });
      setSenderId(sender.id); setSenderModal(false); setNewSender({ name: "", email: "", hourlyLimit: "100" }); toast.success("Sender added.");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not add sender."); }
  };

  return <div className="min-h-full bg-white">
    <header className="flex h-[54px] items-center justify-between border-b border-[#edf0ee] px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[15px] font-medium text-[#20262c]"><IconArrowLeft className="h-4 w-4" />Compose New Email</button>
      <div className="relative flex items-center gap-2"><button disabled title="Attachments are not supported by the current backend" className="rounded-full p-1 text-[#b2b7ba]"><IconPaperclip className="h-4 w-4" /></button><button type="button" onClick={() => setLaterOpen(v => !v)} className="rounded-full p-1 text-[#00a63c]"><IconClock className="h-4 w-4" /></button><Button variant="outline" className="px-4 py-1 text-[10px]" loading={submitting} onClick={() => void schedule()}>Send</Button>{laterOpen && <SendLaterPopover value={startIso} onChange={iso => { const date = new Date(iso); const off = date.getTimezoneOffset() * 60_000; setStartLocal(new Date(date.getTime() - off).toISOString().slice(0, 16)); }} onClose={() => setLaterOpen(false)} />}</div>
    </header>
    <div className="mx-auto w-full max-w-[680px] px-4 pb-10 pt-8">
      <div className="grid grid-cols-[45px_1fr] items-center border-b border-[#edf0ee] py-1"><label className="text-[10px] text-[#20262c]">From</label><div className="flex gap-2"><Select value={senderId} onChange={e => setSenderId(e.target.value)}>{senders.length === 0 && <option value="">No sender configured</option>}{senders.map(s => <option key={s.id} value={s.id}>{s.email}</option>)}</Select><Button type="button" variant="outline" className="h-9 shrink-0 rounded-lg px-3 text-[9px]" onClick={() => setSenderModal(true)}>+ Sender</Button></div></div>
      {senderStatus === "loading" && <p className="ml-[45px] mt-1 text-[9px] text-gray-400">Loading senders…</p>}
      {errors.senderId && <p className="ml-[45px] mt-1 text-[9px] text-red-500">{errors.senderId}</p>}
      <div className="grid grid-cols-[45px_1fr] items-start border-b border-[#edf0ee] py-1"><label className="pt-2 text-[10px] text-[#20262c]">To</label><div><RecipientInput recipients={recipients} onChange={setRecipients} error={errors.recipients} />{recipients.length > 0 && <p className="py-1 text-[9px] text-[#8f969b]">{recipients.length} email address{recipients.length === 1 ? "" : "es"} detected</p>}</div></div>
      <div className="grid grid-cols-[45px_1fr] items-center border-b border-[#edf0ee] py-1"><label className="text-[10px] text-[#20262c]">Subject</label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className={`h-8 bg-white px-1 ${errors.subject ? "ring-1 ring-red-300" : ""}`} /></div>
      {errors.subject && <p className="ml-[45px] text-[9px] text-red-500">{errors.subject}</p>}
      <div className="flex items-center gap-5 py-2 pl-[45px] text-[10px] text-[#20262c]"><label className="flex items-center gap-2">Delay between 2 emails <input value={delay} onChange={e => setDelay(e.target.value)} inputMode="numeric" placeholder="00" className="h-7 w-12 rounded-lg border border-[#e7e9e8] px-2 text-center text-[10px] outline-none" /></label><label className="flex items-center gap-2">Hourly Limit <input value={hourlyLimit} onChange={e => setHourlyLimit(e.target.value)} inputMode="numeric" placeholder="00" className="h-7 w-12 rounded-lg border border-[#e7e9e8] px-2 text-center text-[10px] outline-none" /></label></div>
      {(errors.delayBetweenEmails || errors.hourlyLimit) && <p className="ml-[45px] text-[9px] text-red-500">{errors.delayBetweenEmails ?? errors.hourlyLimit}</p>}
      <div className="mt-1 pl-[45px]"><RichTextEditor value={body} onChange={setBody} error={errors.body} /></div>
      <div className="mt-2 flex items-center justify-between pl-[45px]"><div className="text-[9px] text-[#a2a7aa]">Start time: {new Date(startIso).toLocaleString()}</div><button type="button" onClick={() => setStartLocal(nowAsLocalInputValue())} className="text-[9px] text-[#00a63c] hover:underline">Schedule from now</button></div>
    </div>

    <Modal open={senderModal} onClose={() => setSenderModal(false)} title="Add sender" size="sm"><div className="space-y-3 p-5"><Input value={newSender.name} onChange={e => setNewSender({ ...newSender, name: e.target.value })} placeholder="Sender name" /><Input type="email" value={newSender.email} onChange={e => setNewSender({ ...newSender, email: e.target.value })} placeholder="Sender email" /><Input type="number" min={1} value={newSender.hourlyLimit} onChange={e => setNewSender({ ...newSender, hourlyLimit: e.target.value })} placeholder="Hourly limit" /><div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setSenderModal(false)}>Cancel</Button><Button onClick={() => void saveSender()}>Add Sender</Button></div></div></Modal>
  </div>;
}
