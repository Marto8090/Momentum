export type StoredJournalEntry = {
  id: string;
  title: string;
  blocker: string;
  whatIDidInstead: string;
  nextAction: string;
  strategy: string | null;
  reflection: string | null;
  createdAt: string;
};

export type JournalEntry = {
  id: string;
  title: string;
  date: string;
  recordedOn: string;
  time: string;
  blocker: string;
  whatIDidInstead: string;
  nextAction: string;
  strategy?: string;
  strategyOutcome?: string;
  reflection?: string;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function localDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function toJournalEntry(entry: StoredJournalEntry): JournalEntry {
  const date = new Date(entry.createdAt);
  return {
    id: entry.id,
    title: entry.title,
    date: dateFormat.format(date),
    recordedOn: localDay(date),
    time: timeFormat.format(date),
    blocker: entry.blocker,
    whatIDidInstead: entry.whatIDidInstead,
    nextAction: entry.nextAction,
    strategy: entry.strategy ?? undefined,
    reflection: entry.reflection ?? undefined,
  };
}
