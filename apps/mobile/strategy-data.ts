import type { JournalEntry } from "./journal-data";

export type Strategy = {
  id: string;
  title: string;
  summary: string;
  description: string;
  icon: "clock" | "list" | "target";
  saved: boolean;
  steps: readonly string[];
  reflectionSummary: string;
  journalEntry?: JournalEntry;
};

const builtInStrategies: readonly Omit<Strategy, "reflectionSummary" | "journalEntry">[] = [
  {
    id: "work-for-five-minutes",
    title: "Work for 5 minutes",
    summary: "Start briefly, then decide.",
    description: "Give yourself permission to begin without finishing.",
    icon: "clock",
    saved: true,
    steps: [
      "Choose one small action.",
      "Set a timer for five minutes.",
      "When it ends, decide whether to continue.",
    ],
  },
  {
    id: "split-it-into-parts",
    title: "Split it into parts",
    summary: "Choose one manageable piece.",
    description: "Make a big task easier to start by breaking it into smaller parts.",
    icon: "list",
    saved: false,
    steps: [
      "Write down the parts of the task.",
      "Choose one you can start now.",
      "Work on that part before deciding what comes next.",
    ],
  },
  {
    id: "remove-distractions",
    title: "Remove distractions",
    summary: "Make a little space to focus.",
    description: "Put one distraction out of reach so you can give the task your attention.",
    icon: "target",
    saved: false,
    steps: [
      "Notice what keeps pulling your attention away.",
      "Move it out of reach or silence it for a few minutes.",
      "Return to the first action you planned to take.",
    ],
  },
];

export function getJournalStrategies(entries: readonly JournalEntry[]): Strategy[] {
  return builtInStrategies.map((strategy) => {
    const related = entries.filter((entry) => entry.strategy === strategy.title);
    const reflectionCount = related.filter((entry) => entry.reflection).length;
    return {
      ...strategy,
      journalEntry: related[0],
      reflectionSummary: reflectionCount > 0
        ? `${reflectionCount} ${reflectionCount === 1 ? "reflection" : "reflections"}`
        : related.length ? "Waiting for a reflection" : "Not tried yet",
    };
  });
}
