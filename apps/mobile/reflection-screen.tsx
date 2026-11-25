import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ActionButton,
  AppScreen,
  FormField,
  ScreenHeading,
  type AccountTheme,
} from "./account-ui";
import { FormBack } from "./entry-screens";
import type { JournalEntry } from "./journal-data";

const ratingOptions = ["Not at all", "A little", "A lot"] as const;
type ReflectionRating = (typeof ratingOptions)[number];

const sampleOutcomeRatings = new Map<string, ReflectionRating>([
  ["Didn’t help", "Not at all"],
  ["Helped me get started", "A lot"],
]);

type ReflectionScreenProps = {
  theme: AccountTheme;
  entry: JournalEntry;
  backLabel: string;
  onBack: () => void;
  onFinish: () => void;
};

export function ReflectionScreen({
  theme,
  entry,
  backLabel,
  onBack,
  onFinish,
}: ReflectionScreenProps) {
  const [rating, setRating] = useState<ReflectionRating | undefined>(() => {
    const outcome = entry.strategyOutcome;
    if (!outcome) return undefined;
    return sampleOutcomeRatings.get(outcome) ?? ratingOptions.find((option) => option === outcome);
  });
  const [note, setNote] = useState(entry.reflection ?? "");

  return (
    <AppScreen theme={theme}>
      <FormBack theme={theme} label={backLabel} onBack={onBack} />
      <View style={styles.heading}>
        <ScreenHeading theme={theme} title="How did it go?" description={entry.title} />
      </View>
      <View style={styles.ratingField}>
        <Text style={[styles.question, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
          How much did this strategy help you start?
        </Text>
        <View style={[styles.ratingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.strategy, { color: theme.foreground, fontFamily: theme.fonts.semibold }]}>
            {entry.strategy ?? "No strategy recorded"}
          </Text>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {ratingOptions.map((option) => {
              const selected = option === rating;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityLabel={option}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setRating(option)}
                  style={({ pressed }) => [
                    styles.option,
                    { borderColor: selected ? theme.accent : theme.border },
                    selected && { backgroundColor: theme.surfaceRaised },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: selected ? theme.accent : theme.muted, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.details}>
        <FormField
          theme={theme}
          label="What happened? (optional)"
          placeholder="Write a short note"
          value={note}
          onChangeText={setNote}
          multiline
          style={styles.note}
        />
        <ActionButton
          theme={theme}
          label="Save reflection"
          disabled={rating === undefined}
          onPress={onFinish}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: 18 },
  ratingField: { marginTop: 19, gap: 12 },
  question: { fontSize: 15, lineHeight: 21 },
  ratingCard: { padding: 13, gap: 9, borderWidth: 1, borderRadius: 12 },
  strategy: { fontSize: 15, lineHeight: 21 },
  options: { flexDirection: "row", gap: 6 },
  option: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 9,
  },
  optionLabel: { fontSize: 14, lineHeight: 19, textAlign: "center" },
  pressed: { opacity: 0.75 },
  details: { marginTop: 17, gap: 16 },
  note: { minHeight: 67, textAlignVertical: "top" },
});
