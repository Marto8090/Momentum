import { localDay, type JournalEntry } from "./journal-data";
import type { Strategy } from "./strategy-data";

export type InsightsPeriod = "7-days" | "30-days" | "all-time";
export type InsightsView = "patterns" | "what-helps";

export type InsightCount = { label: string; count: number };
export type StrategyInsight = { strategy: Strategy; yes: number; aLittle: number; notReally: number };

export type InsightsSummary = {
  entryCount: number;
  reflectionCount: number;
  blockers: readonly InsightCount[];
  timeOfDay?: InsightCount;
  strategies: readonly StrategyInsight[];
};

const daysByPeriod = { "7-days": 7, "30-days": 30 };

const outcomeBuckets = new Map<string, "yes" | "aLittle" | "notReally">([
  ["Helped me get started", "yes"],
  ["A lot", "yes"],
  ["A little", "aLittle"],
  ["Didn’t help", "notReally"],
  ["Not at all", "notReally"],
]);

function entriesForPeriod(entries: readonly JournalEntry[], period: InsightsPeriod): readonly JournalEntry[] {
  if (period === "all-time") return entries;

  const firstDate = new Date();
  const today = localDay(firstDate);
  firstDate.setDate(firstDate.getDate() - daysByPeriod[period] + 1);
  const firstDay = localDay(firstDate);
  return entries.filter((entry) => entry.recordedOn >= firstDay && entry.recordedOn <= today);
}

function countLabels(labels: readonly string[]): InsightCount[] {
  const counts = new Map<string, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts, ([label, count]) => ({ label, count })).sort(
    (left, right) => right.count - left.count,
  );
}

function getTimeOfDay(time: string): string {
  const hour = Number(time.split(":")[0]);
  if (hour < 6) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

function countStrategyOutcomes(strategy: Strategy, entries: readonly JournalEntry[]): StrategyInsight {
  const result: StrategyInsight = { strategy, yes: 0, aLittle: 0, notReally: 0 };
  for (const entry of entries) {
    if (entry.strategy !== strategy.title || !entry.strategyOutcome) continue;
    const bucket = outcomeBuckets.get(entry.strategyOutcome);
    if (bucket) result[bucket] += 1;
  }
  return result;
}

export function getInsightsSummary(
  period: InsightsPeriod,
  journalEntries: readonly JournalEntry[],
  strategies: readonly Strategy[],
): InsightsSummary {
  const entries = entriesForPeriod(journalEntries, period);

  return {
    entryCount: entries.length,
    reflectionCount: entries.filter((entry) => entry.reflection || entry.strategyOutcome).length,
    blockers: countLabels(entries.map((entry) => entry.blocker)),
    timeOfDay: countLabels(entries.map((entry) => getTimeOfDay(entry.time)))[0],
    strategies: strategies.map((strategy) => countStrategyOutcomes(strategy, entries)),
  };
}
