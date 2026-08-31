import { useCallback, useEffect, useState } from "react";
import { listScheduledEmails, listSentEmails, searchEmails } from "@/api/emailApi";
import { toErrorMessage } from "@/api/client";
import type { EmailSearchResult, ScheduledEmailWithSender } from "@/types/email";

type Status = "loading" | "success" | "error";

interface ListState<T> {
  items: T[];
  status: Status;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

function useEmailList<T>(fetcher: () => Promise<T[]>): ListState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const result = await fetcher();
      setItems(result);
      setStatus("success");
    } catch (err) {
      setErrorMessage(toErrorMessage(err));
      setStatus("error");
    }
    // fetcher is intentionally excluded: callers pass a stable function reference per hook instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, status, errorMessage, refetch };
}

/** GET /api/emails/scheduled */
export function useScheduledEmails(): ListState<ScheduledEmailWithSender> {
  return useEmailList<ScheduledEmailWithSender>(listScheduledEmails);
}

/** GET /api/emails/sent - authoritative "sent" list. */
export function useSentEmails(): ListState<ScheduledEmailWithSender> {
  return useEmailList<ScheduledEmailWithSender>(listSentEmails);
}

/**
 * GET /api/emails/search?status=failed - the only way to see failed sends,
 * since neither /scheduled nor /sent ever returns status "failed". See the
 * contract note on ScheduledEmailWithSender in src/types/email.ts.
 */
export function useFailedEmails(): ListState<EmailSearchResult> {
  return useEmailList<EmailSearchResult>(() => searchEmails({ status: "failed" }));
}

interface SearchState {
  results: EmailSearchResult[];
  status: Status | "idle";
  errorMessage: string | null;
}

/** Debounced free-text search over GET /api/emails/search?q=... */
export function useEmailSearch(query: string, debounceMs = 300): SearchState {
  const [state, setState] = useState<SearchState>({ results: [], status: "idle", errorMessage: null });

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setState({ results: [], status: "idle", errorMessage: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, status: "loading", errorMessage: null }));

    const timer = window.setTimeout(async () => {
      try {
        const results = await searchEmails({ q: trimmed });
        if (!cancelled) setState({ results, status: "success", errorMessage: null });
      } catch (err) {
        if (!cancelled) setState({ results: [], status: "error", errorMessage: toErrorMessage(err) });
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  return state;
}