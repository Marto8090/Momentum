import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { ActionButton, AppScreen, FormField, ScreenHeading, type AccountTheme } from "./account-ui";

export type EntryDraft = {
  task: string;
  difficulty: string;
  activity: string;
  strategy: string;
};

export const initialEntryDraft: EntryDraft = {
  task: "Write project proposal",
  difficulty: "Unclear first step",
  activity: "Checked social media",
  strategy: "Work for 5 minutes",
};

const difficulties = [initialEntryDraft.difficulty, "Overwhelm", "Distraction", "Low energy"];
const activities = [initialEntryDraft.activity, "Read messages", "Browsed on my phone", "Worked on something else"];
const strategies = [initialEntryDraft.strategy, "Split it into parts", "Put my phone away", "Write down the first step"];

type EntryFormProps = {
  theme: AccountTheme;
  draft: EntryDraft;
  mode?: "add" | "edit";
  onDraftChange: (draft: EntryDraft) => void;
  onBack: () => void;
};

export function FormBack({ theme, label, onBack }: {
  theme: AccountTheme;
  label?: string;
  onBack: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? "Back"}
      onPress={onBack}
      style={({ pressed }) => [styles.back, pressed && styles.pressed]}
    >
      <Feather accessible={false} name="arrow-left" size={20} color={theme.foreground} />
      {label ? (
        <Text style={[styles.label, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

function OptionField({ theme, label, value, options, onSelect, placeholder = "Select an option" }: {
  theme: AccountTheme;
  label: string;
  value: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  placeholder?: string;
}) {
  const [showOptions, setShowOptions] = useState(false);
  const closeOptions = () => setShowOptions(false);
  const currentValue = value.trim() ? value : "";
  const displayValue = currentValue || placeholder;
  const availableOptions = currentValue && !options.includes(currentValue) ? [currentValue, ...options] : options;

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: displayValue }}
        accessibilityState={{ expanded: showOptions }}
        onPress={() => {
          Keyboard.dismiss();
          setShowOptions(true);
        }}
        style={({ pressed }) => [
          styles.optionField,
          { backgroundColor: theme.surface, borderColor: theme.fieldBorder },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.optionValue,
            { color: currentValue ? theme.foreground : theme.muted, fontFamily: theme.fonts.body },
          ]}
        >
          {displayValue}
        </Text>
        <Feather accessible={false} name="chevron-down" size={16} color={theme.accent} />
      </Pressable>
      <Modal
        transparent
        visible={showOptions}
        animationType="fade"
        onRequestClose={closeOptions}
      >
        <View style={styles.modal}>
          <Pressable accessible={false} style={StyleSheet.absoluteFill} onPress={closeOptions} />
          <View
            accessibilityViewIsModal
            style={[styles.modalCard, { backgroundColor: theme.background, borderColor: theme.fieldBorder }]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.modalHeading, { color: theme.foreground, fontFamily: theme.fonts.heading }]}
            >
              {label}
            </Text>
            <ScrollView style={styles.optionList} keyboardShouldPersistTaps="handled">
              {availableOptions.map((option) => {
                const selected = option === currentValue;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityLabel={option}
                    accessibilityState={{ checked: selected }}
                    onPress={() => {
                      onSelect(option);
                      closeOptions();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      { borderBottomColor: theme.border },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionValue,
                        { color: theme.foreground, fontFamily: theme.fonts.body },
                      ]}
                    >
                      {option}
                    </Text>
                    {selected ? <Feather accessible={false} name="check" size={18} color={theme.accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <ActionButton theme={theme} label="Cancel" variant="outline" onPress={closeOptions} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FutureOption({ theme, kind }: { theme: AccountTheme; kind: "difficulty" | "activity" }) {
  return (
    <>
      <View style={styles.customRow}>
        <TextInput
          accessibilityLabel={`Add a new ${kind}`}
          accessibilityState={{ disabled: true }}
          editable={false}
          placeholder={`Add a new ${kind}`}
          placeholderTextColor={theme.muted}
          style={[
            styles.customInput,
            { backgroundColor: theme.surface, borderColor: theme.border, fontFamily: theme.fonts.body },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${kind}`}
          accessibilityState={{ disabled: true }}
          disabled
          style={[styles.customButton, { backgroundColor: theme.surfaceRaised }]}
        >
          <Text style={[styles.label, { color: theme.muted, fontFamily: theme.fonts.bold }]}>Add</Text>
        </Pressable>
      </View>
      <Text style={[styles.hint, { color: theme.muted, fontFamily: theme.fonts.body }]}>
        Save your own options for future entries.
      </Text>
    </>
  );
}

export function EntryDetailsScreen({ theme, draft, mode = "add", onDraftChange, backLabel, onBack, onContinue }: EntryFormProps & {
  backLabel: string;
  onContinue: () => void;
}) {
  const muted = { color: theme.muted, fontFamily: theme.fonts.body };

  return (
    <AppScreen theme={theme} contentContainerStyle={styles.page}>
      <FormBack theme={theme} label={backLabel} onBack={onBack} />
      <View style={styles.intro}>
        <Text style={[styles.step, muted]}>Step 1 of 2</Text>
        <ScreenHeading theme={theme} title={mode === "edit" ? "Edit the entry" : "Add an entry"} />
      </View>
      <View style={styles.form}>
        <FormField
          theme={theme}
          label="What were you planning to do?"
          value={draft.task}
          onChangeText={(task) => onDraftChange({ ...draft, task })}
          placeholder={mode === "edit" ? "Enter a task" : "Write project proposal"}
          returnKeyType="done"
        />
        <View style={styles.field}>
          <OptionField
            theme={theme}
            label="What made starting difficult?"
            value={draft.difficulty}
            options={difficulties}
            onSelect={(difficulty) => onDraftChange({ ...draft, difficulty })}
          />
          <FutureOption theme={theme} kind="difficulty" />
        </View>
        <View style={styles.field}>
          <OptionField
            theme={theme}
            label="What did you do instead?"
            value={draft.activity}
            options={activities}
            placeholder="No activity selected"
            onSelect={(activity) => onDraftChange({ ...draft, activity })}
          />
          <FutureOption theme={theme} kind="activity" />
        </View>
        <ActionButton theme={theme} label="Choose a strategy" onPress={onContinue} disabled={!draft.task.trim()} />
      </View>
    </AppScreen>
  );
}

export function EntryStrategyScreen({ theme, draft, mode = "add", onDraftChange, onBack, onFinish }: EntryFormProps & {
  onFinish: () => void;
}) {
  const { height } = useWindowDimensions();
  const muted = { color: theme.muted, fontFamily: theme.fonts.body };
  const saveSpacing = Math.min(168, height * 0.19);

  return (
    <AppScreen theme={theme} contentContainerStyle={styles.page}>
      <FormBack theme={theme} onBack={onBack} />
      <View style={[styles.intro, styles.strategyIntro]}>
        <Text style={[styles.step, muted]}>Step 2 of 2</Text>
        <ScreenHeading theme={theme} title="Start small." description={draft.task} />
      </View>
      <View style={styles.form}>
        <View style={styles.field}>
          <OptionField
            theme={theme}
            label="Choose a strategy"
            value={draft.strategy}
            options={strategies}
            placeholder="No strategy selected"
            onSelect={(strategy) => onDraftChange({ ...draft, strategy })}
          />
          <Text style={[styles.hint, muted]}>Choose what feels manageable today.</Text>
        </View>
        <View style={[styles.save, { marginTop: saveSpacing }]}>
          <ActionButton theme={theme} label={mode === "edit" ? "Save changes" : "Save and try"} onPress={onFinish} />
          <Text style={[styles.hint, styles.centered, muted]}>
            Reflect later. You can add a second strategy if you try another.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 0 },
  back: { minWidth: 44, minHeight: 44, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 11 },
  pressed: { opacity: 0.72 },
  intro: { marginTop: 18, gap: 5 },
  strategyIntro: { marginTop: 30 },
  step: { fontSize: 13, lineHeight: 18 },
  form: { marginTop: 26, gap: 27 },
  label: { fontSize: 14, lineHeight: 19 },
  field: { gap: 9 },
  optionField: {
    minHeight: 53,
    borderWidth: 1,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionValue: { flex: 1, fontSize: 15, lineHeight: 21 },
  customRow: { flexDirection: "row", gap: 9 },
  customInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 49,
    borderWidth: 1,
    borderRadius: 9,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  customButton: { minWidth: 64, justifyContent: "center", alignItems: "center", borderRadius: 9, opacity: 0.7 },
  hint: { fontSize: 12, lineHeight: 17 },
  save: { gap: 12 },
  centered: { textAlign: "center", paddingHorizontal: 7 },
  modal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0, 0, 0, 0.56)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "80%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  modalHeading: { fontSize: 23, lineHeight: 30 },
  optionList: { flexGrow: 0, flexShrink: 1 },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 9,
  },
});
