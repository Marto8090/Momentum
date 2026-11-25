import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenHeading, type AccountTheme } from "./account-ui";
import type { InsightCount, InsightsPeriod, InsightsSummary, InsightsView, StrategyInsight } from "./insights-data";
import type { Strategy } from "./strategy-data";

const periods: readonly { value: InsightsPeriod; label: string }[] = [
  { value: "7-days", label: "7 days" },
  { value: "30-days", label: "30 days" },
  { value: "all-time", label: "All time" },
];
const views: readonly { value: InsightsView; label: string }[] = [
  { value: "patterns", label: "Patterns" },
  { value: "what-helps", label: "What helps" },
];

type Themed = { theme: AccountTheme };
type InsightProps = Themed & {
  summary: InsightsSummary;
  period: InsightsPeriod;
  view: InsightsView;
  onPeriodChange: (period: InsightsPeriod) => void;
  onViewChange: (view: InsightsView) => void;
  onOpenStrategy: (strategy: Strategy) => void;
};

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function InsightsScreen({
  theme,
  summary,
  period,
  view,
  onPeriodChange,
  onViewChange,
  onOpenStrategy,
}: InsightProps) {
  const body = { color: theme.muted, fontFamily: theme.fonts.body };
  const entries = countLabel(summary.entryCount, "entry", "entries");
  const reflections = countLabel(summary.reflectionCount, "reflection", "reflections");

  return (
    <View style={styles.screen}>
      <ScreenHeading theme={theme} title="Your insights" description="Notice patterns. Find what helps." />

      <View style={styles.period}>
        <View
          accessibilityRole="tablist"
          style={[styles.periodTabs, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }]}
        >
          {periods.map(({ value, label }) => {
            const selected = value === period;
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                onPress={() => onPeriodChange(value)}
                style={({ pressed }) => [
                  styles.periodTab,
                  selected && { backgroundColor: theme.accent },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: selected ? theme.onAccent : theme.foreground, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text accessibilityLiveRegion="polite" style={[styles.caption, body]}>
          {entries} · {reflections}
        </Text>
      </View>

      <View accessibilityRole="tablist" style={styles.viewTabs}>
        {views.map(({ value, label }) => {
          const selected = value === view;
          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => onViewChange(value)}
              style={({ pressed }) => [
                styles.viewTab,
                { borderBottomColor: selected ? theme.accent : theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: selected ? theme.accent : theme.foreground, fontFamily: theme.fonts.semibold },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {view === "patterns" ? (
        <Patterns theme={theme} summary={summary} />
      ) : (
        <View style={styles.section}>
          <SectionTitle theme={theme} title="Did it help you start?" />
          <Text style={[styles.body, body]}>
            {summary.reflectionCount ? `Your answers from ${reflections}.` : "No reflections in this period."}
          </Text>
          {summary.strategies.map((result) => (
            <StrategyResult key={result.strategy.id} theme={theme} result={result} onOpenStrategy={onOpenStrategy} />
          ))}
        </View>
      )}
    </View>
  );
}

function SectionTitle({ theme, title }: Themed & { title: string }) {
  return (
    <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
      {title}
    </Text>
  );
}

function Patterns({ theme, summary }: Themed & { summary: InsightsSummary }) {
  const { blockers, entryCount, timeOfDay, taskType } = summary;
  const entries = countLabel(entryCount, "entry", "entries");
  const body = { color: theme.muted, fontFamily: theme.fonts.body };
  const firstIsMostCommon = blockers.length > 0 && blockers[0].count > (blockers[1]?.count ?? 0);

  return (
    <View style={styles.section}>
      <SectionTitle theme={theme} title="What gets in the way" />
      {blockers.length ? (
        <View>
          {blockers.map(({ label, count }, index) => {
            const highlighted = index === 0 && firstIsMostCommon;
            const foreground = { color: highlighted ? theme.accent : theme.foreground, fontFamily: theme.fonts.medium };
            return (
              <View
                accessible
                accessibilityLabel={`${label}, ${count} of ${entries}`}
                key={label}
                style={[styles.countRow, { borderColor: theme.border }]}
              >
                <Text style={[styles.body, styles.countLabel, foreground]}>{label}</Text>
                <Text style={[styles.caption, highlighted ? foreground : body]}>{count} of {entryCount}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.body, body]}>No difficulties recorded in this period.</Text>
      )}
      {timeOfDay || taskType ? (
        <View style={styles.section}>
          <SectionTitle theme={theme} title="Most often recorded" />
          <View>
            {timeOfDay ? <CommonValue theme={theme} category="Time of day" icon="clock" result={timeOfDay} total={entries} /> : null}
            {taskType ? <CommonValue theme={theme} category="Task type" icon="list" result={taskType} total={entries} /> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CommonValue({ theme, category, icon, result, total }: Themed & {
  category: string;
  icon: "clock" | "list";
  result: InsightCount;
  total: string;
}) {
  const body = { color: theme.muted, fontFamily: theme.fonts.body };

  return (
    <View
      accessible
      accessibilityLabel={`${category}, ${result.label}, ${result.count} of ${total}`}
      style={[styles.commonValue, { borderColor: theme.border }]}
    >
      <Feather accessible={false} name={icon} size={23} color={theme.foreground} />
      <View style={styles.resultCopy}>
        <Text style={[styles.caption, body]}>{category}</Text>
        <Text style={[styles.rowTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>{result.label}</Text>
        <Text style={[styles.caption, body]}>{result.count} of {total}</Text>
      </View>
    </View>
  );
}

function StrategyResult({ theme, result, onOpenStrategy }: Themed & {
  result: StrategyInsight;
  onOpenStrategy: (strategy: Strategy) => void;
}) {
  const { strategy, yes, aLittle, notReally } = result;
  const count = yes + aLittle + notReally;
  const resultLabel = count ? `You answered Yes in ${yes} of ${count}.` : "No reflections yet";
  const breakdown = [
    yes ? `${yes} Yes` : "",
    aLittle ? `${aLittle} A little` : "",
    notReally ? `${notReally} Not really` : "",
  ].filter(Boolean).join(" · ");
  const body = { color: theme.muted, fontFamily: theme.fonts.body };
  const highlighted = strategy.saved && count > 0;

  return (
    <View style={[styles.resultDivider, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strategy.title}
        accessibilityValue={{ text: breakdown ? `${resultLabel} ${breakdown}` : resultLabel }}
        accessibilityHint="Open strategy details"
        onPress={() => onOpenStrategy(strategy)}
        style={({ pressed }) => [
          styles.result,
          highlighted && styles.highlightedResult,
          highlighted && { backgroundColor: theme.surface, borderColor: theme.fieldBorder },
          pressed && styles.pressed,
        ]}
      >
        <Feather accessible={false} name={strategy.icon} size={23} color={theme.accent} />
        <View style={styles.resultCopy}>
          <Text style={[styles.rowTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>{strategy.title}</Text>
          <Text style={[styles.body, body]}>{resultLabel}</Text>
          {breakdown ? <Text style={[styles.caption, body]}>{breakdown}</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}

export function InsightsFooter({ theme, view }: Themed & { view: InsightsView }) {
  return (
    <View style={[styles.footer, { backgroundColor: theme.background }]}>
      <Text style={[styles.caption, styles.centered, { color: theme.muted, fontFamily: theme.fonts.body }]}>
        {view === "patterns" ? "Based on the entries you recorded." : "Keep reflecting to see how patterns develop."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 14, paddingBottom: 12 },
  period: { gap: 7 },
  periodTabs: { flexDirection: "row", borderWidth: 1, borderRadius: 8, padding: 1, gap: 1 },
  periodTab: { flex: 1, minHeight: 42, justifyContent: "center", alignItems: "center", padding: 5, borderRadius: 6 },
  viewTabs: { flexDirection: "row" },
  viewTab: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderBottomWidth: 2, padding: 5 },
  tabLabel: { fontSize: 14, lineHeight: 19, textAlign: "center" },
  section: { gap: 9 },
  sectionTitle: { fontSize: 24, lineHeight: 31 },
  countRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  countLabel: { flex: 1 },
  commonValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
  },
  resultCopy: { flex: 1, minWidth: 0, gap: 3 },
  resultDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  result: { flexDirection: "row", alignItems: "flex-start", gap: 14, paddingVertical: 10 },
  highlightedResult: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, marginBottom: 8 },
  rowTitle: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 15, lineHeight: 21 },
  caption: { fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.74 },
  footer: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 18 },
  centered: { textAlign: "center" },
});
