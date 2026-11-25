import { useCallback, useEffect, useRef, useState } from "react";
import { apiOrigin, type MomentumAuthClient } from "./auth-client";
import type { EntryDraft } from "./entry-screens";
import { toJournalEntry, type JournalEntry, type StoredJournalEntry } from "./journal-data";

export class JournalRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requestJournal<Result>(
  auth: MomentumAuthClient,
  controller: AbortController,
  draft?: EntryDraft & { id: string },
): Promise<Result> {
  const failure = draft ? "Couldn't save your entry. Try again." : "Couldn't load your journal. Try again.";
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const cookie = await auth.getCookie();
    if (!cookie) throw new JournalRequestError("Sign in to continue.", 401);

    const response = await fetch(`${apiOrigin}/api/entries`, {
      method: draft ? "POST" : "GET",
      credentials: "omit",
      headers: draft ? { cookie, "content-type": "application/json" } : { cookie },
      signal: controller.signal,
      body: draft ? JSON.stringify({
        id: draft.id,
        title: draft.task,
        blocker: draft.difficulty,
        whatIDidInstead: draft.activity,
        nextAction: draft.nextAction,
        strategy: draft.strategy,
      }) : undefined,
    });
    if (response.status === 404) {
      throw new JournalRequestError("Your journal requires the updated Momentum API.", 404);
    }
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload && typeof payload === "object" && "error" in payload
        && typeof payload.error === "string" ? payload.error : failure;
      throw new JournalRequestError(message, response.status);
    }
    if (!payload || typeof payload !== "object") throw new JournalRequestError(failure, response.status);
    return payload as Result;
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveJournalEntry(auth: MomentumAuthClient, id: string, draft: EntryDraft) {
  const { entry } = await requestJournal<{ entry: StoredJournalEntry }>(auth, new AbortController(), { ...draft, id });
  return toJournalEntry(entry);
}

type JournalState = {
  entries: readonly JournalEntry[];
  loading: boolean;
  error?: string;
};

export function useJournal(client: MomentumAuthClient) {
  const [state, setState] = useState<JournalState>({ entries: [], loading: true });
  const request = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((current) => ({ ...current, loading: true, error: undefined }));

    try {
      const { entries } = await requestJournal<{ entries: StoredJournalEntry[] }>(client, controller);
      if (request.current === controller) setState({ entries: entries.map(toJournalEntry), loading: false });
    } catch (error) {
      if (request.current !== controller) return;
      setState((current) => ({
        entries: error instanceof JournalRequestError && error.status === 401 ? [] : current.entries,
        loading: false,
        error: error instanceof JournalRequestError ? error.message : "Couldn't load your journal. Try again.",
      }));
    }
  }, [client]);

  useEffect(() => {
    void refresh();
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [refresh]);

  function rememberSaved(entry: JournalEntry) {
    if (!request.current) return;
    setState((current) => ({ ...current, entries: [entry, ...current.entries.filter(({ id }) => id !== entry.id)] }));
    void refresh();
  }

  return { ...state, refresh, rememberSaved };
}
