import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, logout as logoutRequest } from "@/api/authApi";
import { isApiError } from "@/api/client";
import type { User } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Re-checks GET /api/auth/me - call after returning from the Google OAuth redirect. */
  refresh: () => Promise<void>;
  /** POST /api/auth/logout, then clears local state. Throws on failure so callers can toast. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (err) {
      // A 401 UNAUTHORIZED here is the expected, normal "not signed in"
      // state - not an application error - so it's never surfaced as one.
      // Any other failure (network down, etc.) also just falls back to the
      // login screen rather than getting stuck on a loading spinner forever.
      if (!isApiError(err) || err.code !== "UNAUTHORIZED") {
        // eslint-disable-next-line no-console
        console.error("[auth] failed to load current user", err);
      }
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, refresh, logout }),
    [status, user, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}