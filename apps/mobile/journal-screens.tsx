import Feather from "@expo/vector-icons/Feather";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppScreen, LinkButton, ScreenHeading, type AccountTheme } from "./account-ui";
import type { JournalEntry } from "./journal-data";

type Themed = { theme: AccountTheme };
type FeatherIcon = keyof typeof Feather.glyphMap;

const journalFilters = ["All", "To reflect", "Reflected"];

function EntryStatus({ theme, reflected }: Themed & { reflected: boolean }) {
  return (
    <View
      style={[
        styles.status,
        { backgroundColor: reflected ? theme.surfaceRaised : theme.surface },
      ]}
    >
      <Text
        style={[
          styles.statusLabel,
          { color: reflected ? theme.foreground : theme.accent, fontFamily: theme.fonts.medium },
        ]}
      >
        {reflected ? "Reflected" : "To reflect"}
      </Text>
    </View>
  );
}

function JournalBrowseControls({ theme }: Themed) {
  return (
    <View style={styles.controls}>
      <View
        accessible
        accessibilityRole="search"
        accessibilityLabel="Search entries"
        accessibilityState={{ disabled: true }}
        style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }]}
      >
        <Feather accessible={false} name="search" size={19} color={theme.muted} />
        <Text style={[styles.searchLabel, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          Search entries
        </Text>
      </View>
      <View
        accessibilityRole="tablist"
        style={[styles.filters, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }]}
      >
        {journalFilters.map((label, index) => {
          const selected = index === 0;
          return (
            <View
              accessible
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected, disabled: true }}
              key={label}
              style={[styles.filter, selected && { backgroundColor: theme.accent }]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: selected ? theme.onAccent : theme.muted, fontFamily: theme.fonts.medium },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function JournalRow({
  theme,
  entry,
  onOpenEntry,
}: Themed & { entry: JournalEntry; onOpenEntry: (entryId: JournalEntry["id"]) => void }) {
  const reflected = Boolean(entry.reflection);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={entry.title}
      accessibilityHint={reflected ? "Open reflected journal entry" : "Open journal entry to reflect on"}
      onPress={() => onOpenEntry(entry.id)}
      style={({ pressed }) => [
        styles.journalRow,
        { borderColor: theme.border },
        pressed && { backgroundColor: theme.surface },
      ]}
    >
      <View style={styles.rowHeading}>
        <Text style={[styles.entryTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
          {entry.title}
        </Text>
        <EntryStatus theme={theme} reflected={reflected} />
      </View>
      <Text style={[styles.metadata, { color: theme.muted, fontFamily: theme.fonts.body }]}>
        {entry.time}
      </Text>
      <Text style={[styles.entryPreview, { color: theme.muted, fontFamily: theme.fonts.body }]}>
        {entry.blocker}
      </Text>
      {entry.reflection ? (
        <Text style={[styles.entryPreview, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          {entry.reflection}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function JournalScreen({
  theme,
  entries,
  onOpenEntry,
  showEmpty,
}: Themed & { entries: readonly JournalEntry[]; onOpenEntry: (entryId: JournalEntry["id"]) => void; showEmpty: boolean }) {
  const groupedEntries = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const group = groupedEntries.get(entry.date);
    if (group) group.push(entry);
    else groupedEntries.set(entry.date, [entry]);
  }

  return (
    <View>
      <ScreenHeading theme={theme} title="Your journal" description="Notice what works for you." />
      <JournalBrowseControls theme={theme} />
      {showEmpty ? (
        <Text style={[styles.group, styles.entryPreview, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          No entries yet. Tap Add an entry to get started.
        </Text>
      ) : null}
      {[...groupedEntries].map(([label, group]) => (
        <View key={label} style={styles.group}>
          <Text
            accessibilityRole="header"
            style={[styles.groupLabel, { color: theme.foreground, fontFamily: theme.fonts.semibold }]}
          >
            {label}
          </Text>
          {group.map((entry) => (
            <JournalRow key={entry.id} theme={theme} entry={entry} onOpenEntry={onOpenEntry} />
          ))}
        </View>
      ))}
    </View>
  );
}

function EntryFact({
  theme,
  icon,
  label,
  value,
  outcome,
}: Themed & { icon: FeatherIcon; label: string; value: string; outcome?: string }) {
  return (
    <View style={styles.fact}>
      <Feather accessible={false} name={icon} size={21} color={theme.accent} />
      <View style={styles.factText}>
        <Text style={[styles.factLabel, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
          {label}
        </Text>
        <Text style={[styles.factValue, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          {value}
        </Text>
        {outcome ? (
          <Text style={[styles.factLabel, { color: theme.foreground, fontFamily: theme.fonts.body }]}>
            {outcome}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function JournalEntryScreen({
  theme,
  entry,
  backLabel,
  onBack,
  onEdit,
  onReflect,
  notice,
}: Themed & {
  entry: JournalEntry;
  backLabel: string;
  onBack: () => void;
  onEdit: () => void;
  onReflect: () => void;
  notice?: ReactNode;
}) {
  return (
    <AppScreen
      theme={theme}
      contentContainerStyle={styles.detailContent}
      footer={
        <View style={styles.privacy}>
          <Feather accessible={false} name="lock" size={15} color={theme.muted} />
          <Text style={[styles.metadata, { color: theme.muted, fontFamily: theme.fonts.body }]}>
            Only you can see this.
          </Text>
        </View>
      }
    >
      <View style={styles.detailHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Back to ${backLabel}`}
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather accessible={false} name="arrow-left" size={19} color={theme.foreground} />
          <Text style={[styles.backLabel, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
            {backLabel}
          </Text>
        </Pressable>
        <LinkButton theme={theme} label="Edit the entry" onPress={onEdit} />
      </View>
      {notice}
      <View style={styles.detailIntro}>
        <Text style={[styles.metadata, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          {entry.date} · {entry.time}
        </Text>
        <ScreenHeading theme={theme} title={entry.title} />
        <EntryStatus theme={theme} reflected={Boolean(entry.reflection)} />
      </View>
      <View style={styles.facts}>
        <EntryFact theme={theme} icon="alert-triangle" label="Blocker" value={entry.blocker} />
        {entry.whatIDidInstead ? (
          <EntryFact
            theme={theme}
            icon="book-open"
            label="What I did instead"
            value={entry.whatIDidInstead}
          />
        ) : null}
        {entry.strategy ? (
          <EntryFact
            theme={theme}
            icon="sun"
            label="Strategy"
            value={entry.strategy}
            outcome={entry.strategyOutcome}
          />
        ) : null}
        <EntryFact theme={theme} icon="arrow-right-circle" label="Small next step" value={entry.nextAction} />
      </View>
      {entry.reflection ? (
        <View style={[styles.reflection, { borderColor: theme.border }]}>
          <View style={[styles.reflectionBody, { borderColor: theme.accent }]}>
            <View style={styles.reflectionHeader}>
              <Text
                accessibilityRole="header"
                style={[styles.entryTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}
              >
                Reflection
              </Text>
              <LinkButton theme={theme} label="Edit reflection" onPress={onReflect} />
            </View>
            <Text style={[styles.factValue, { color: theme.muted, fontFamily: theme.fonts.body }]}>
              {entry.reflection}
            </Text>
          </View>
        </View>
      ) : entry.strategy ? (
        <View style={styles.reflectAction}>
          <ActionButton theme={theme} label="Reflect" onPress={onReflect} />
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 12, marginTop: 26 },
  search: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 49,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
  },
  searchLabel: { fontSize: 13, lineHeight: 18 },
  filters: { flexDirection: "row", borderWidth: 1, borderRadius: 10, padding: 1, gap: 1 },
  filter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 41,
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterLabel: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  group: { marginTop: 26 },
  groupLabel: { fontSize: 14, lineHeight: 20 },
  journalRow: {
    gap: 6,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  entryTitle: { flexShrink: 1, fontSize: 21, lineHeight: 28 },
  status: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusLabel: { fontSize: 11, lineHeight: 16 },
  metadata: { fontSize: 12, lineHeight: 17 },
  entryPreview: { fontSize: 13, lineHeight: 18 },
  detailContent: { paddingTop: 8 },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  back: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, flexShrink: 1 },
  backLabel: { fontSize: 14, lineHeight: 19, flexShrink: 1 },
  pressed: { opacity: 0.75 },
  detailIntro: { marginTop: 16, gap: 12 },
  facts: { marginTop: 38, gap: 27 },
  fact: { flexDirection: "row", alignItems: "flex-start", gap: 18 },
  factText: { gap: 5, flex: 1 },
  factLabel: { fontSize: 13, lineHeight: 18 },
  factValue: { fontSize: 15, lineHeight: 21 },
  reflection: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 29, paddingTop: 20 },
  reflectionBody: { borderLeftWidth: 3, paddingLeft: 16, paddingBottom: 12, gap: 6 },
  reflectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  reflectAction: { marginTop: 29 },
  privacy: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingTop: 14,
    paddingBottom: 24,
    paddingHorizontal: 26,
  },
});
