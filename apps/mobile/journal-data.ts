export type JournalEntry = {
  id: string;
  title: string;
  groupLabel: string;
  date: string;
  time: string;
  blocker: string;
  whatIDidInstead?: string;
  strategy?: string;
  strategyOutcome?: string;
  reflection?: string;
  summary?: string;
};

const projectProposal: JournalEntry = {
  id: "project-proposal",
  title: "Write project proposal",
  groupLabel: "20 Sep",
  date: "20 Sep 2026",
  time: "10:30",
  blocker: "Unclear first step",
  whatIDidInstead: "Checked social media",
  strategy: "Work for 5 minutes",
  strategyOutcome: "Didn’t help",
  reflection: "I set a five-minute timer before opening the proposal.",
  summary: "Working for five minutes didn’t help.",
};

const researchArticle: JournalEntry = {
  id: "research-article",
  title: "Read research article",
  groupLabel: "20 Sep",
  date: "20 Sep 2026",
  time: "09:15",
  blocker: "Overwhelm",
  whatIDidInstead: "Read messages",
  strategy: "Split it into parts",
  summary: "You tried splitting it into parts.",
};

export const sampleJournalEntries: readonly JournalEntry[] = [
  projectProposal,
  researchArticle,
  {
    id: "plan-the-week",
    title: "Plan the week",
    groupLabel: "19 Sep",
    date: "19 Sep 2026",
    time: "16:20",
    blocker: "Distraction",
    whatIDidInstead: "Browsed on my phone",
    strategy: "Work for 5 minutes",
    strategyOutcome: "Helped me get started",
    reflection: "Five minutes was enough to write down the first two priorities.",
  },
];

export const recentJournalEntry = projectProposal;
export const pendingJournalEntry = researchArticle;
