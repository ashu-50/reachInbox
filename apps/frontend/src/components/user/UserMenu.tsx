import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { IconChevronDown, IconLogOut } from "../icons";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return <div className="relative">
    <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-2 rounded-lg bg-[#f7f8f7] px-2 py-1.5 text-left hover:bg-[#f1f3f2]">
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" /> : <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8efe1] text-[11px]">{user.name.charAt(0)}</div>}
      <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-[#25292d]">{user.name}</span><span className="block truncate text-[8px] text-[#9ba1a6]">{user.email}</span></span><IconChevronDown className="h-3 w-3 text-gray-400" />
    </button>
    {open && <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-30 rounded-lg border border-[#e7e9e8] bg-white p-1 shadow-lg"><button onClick={() => void logout()} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"><IconLogOut className="h-3.5 w-3.5" />Logout</button></div>}
  </div>;
}
