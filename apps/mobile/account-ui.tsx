import Feather from "@expo/vector-icons/Feather";
import { useState, type ComponentRef, type ReactNode, type Ref } from "react";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type Appearance = "dark" | "light" | "system";

const fonts = {
  heading: "Lora_600SemiBold",
  body: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};

export type AccountTheme = {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  fieldBorder: string;
  foreground: string;
  muted: string;
  accent: string;
  onAccent: string;
  danger: string;
  fonts: typeof fonts;
};

const darkTheme: AccountTheme = {
  isDark: true,
  background: "#101B17",
  surface: "#1B2B24",
  surfaceRaised: "#26382F",
  border: "#465D50",
  fieldBorder: "#657C70",
  foreground: "#EDF4E9",
  muted: "#A9BDB0",
  accent: "#F0B96B",
  onAccent: "#101B17",
  danger: "#FF9E91",
  fonts,
};

const lightTheme: AccountTheme = {
  isDark: false,
  background: "#FAFEFC",
  surface: "#EBF3F0",
  surfaceRaised: "#DCEBE5",
  border: "#A0B8AD",
  fieldBorder: "#71867B",
  foreground: "#20322D",
  muted: "#485E54",
  accent: "#076B64",
  onAccent: "#FFFFFF",
  danger: "#8F3B33",
  fonts,
};

export function useAccountTheme(appearance: Appearance): AccountTheme {
  const system = useColorScheme();
  const dark = appearance === "dark" || (appearance === "system" && system !== "light");
  return dark ? darkTheme : lightTheme;
}

type Themed = { theme: AccountTheme };
type FeatherIcon = keyof typeof Feather.glyphMap;

