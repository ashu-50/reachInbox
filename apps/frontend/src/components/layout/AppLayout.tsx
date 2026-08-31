import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ToastProvider } from "../ui/Toast";

export function AppLayout() {
  return <ToastProvider><div className="min-h-screen bg-[#1d1d1d] p-0 md:p-4">
    <div className="mb-2 hidden px-1 text-[16px] font-medium text-[#888] md:block">Homepage</div>
    <div className="flex min-h-[calc(100vh-48px)] overflow-hidden bg-white shadow-sm">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-white"><Outlet /></main>
    </div>
  </div></ToastProvider>;
}
