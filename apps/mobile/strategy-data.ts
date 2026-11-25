import { pendingJournalEntry, recentJournalEntry, type JournalEntry } from "./journal-data";

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

export const sampleStrategies: readonly Strategy[] = [
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
    reflectionSummary: "Helped in 1 of 2 reflections",
    journalEntry: recentJournalEntry,
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
    reflectionSummary: "Waiting for a reflection",
    journalEntry: pendingJournalEntry,
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
    reflectionSummary: "Not tried yet",
  },
];
