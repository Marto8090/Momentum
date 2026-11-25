import express, { Router, type ErrorRequestHandler } from "express";
import type { Pool } from "pg";

type EntryRow = {
  id: string;
  title: string;
  blocker: string;
  whatIDidInstead: string;
  nextAction: string;
  strategy: string | null;
  reflection: string | null;
  createdAt: Date;
};

const entryColumns = `
  entry.id, task.title, entry.barrier AS blocker,
  entry.what_happened_instead AS "whatIDidInstead",
  entry.next_action AS "nextAction", entry.strategy, follow_up.reflection,
  entry.created_at AS "createdAt"
`;

const selectEntries = `
  SELECT ${entryColumns}
  FROM diary_entries entry
  JOIN tasks task ON task.id = entry.task_id AND task.owner_id = entry.owner_id
  LEFT JOIN follow_ups follow_up ON follow_up.entry_id = entry.id
`;

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readDraft(body: unknown) {
  if (typeof body !== "object" || !body || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  const id = readText(input.id);
  const title = readText(input.title);
  const blocker = readText(input.blocker);
  const whatIDidInstead = readText(input.whatIDidInstead);
  const nextAction = readText(input.nextAction);
  const strategy = readText(input.strategy);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  if (!title || !blocker || !whatIDidInstead || !nextAction || !strategy) return null;
  return { id, title, blocker, whatIDidInstead, nextAction, strategy };
}

const handleJsonError: ErrorRequestHandler = (error, _request, response, next) => {
  if (error.type === "entity.parse.failed") {
    response.status(400).json({ error: "Enter a valid journal entry." });
  } else if (error.type === "entity.too.large") {
    response.status(413).json({ error: "Shorten your entry and try again." });
  } else {
    next(error);
  }
};

export function createJournalRouter(database: Pool) {
  const router = Router();

  router.get("/", async (_request, response) => {
    const ownerId: string = response.locals.owner.id;
    try {
      const { rows } = await database.query<EntryRow>(
        `${selectEntries} WHERE entry.owner_id = $1 ORDER BY entry.created_at DESC, entry.id DESC`,
        [ownerId],
      );
      response.json({ entries: rows });
    } catch {
      response.status(503).json({ error: "Couldn't load your journal. Try again." });
    }
  });

  router.post("/", express.json({ limit: "16kb" }), async (request, response) => {
    const ownerId: string = response.locals.owner.id;
    const draft = readDraft(request.body);
    if (!draft) {
      response.status(400).json({ error: "Fill in the task, difficulty, activity, strategy, and next step." });
      return;
    }

    try {
      const { rows: [entry] } = await database.query<EntryRow>(
        `
          WITH new_task AS (
            INSERT INTO tasks (owner_id, title)
            VALUES ($1, $2)
            RETURNING id, title
          ), new_entry AS (
            INSERT INTO diary_entries (id, owner_id, task_id, barrier, what_happened_instead, next_action, strategy)
            SELECT $3, $1, id, $4, $5, $6, $7 FROM new_task
            RETURNING *
          )
          SELECT ${entryColumns}
          FROM new_entry entry
          JOIN new_task task ON task.id = entry.task_id
          LEFT JOIN follow_ups follow_up ON follow_up.entry_id = entry.id
        `,
        [ownerId, draft.title, draft.id, draft.blocker, draft.whatIDidInstead, draft.nextAction, draft.strategy],
      );
      response.status(201).json({ entry });
    } catch (error) {
      if (error instanceof Error && "constraint" in error && error.constraint === "diary_entries_pkey") {
        // The failed statement rolls back its task insert. The same draft can be retried safely.
        try {
          const { rows: [saved] } = await database.query<EntryRow>(
            `${selectEntries} WHERE entry.owner_id = $1 AND entry.id = $2`,
            [ownerId, draft.id],
          );
          if (saved && saved.title === draft.title && saved.blocker === draft.blocker
            && saved.whatIDidInstead === draft.whatIDidInstead && saved.nextAction === draft.nextAction
            && saved.strategy === draft.strategy) {
            response.json({ entry: saved });
          } else {
            response.status(409).json({ error: "This draft ID has already been used. Check Journal before starting a new draft." });
          }
          return;
        } catch {
          response.status(503).json({ error: "Couldn't confirm the saved entry. Try again." });
          return;
        }
      }
      response.status(503).json({ error: "Couldn't save your entry. Try again." });
    }
  });

  router.use(handleJsonError);
  return router;
}