export function AppScreen({
  theme,
  children,
  contentContainerStyle,
}: Themed & {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Brand({ theme }: Themed) {
  return (
    <View style={styles.brand}>
      <Feather accessible={false} name="trending-up" size={23} color={theme.accent} />
      <Text style={[styles.brandText, { color: theme.foreground, fontFamily: theme.fonts.semibold }]}>
        momentum
      </Text>
    </View>
  );
}

export function ScreenHeading({
  theme,
  title,
  description,
}: Themed & { title: string; description?: string }) {
  return (
    <View style={styles.heading}>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.foreground, fontFamily: theme.fonts.heading }]}
      >
        {title}
      </Text>
      {description ? (
        <Text style={[styles.description, { color: theme.muted, fontFamily: theme.fonts.body }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function FormField({
  theme,
  label,
  password = false,
  inputRef,
  secureTextEntry,
  style,
  editable,
  ...inputProps
}: Themed & TextInputProps & {
  label: string;
  password?: boolean;
  inputRef?: Ref<ComponentRef<typeof TextInput>>;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordLabel = label === "Confirm password" ? "password confirmation" : "password";
  const visibilityLabel = (passwordVisible ? "Hide " : "Show ") + passwordLabel;

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.surface, borderColor: theme.fieldBorder },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          keyboardAppearance={theme.isDark ? "dark" : "light"}
          placeholderTextColor={theme.muted}
          selectionColor={theme.accent}
          {...inputProps}
          ref={inputRef}
          editable={editable}
          secureTextEntry={password ? !passwordVisible : secureTextEntry}
          style={[
            styles.input,
            { color: theme.foreground, fontFamily: theme.fonts.body },
            style,
          ]}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visibilityLabel}
            accessibilityState={{ disabled: editable === false }}
            disabled={editable === false}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={({ pressed }) => [styles.eye, pressed && styles.pressed]}
          >
            <Feather name={passwordVisible ? "eye-off" : "eye"} size={19} color={theme.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ActionButton({
  theme,
  label,
  onPress,
  disabled = false,
  variant = "filled",
}: Themed & {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "outline";
}) {
  const filled = variant === "filled";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: filled ? theme.accent : theme.background,
          borderColor: theme.accent,
        },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          { color: filled ? theme.onAccent : theme.accent, fontFamily: theme.fonts.bold },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const linkAlignment = { start: "flex-start", center: "center", end: "flex-end" } as const;

export function LinkButton({
  theme,
  label,
  onPress,
  disabled = !onPress,
  align = "center",
}: Themed & {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  align?: keyof typeof linkAlignment;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={{ top: 4, bottom: 4, left: 6, right: 6 }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        { alignSelf: linkAlignment[align] },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.linkLabel, { color: theme.accent, fontFamily: theme.fonts.semibold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const appearanceOptions = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
] as const;

const appearanceHelp = {
  dark: "Dark is the default theme.",
  light: "Light theme is selected.",
  system: "Follows your device appearance.",
};

function AppearanceOptions({
  theme,
  appearance,
  onAppearanceChange,
}: Themed & {
  appearance: Appearance;
  onAppearanceChange: (appearance: Appearance) => void;
}) {
  return (
    <>
      <View
        style={[styles.appearance, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }]}
      >
        {appearanceOptions.map(({ value, label }) => {
          const selected = appearance === value;
          const color = selected ? theme.onAccent : theme.foreground;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ checked: selected }}
              key={value}
              onPress={() => onAppearanceChange(value)}
              style={({ pressed }) => [
                styles.appearanceOption,
                selected && { backgroundColor: theme.accent },
                pressed && styles.pressed,
              ]}
            >
              {selected ? <Feather name="check" size={15} color={color} /> : null}
              <Text style={[styles.appearanceLabel, { color, fontFamily: theme.fonts.semibold }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.note, { color: theme.muted, fontFamily: theme.fonts.body }]}>
        {appearanceHelp[appearance]}
      </Text>
    </>
  );
}

function AccountRow({
  theme,
  label,
  icon,
  description,
  destructive = false,
  divider = true,
}: Themed & {
  label: string;
  icon: FeatherIcon;
  description?: string;
  destructive?: boolean;
  divider?: boolean;
}) {
  const color = destructive ? theme.danger : theme.foreground;

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={description ? label + ". " + description : label}
      accessibilityState={{ disabled: true }}
      style={[
        styles.accountRow,
        divider && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Feather name={icon} size={20} color={color} />
      <View style={styles.accountRowText}>
        <Text style={[styles.rowLabel, { color, fontFamily: theme.fonts.semibold }]}>
          {label}
        </Text>
        {description ? (
          <Text style={[styles.note, { color: theme.muted, fontFamily: theme.fonts.body }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={15} color={theme.muted} />
    </View>
  );
}

function AccountSectionHeading({ theme, title }: Themed & { title: string }) {
  return (
    <Text
      accessibilityRole="header"
      style={[styles.accountSectionHeading, { color: theme.foreground, fontFamily: theme.fonts.heading }]}
    >
      {title}
    </Text>
  );
}

export function YourAccount({
  theme,
  ownerName,
  appearance,
  onAppearanceChange,
  onBack,
  onSignOut,
  signingOut,
  notice,
}: Themed & {
  ownerName: string;
  appearance: Appearance;
  onAppearanceChange: (appearance: Appearance) => void;
  onBack: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  notice?: string;
}) {
  const initials = ownerName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <AppScreen theme={theme} contentContainerStyle={styles.accountContent}>
      <View style={styles.accountHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={19} color={theme.foreground} />
          <Text style={[styles.linkLabel, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
            Back
          </Text>
        </Pressable>
        <Brand theme={theme} />
      </View>
      <ScreenHeading theme={theme} title="Your account" />
      <View style={styles.profile}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.avatarLabel, { color: theme.foreground, fontFamily: theme.fonts.medium }]}>
            {initials || "M"}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: theme.foreground, fontFamily: theme.fonts.heading }]}>
          {ownerName}
        </Text>
      </View>
      <View style={styles.accountRows}>
        <AccountRow theme={theme} label="Personal details" icon="user" />
        <AccountRow theme={theme} label="Change password" icon="lock" />
      </View>
      <View style={styles.accountSection}>
        <AccountSectionHeading theme={theme} title="Appearance" />
        <AppearanceOptions theme={theme} appearance={appearance} onAppearanceChange={onAppearanceChange} />
      </View>
      <View style={styles.accountSection}>
        <AccountSectionHeading theme={theme} title="Privacy & data" />
        <AccountRow theme={theme} label="Export my data" icon="download" />
        <AccountRow
          theme={theme}
          label="Delete account"
          description="Includes your journal data."
          icon="trash-2"
          destructive
          divider={false}
        />
      </View>
      <View style={styles.signOut}>
        {notice ? (
          <Text
            accessibilityRole="alert"
            style={[styles.description, { color: theme.danger, fontFamily: theme.fonts.body }]}
          >
            {notice}
          </Text>
        ) : null}
        <ActionButton
          theme={theme}
          variant="outline"
          label={signingOut ? "Signing out…" : "Sign out"}
          disabled={signingOut}
          onPress={onSignOut}
        />
        <View style={styles.privacy}>
          <Feather accessible={false} name="lock" size={14} color={theme.muted} />
          <Text style={[styles.note, { color: theme.muted, fontFamily: theme.fonts.body }]}>
            Your reflections stay private.
          </Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 12, paddingBottom: 30 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandText: { fontSize: 19, lineHeight: 25 },
  heading: { gap: 5 },
  title: { fontSize: 34, lineHeight: 41 },
  description: { fontSize: 15, lineHeight: 21 },
  field: { gap: 7 },
  fieldLabel: { fontSize: 14, lineHeight: 19 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderRadius: 9,
    minHeight: 53,
  },
  input: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, lineHeight: 21 },
  eye: { width: 46, justifyContent: "center", alignItems: "center" },
  button: {
    minHeight: 55,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  buttonLabel: { fontSize: 15, lineHeight: 20, textAlign: "center" },
  link: { minHeight: 36, paddingHorizontal: 3, justifyContent: "center" },
  linkLabel: { fontSize: 14, lineHeight: 19 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.58 },
  accountContent: { paddingTop: 0 },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingEnd: 32,
    marginBottom: 28,
  },
  back: { flexDirection: "row", alignItems: "center", gap: 9, minHeight: 44 },
  profile: { flexDirection: "row", gap: 17, alignItems: "center", marginTop: 19, marginBottom: 15 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: { fontSize: 16, lineHeight: 22 },
  profileName: { flex: 1, flexShrink: 1, fontSize: 22, lineHeight: 28 },
  accountRows: { marginTop: 18 },
  accountSection: { marginTop: 28, gap: 10 },
  accountSectionHeading: { fontSize: 25, lineHeight: 32 },
  accountRow: { flexDirection: "row", alignItems: "center", minHeight: 58, gap: 20, paddingVertical: 8 },
  accountRowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 14, lineHeight: 19 },
  note: { fontSize: 12, lineHeight: 16 },
  appearance: { flexDirection: "row", borderWidth: 1, borderRadius: 8, padding: 1, gap: 1 },
  appearanceOption: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    borderRadius: 6,
    paddingHorizontal: 3,
  },
  appearanceLabel: { fontSize: 13, lineHeight: 17 },
  signOut: { marginTop: 36, gap: 13 },
  privacy: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
});
