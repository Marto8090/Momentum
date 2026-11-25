import Feather from "@expo/vector-icons/Feather";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton, AppScreen, FormField, ScreenHeading, type AccountTheme } from "./account-ui";
import { FormBack } from "./entry-screens";

type Step = { id: number; instruction: string };

type CreateStrategyProps = {
  theme: AccountTheme;
  onBack: () => void;
  onFinish: () => void;
};

export function CreateStrategyScreen({ theme, onBack, onFinish }: CreateStrategyProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [helpContext, setHelpContext] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ id: 1, instruction: "" }]);
  const nextStepId = useRef(2);
  const canSave = Boolean(name.trim() && description.trim() && steps.every((step) => step.instruction.trim()));

  function addStep() {
    const step = { id: nextStepId.current, instruction: "" };
    nextStepId.current += 1;
    setSteps((current) => [...current, step]);
  }

  function changeStep(id: number, instruction: string) {
    setSteps((current) => current.map((step) => step.id === id ? { ...step, instruction } : step));
  }

  function removeStep(id: number) {
    setSteps((current) => current.length > 1 ? current.filter((step) => step.id !== id) : current);
  }

  return (
    <AppScreen theme={theme} contentContainerStyle={styles.page}>
      <FormBack theme={theme} label="Strategies" onBack={onBack} />
      <View style={styles.content}>
        <ScreenHeading theme={theme} title="Add a strategy" description="Save a small approach you can return to." />
        <View style={styles.fields}>
          <FormField
            theme={theme}
            label="Strategy name"
            placeholder="e.g. Prepare your workspace"
            value={name}
            onChangeText={setName}
          />
          <FormField
            theme={theme}
            label="Short description"
            placeholder="What does this strategy help you do?"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.longInput}
          />
          <FormField
            theme={theme}
            label="When it might help · optional"
            placeholder="e.g. When distractions get in the way"
            value={helpContext}
            onChangeText={setHelpContext}
            multiline
            style={styles.longInput}
          />
          <FormField
            theme={theme}
            label="Estimated time · optional"
            placeholder="e.g. 2 minutes"
            value={estimatedTime}
            onChangeText={setEstimatedTime}
          />
        </View>
        <View style={styles.howTo}>
          <Text
            accessibilityRole="header"
            style={[styles.sectionTitle, { color: theme.foreground, fontFamily: theme.fonts.heading }]}
          >
            How to try it
          </Text>
          {steps.map((step, index) => (
            <StrategyStep
              key={step.id}
              theme={theme}
              number={index + 1}
              instruction={step.instruction}
              onChange={(instruction) => changeStep(step.id, instruction)}
              onRemove={steps.length > 1 ? () => removeStep(step.id) : undefined}
            />
          ))}
        </View>
        <View style={styles.actions}>
          <ActionButton theme={theme} label="Add a step" icon="plus" variant="outline" onPress={addStep} />
          <ActionButton theme={theme} label="Save strategy" onPress={onFinish} disabled={!canSave} />
        </View>
      </View>
    </AppScreen>
  );
}

function StrategyStep({ theme, number, instruction, onChange, onRemove }: {
  theme: AccountTheme;
  number: number;
  instruction: string;
  onChange: (instruction: string) => void;
  onRemove?: () => void;
}) {
  const label = `Step ${number}`;

  return (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.stepLabel}
        >
          <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
            <Text style={[styles.numberText, { color: theme.onAccent, fontFamily: theme.fonts.bold }]}>
              {number}
            </Text>
          </View>
          <Text style={[styles.stepLabelText, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
            {label}
          </Text>
        </View>
        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove step ${number}`}
            hitSlop={4}
            onPress={onRemove}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
          >
            <Feather accessible={false} name="x" size={20} color={theme.muted} />
          </Pressable>
        ) : null}
      </View>
      <TextInput
        accessibilityLabel={label}
        keyboardAppearance={theme.isDark ? "dark" : "light"}
        placeholder="Describe one small action"
        placeholderTextColor={theme.muted}
        selectionColor={theme.accent}
        value={instruction}
        onChangeText={onChange}
        multiline
        style={[
          styles.stepInput,
          {
            backgroundColor: theme.surface,
            borderColor: theme.fieldBorder,
            color: theme.foreground,
            fontFamily: theme.fonts.body,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 4 },
  content: { marginTop: 26, gap: 23 },
  fields: { gap: 29, marginTop: 8 },
  longInput: { minHeight: 100, textAlignVertical: "top" },
  howTo: { gap: 14, marginTop: 4 },
  sectionTitle: { fontSize: 26, lineHeight: 33 },
  step: { gap: 7 },
  stepHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 9 },
  stepLabel: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9 },
  stepNumber: {
    minWidth: 24,
    minHeight: 24,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  numberText: { fontSize: 13, lineHeight: 18 },
  stepLabelText: { fontSize: 14, lineHeight: 19, flexShrink: 1 },
  remove: { width: 36, minHeight: 36, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.72 },
  stepInput: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: "top",
  },
  actions: { gap: 12 },
});
