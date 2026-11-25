import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, ScreenHeading, type AccountTheme } from "./account-ui";
import type { JournalEntry } from "./journal-data";

type HomeScreenProps = {
  theme: AccountTheme;
  ownerName: string;
  recentEntry?: JournalEntry;
  pendingEntry?: JournalEntry;
  showEmpty: boolean;
  onOpenEntry: (id: JournalEntry["id"]) => void;
  onAddEntry: () => void;
  onReflect: (entry: JournalEntry) => void;
};

export function HomeScreen({
  theme,
  ownerName,
  recentEntry,
  pendingEntry,
  showEmpty,
  onOpenEntry,
  onAddEntry,
  onReflect,
}: HomeScreenProps) {
  return (
    <View style={styles.content}>
      <View style={styles.intro}>
        <ScreenHeading
          theme={theme}
          title={`Hi, ${ownerName}`}
          description="Make room for a small start."
        />
        <ActionButton theme={theme} label="Add an entry" icon="edit-2" onPress={onAddEntry} />
      </View>

      {pendingEntry ? (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={[styles.pendingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.pendingLabel}>
              <Feather accessible={false} name="clock" size={19} color={theme.accent} />
              <Text style={[styles.meta, { color: theme.muted, fontFamily: theme.fonts.medium }]}>
                Time to reflect
              </Text>
            </View>
            <Text style={[styles.itemHeading, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
              {pendingEntry.title}
            </Text>
            <Text style={[styles.meta, { color: theme.muted, fontFamily: theme.fonts.body }]}>
              {pendingEntry.nextAction}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => onReflect(pendingEntry)}
              style={({ pressed }) => [
                styles.reflectButton,
                { backgroundColor: theme.surfaceRaised },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.reflectLabel, { color: theme.accent, fontFamily: theme.fonts.bold }]}>
                Reflect
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.infoRow}>
        <Feather accessible={false} name="sun" size={22} color={theme.accent} />
        <View style={styles.rowCopy}>
          <Text style={[styles.meta, { color: theme.muted, fontFamily: theme.fonts.medium }]}>
            Strategy to try
          </Text>
          <Text style={[styles.itemHeading, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
            Work for 5 minutes
          </Text>
          <Text style={[styles.meta, styles.strategyNote, { color: theme.muted, fontFamily: theme.fonts.body }]}>
            A small step can make it easier to begin.
          </Text>
        </View>
      </View>

      {recentEntry ? (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Recent journal entry, ${recentEntry.title}`}
            onPress={() => onOpenEntry(recentEntry.id)}
            style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
          >
            <Feather accessible={false} name="book-open" size={22} color={theme.accent} />
            <View style={styles.rowCopy}>
              <Text style={[styles.meta, { color: theme.muted, fontFamily: theme.fonts.medium }]}>
                Recent journal entry
              </Text>
              <Text style={[styles.entryTitle, { color: theme.foreground, fontFamily: theme.fonts.semibold }]}>
                {recentEntry.title}
              </Text>
              <Text style={[styles.meta, { color: theme.muted, fontFamily: theme.fonts.body }]}>
                {recentEntry.reflection ?? recentEntry.nextAction}
              </Text>
            </View>
            <Feather accessible={false} name="chevron-right" size={16} color={theme.muted} />
          </Pressable>
        </>
      ) : showEmpty ? (
        <Text style={[styles.meta, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          Your first journal entry will appear here after you save it.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 12 },
  intro: { gap: 23 },
  divider: { height: StyleSheet.hairlineWidth },
  pendingCard: { borderWidth: 1, borderRadius: 12, padding: 20, gap: 9 },
  pendingLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
  meta: { fontSize: 13, lineHeight: 18 },
  itemHeading: { fontSize: 21, lineHeight: 28 },
  reflectButton: {
    minHeight: 54,
    marginTop: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reflectLabel: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  rowCopy: { flex: 1, gap: 3 },
  strategyNote: { maxWidth: 205 },
  entryTitle: { fontSize: 15, lineHeight: 21 },
  pressed: { opacity: 0.74 },
});
