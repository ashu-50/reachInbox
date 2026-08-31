import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "../components/ui/Spinner";

export function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-white"><Spinner size="lg" /></div>;
  }
  if (status === "authenticated") return <Navigate to="/scheduled" replace />;
  return <Outlet />;
}
