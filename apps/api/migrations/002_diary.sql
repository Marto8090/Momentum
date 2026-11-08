CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL REFERENCES "user" (id),
  title text NOT NULL CHECK (btrim(title) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, id)
);

CREATE TABLE diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL,
  task_id uuid NOT NULL,
  barrier text NOT NULL CHECK (btrim(barrier) <> ''),
  what_happened_instead text NOT NULL CHECK (btrim(what_happened_instead) <> ''),
  next_action text NOT NULL CHECK (btrim(next_action) <> ''),
  strategy text CHECK (btrim(strategy) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (owner_id, task_id) REFERENCES tasks (owner_id, id) ON DELETE RESTRICT
);

CREATE INDEX diary_entries_task_idx ON diary_entries (owner_id, task_id);

CREATE TABLE follow_ups (
  entry_id uuid PRIMARY KEY REFERENCES diary_entries (id) ON DELETE CASCADE,
  attempted_action text NOT NULL CHECK (attempted_action IN ('yes', 'no', 'not_sure')),
  started_task text NOT NULL CHECK (started_task IN ('yes', 'no', 'not_sure')),
  reflection text NOT NULL CHECK (btrim(reflection) <> ''),
  created_at timestamptz NOT NULL DEFAULT now()
);
