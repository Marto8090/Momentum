import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, ScreenHeading, type AccountTheme } from "./account-ui";
import { FormBack } from "./entry-screens";
import type { Strategy } from "./strategy-data";

type StrategyDetailScreenProps = {
  theme: AccountTheme;
  strategy: Strategy;
  backLabel: string;
  onBack: () => void;
  onOpenEntry: (entryId: string) => void;
};

export function StrategyDetailScreen({
  theme,
  strategy,
  backLabel,
  onBack,
  onOpenEntry,
}: StrategyDetailScreenProps) {
  const { journalEntry } = strategy;
  const excerpt = journalEntry?.reflection ? `“${journalEntry.reflection}”` : journalEntry?.summary;

  return (
    <AppScreen theme={theme} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <FormBack theme={theme} label={backLabel} onBack={onBack} />
        {strategy.saved ? (
          <View accessible accessibilityLabel="Saved" style={styles.saved}>
            <Feather accessible={false} name="bookmark" size={17} color={theme.accent} />
            <Text style={[styles.savedLabel, { color: theme.accent, fontFamily: theme.fonts.semibold }]}>
              Saved
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.heading}>
        <Feather accessible={false} name={strategy.icon} size={34} color={theme.accent} />
        <View style={styles.headingText}>
          <ScreenHeading theme={theme} title={strategy.title} description={strategy.description} />
        </View>
      </View>
      <View style={styles.instructions}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionHeading, { color: theme.foreground, fontFamily: theme.fonts.medium }]}
        >
          How to try it
        </Text>
        <View style={styles.steps}>
          {strategy.steps.map((step, index) => (
            <View key={step} accessible accessibilityLabel={`Step ${index + 1}. ${step}`} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                <Text style={[styles.stepNumberLabel, { color: theme.onAccent, fontFamily: theme.fonts.semibold }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, { color: theme.foreground, fontFamily: theme.fonts.body }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.reflections, { borderColor: theme.border }]}>
        <Text
          accessibilityRole="header"
          style={[styles.sectionHeading, { color: theme.foreground, fontFamily: theme.fonts.medium }]}
        >
          From your reflections
        </Text>
        <Text style={[styles.body, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          {strategy.reflectionSummary}
        </Text>
        {journalEntry ? (
          <View style={styles.recentEntry}>
            <Text style={[styles.caption, { color: theme.muted, fontFamily: theme.fonts.body }]}>
              Recent journal entry
            </Text>
            <Text style={[styles.entryHeading, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
              {journalEntry.title}
            </Text>
            {excerpt ? (
              <Text style={[styles.body, { color: theme.muted, fontFamily: theme.fonts.body }]}>
                {excerpt}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="View journal entry"
              onPress={() => onOpenEntry(journalEntry.id)}
              style={({ pressed }) => [styles.entryLink, pressed && styles.pressed]}
            >
              <Text style={[styles.entryLinkLabel, { color: theme.accent, fontFamily: theme.fonts.semibold }]}>
                View entry
              </Text>
              <Feather accessible={false} name="chevron-right" size={15} color={theme.accent} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  saved: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  savedLabel: { fontSize: 14, lineHeight: 19, flexShrink: 1 },
  heading: { flexDirection: "row", alignItems: "flex-start", gap: 18, marginTop: 22 },
  headingText: { flex: 1, minWidth: 0 },
  instructions: { gap: 14, marginTop: 36 },
  sectionHeading: { fontSize: 18, lineHeight: 24 },
  steps: { gap: 14 },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  stepNumber: {
    minWidth: 31,
    minHeight: 31,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  stepNumberLabel: { fontSize: 14, lineHeight: 19 },
  stepLabel: { flex: 1, maxWidth: 240, paddingTop: 4, fontSize: 15, lineHeight: 22 },
  reflections: { gap: 5, marginTop: 23, paddingTop: 22, borderTopWidth: StyleSheet.hairlineWidth },
  recentEntry: { gap: 5, marginTop: 14 },
  caption: { fontSize: 13, lineHeight: 19 },
  entryHeading: { fontSize: 22, lineHeight: 28 },
  body: { fontSize: 15, lineHeight: 22 },
  entryLink: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: 5 },
  entryLinkLabel: { fontSize: 14, lineHeight: 19 },
  pressed: { opacity: 0.75 },
});
