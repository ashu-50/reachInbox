import { useEffect, type ReactNode } from "react";
import { IconX } from "../icons";

interface Props { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: "sm" | "md" | "lg"; }
export function Modal({ open, onClose, title, children, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-5" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`w-full ${widths[size]} rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,.12)]`}>
      {title && <div className="flex items-center justify-between border-b border-[#edf0ee] px-5 py-4"><h2 className="text-sm font-semibold text-[#202124]">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><IconX /></button></div>}
      {children}
    </div>
  </div>;
}
