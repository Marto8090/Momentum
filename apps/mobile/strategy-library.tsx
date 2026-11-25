import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, ScreenHeading, type AccountTheme } from "./account-ui";
import type { Strategy } from "./strategy-data";

const filters = [
  { label: "All strategies", savedOnly: false },
  { label: "Saved", savedOnly: true },
];

type StrategyLibraryProps = {
  theme: AccountTheme;
  strategies: readonly Strategy[];
  query: string;
  savedOnly: boolean;
  onQueryChange: (query: string) => void;
  onSavedOnlyChange: (savedOnly: boolean) => void;
  onOpenStrategy: (strategy: Strategy) => void;
};

export function StrategyLibraryScreen({
  theme,
  strategies,
  query,
  savedOnly,
  onQueryChange,
  onSavedOnlyChange,
  onOpenStrategy,
}: StrategyLibraryProps) {
  const search = query.trim().toLowerCase();
  const visibleStrategies = strategies.filter((strategy) =>
    (!savedOnly || strategy.saved) &&
    [strategy.title, strategy.summary, strategy.description].some((text) => text.toLowerCase().includes(search))
  );
  const inputColors = { backgroundColor: theme.surface, borderColor: theme.fieldBorder };

  return (
    <View style={styles.screen}>
      <ScreenHeading theme={theme} title="Your playbook" description="Find a small way to get started." />
      <View style={styles.controls}>
        <View style={[styles.search, inputColors]}>
          <Feather accessible={false} name="search" size={19} color={theme.muted} />
          <TextInput
            accessibilityLabel="Search strategies"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            keyboardAppearance={theme.isDark ? "dark" : "light"}
            onChangeText={onQueryChange}
            placeholder="Search strategies"
            placeholderTextColor={theme.muted}
            returnKeyType="search"
            selectionColor={theme.accent}
            value={query}
            style={[styles.searchInput, { color: theme.foreground, fontFamily: theme.fonts.body }]}
          />
        </View>
        <View accessibilityRole="tablist" style={[styles.filters, inputColors]}>
          {filters.map((filter) => {
            const selected = savedOnly === filter.savedOnly;

            return (
              <Pressable
                key={filter.label}
                accessibilityRole="tab"
                accessibilityLabel={filter.label}
                accessibilityState={{ selected }}
                onPress={() => onSavedOnlyChange(filter.savedOnly)}
                style={({ pressed }) => [
                  styles.filter,
                  selected && { backgroundColor: theme.accent },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: selected ? theme.onAccent : theme.foreground, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View>
        {visibleStrategies.map((strategy) => (
          <StrategyRow key={strategy.id} theme={theme} strategy={strategy} onOpenStrategy={onOpenStrategy} />
        ))}
        {visibleStrategies.length === 0 ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.empty, { color: theme.muted, fontFamily: theme.fonts.body }]}
          >
            {search ? "No matching strategies." : savedOnly ? "No saved strategies yet." : "No strategies yet."}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function StrategyRow({ theme, strategy, onOpenStrategy }: {
  theme: AccountTheme;
  strategy: Strategy;
  onOpenStrategy: (strategy: Strategy) => void;
}) {
  const body = { color: theme.muted, fontFamily: theme.fonts.body };

  return (
    <View style={[styles.rowDivider, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strategy.title}
        accessibilityHint={strategy.saved ? "Open saved strategy details" : "Open strategy details"}
        onPress={() => onOpenStrategy(strategy)}
        style={({ pressed }) => [
          styles.row,
          strategy.saved && styles.savedRow,
          strategy.saved && { backgroundColor: theme.surface, borderColor: theme.fieldBorder },
          pressed && styles.pressed,
        ]}
      >
        <Feather accessible={false} name={strategy.icon} size={23} color={theme.accent} />
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
            {strategy.title}
          </Text>
          <Text style={[styles.rowSummary, body]}>{strategy.summary}</Text>
          <Text style={[styles.reflectionSummary, body]}>{strategy.reflectionSummary}</Text>
        </View>
        {strategy.saved ? <Feather accessible={false} name="bookmark" size={16} color={theme.accent} /> : null}
      </Pressable>
    </View>
  );
}

export function StrategyLibraryFooter({ theme }: { theme: AccountTheme }) {
  return (
    <View style={[styles.footer, { backgroundColor: theme.background }]}>
      <Text style={[styles.footerNote, { color: theme.muted, fontFamily: theme.fonts.body }]}>
        Your reflections show what works for you.
      </Text>
      <ActionButton theme={theme} label="Add your own strategy" icon="plus" variant="outline" disabled />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 15, paddingBottom: 8 },
  controls: { gap: 11, marginTop: 10 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 13,
  },
  searchInput: { flex: 1, minWidth: 0, fontSize: 14, minHeight: 44, paddingVertical: 8 },
  filters: { flexDirection: "row", borderWidth: 1, borderRadius: 8, padding: 1, gap: 1 },
  filter: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  filterLabel: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 6 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 15, paddingVertical: 16 },
  savedRow: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  rowText: { flex: 1, minWidth: 0, gap: 5 },
  rowTitle: { fontSize: 21, lineHeight: 27 },
  rowSummary: { fontSize: 15, lineHeight: 20 },
  reflectionSummary: { fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.74 },
  empty: { paddingVertical: 16, fontSize: 15, lineHeight: 21 },
  footer: { gap: 11, paddingHorizontal: 26, paddingTop: 7, paddingBottom: 14 },
  footerNote: { fontSize: 13, lineHeight: 18, textAlign: "center" },
});
