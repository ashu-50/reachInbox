import { API_BASE_URL, request } from "./client";
import type { User } from "@/types/auth";

/**
 * Google OAuth must start with a real browser navigation to the backend -
 * it cannot be an XHR/fetch, since the backend itself redirects to Google.
 * See apps/backend/src/controllers/auth.controller.ts googleAuthStart.
 */
export function googleLoginUrl(): string {
  return `${API_BASE_URL}/api/auth/google`;
}

/** GET /api/auth/me - throws ApiError with code "UNAUTHORIZED" (401) when not signed in. */
export async function fetchCurrentUser(): Promise<User> {
  const { user } = await request<{ user: User }>("/api/auth/me");
  return user;
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  await request<{ loggedOut: boolean }>("/api/auth/logout", { method: "POST" });
}