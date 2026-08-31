import { NavLink, useNavigate } from "react-router-dom";
import { useScheduledEmails, useSentEmails } from "../../hooks/useEmails";
import { IconClock, IconSend } from "../icons";
import { Button } from "../ui/Button";
import { UserMenu } from "../user/UserMenu";

export function Sidebar() {
  const navigate = useNavigate();
  const scheduled = useScheduledEmails();
  const sent = useSentEmails();
  return <aside className="flex w-[176px] shrink-0 flex-col border-r border-[#edf0ee] bg-white px-5 py-4">
    <div className="mb-5 px-1 text-[24px] font-black tracking-[-2px] text-[#101214]">ONB</div>
    <UserMenu />
    <Button variant="outline" className="mt-2 h-6 w-full px-2 py-0 text-[10px]" onClick={() => navigate("/compose")}>Compose</Button>
    <div className="mt-4 px-2 text-[8px] uppercase tracking-wider text-[#b0b5b8]">Core</div>
    <nav className="mt-1 space-y-0.5">
      <NavLink to="/scheduled" className={({ isActive }) => `flex h-6 items-center gap-2 rounded-lg px-2 text-[10px] ${isActive ? "bg-[#dff3e7] text-[#24332a]" : "text-[#535a60] hover:bg-gray-50"}`}><IconClock className="h-3 w-3" />Scheduled<span className="ml-auto text-[8px] text-[#8d9690]">{scheduled.status === "success" ? scheduled.items.length : ""}</span></NavLink>
      <NavLink to="/sent" className={({ isActive }) => `flex h-6 items-center gap-2 rounded-lg px-2 text-[10px] ${isActive ? "bg-[#dff3e7] text-[#24332a]" : "text-[#535a60] hover:bg-gray-50"}`}><IconSend className="h-3 w-3" />Sent<span className="ml-auto text-[8px] text-[#8d9690]">{sent.status === "success" ? sent.items.length : ""}</span></NavLink>
    </nav>
  </aside>;
}
