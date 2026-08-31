import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; kind: "success" | "error" };
const ToastContext = createContext<{ success: (m: string) => void; error: (m: string) => void } | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Toast["kind"]) => { const id = Date.now() + Math.random(); setItems(x => [...x, { id, message, kind }]); window.setTimeout(() => setItems(x => x.filter(t => t.id !== id)), 3500); }, []);
  const value = useMemo(() => ({ success: (m: string) => push(m, "success"), error: (m: string) => push(m, "error") }), [push]);
  return <ToastContext.Provider value={value}>{children}<div className="fixed right-5 top-5 z-[70] flex w-80 flex-col gap-2">{items.map(t => <div key={t.id} className={`rounded-lg border bg-white px-4 py-3 text-xs shadow-lg ${t.kind === "success" ? "border-green-200" : "border-red-200"}`}>{t.message}</div>)}</div></ToastContext.Provider>;
}
export function useToast() { const c = useContext(ToastContext); if (!c) throw new Error("useToast must be used inside ToastProvider"); return c; }
