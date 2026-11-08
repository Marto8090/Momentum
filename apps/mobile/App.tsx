import { useRef, useState, type ComponentRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { authClient, type MomentumAuthClient } from "./auth-client";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.brand}>momentum</Text>
            {authClient ? (
              <OwnerAccess client={authClient} />
            ) : (
              <View style={styles.section}>
                <Text accessibilityRole="header" style={styles.title}>Connect to Momentum</Text>
                <Text style={styles.description}>
                  Set the API address using EXPO_PUBLIC_API_URL and restart the app.
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function OwnerAccess({ client }: { client: MomentumAuthClient }) {
  const { data, error, isPending, refetch } = client.useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  async function signIn() {
    if (submitting.current || !username.trim() || !password) return;
    submitting.current = true;
    setBusy(true);
    setNotice("");

    try {
      const result = await client.signIn.username({ username: username.trim(), password });
      if (result.error?.status === 429) {
        setNotice("Too many attempts. Wait a moment and try again.");
      } else if (result.error?.status === 401 || result.error?.status === 422) {
        setNotice("Check your username and password and try again.");
      } else if (result.error) {
        setNotice("Couldn't sign in. Try again.");
      } else {
        setPassword("");
      }
    } catch {
      setNotice("Couldn't connect to Momentum. Check your connection and try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function signOut() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setNotice("");

    try {
      const result = await client.signOut();
      if (result.error) setNotice("Couldn't confirm sign-out with the server.");
    } catch {
      setNotice("Couldn't confirm sign-out with the server.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (isPending) {
    return <ActivityIndicator accessibilityLabel="Checking session" color="#EDB565" />;
  }

  if (error && !notice) {
    return (
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.title}>Couldn't check your session</Text>
        <Text style={styles.description}>Check that Momentum is reachable and try again.</Text>
        <ActionButton label="Try again" onPress={() => void refetch()} />
      </View>
    );
  }

  if (data?.user && !error) {
    const ownerName = data.user.displayUsername ?? data.user.username ?? data.user.name;
    return (
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.title}>Hi, {ownerName}</Text>
        <Text style={styles.description}>You're signed in to your private journal.</Text>
        {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
        <ActionButton label={busy ? "Signing out…" : "Sign out"} disabled={busy} onPress={signOut} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>Welcome back</Text>
      <Text style={styles.description}>Sign in to your private journal.</Text>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            accessibilityLabel="Username"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect={false}
            editable={!busy}
            onChangeText={setUsername}
            onSubmitEditing={() => passwordInput.current?.focus()}
            returnKeyType="next"
            style={styles.input}
            value={username}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            ref={passwordInput}
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!busy}
            onChangeText={setPassword}
            onSubmitEditing={signIn}
            returnKeyType="go"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>
      </View>
      {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
      <ActionButton
        label={busy ? "Signing in…" : "Sign in"}
        disabled={busy || !username.trim() || !password}
        onPress={signIn}
      />
    </View>
  );
}

function ActionButton({ label, disabled = false, onPress }: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dimmed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#111F19" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 32, gap: 44 },
  brand: { color: "#EDB565", fontSize: 18, fontWeight: "700", letterSpacing: 0.8 },
  section: { gap: 14 },
  title: { color: "#F7F0E4", fontSize: 34, fontWeight: "700" },
  description: { color: "#BAC8BE", fontSize: 16, lineHeight: 23 },
  fields: { gap: 18, marginTop: 16 },
  field: { gap: 8 },
  label: { color: "#F7F0E4", fontSize: 15, fontWeight: "500" },
  input: {
    backgroundColor: "#1C3026",
    borderColor: "#4E6657",
    borderWidth: 1,
    borderRadius: 11,
    color: "#F7F0E4",
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  notice: { color: "#F9BBA8", fontSize: 15, lineHeight: 21 },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDB565",
    borderRadius: 12,
    marginTop: 12,
    minHeight: 52,
    padding: 12,
  },
  buttonText: { color: "#18221A", fontSize: 16, fontWeight: "700" },
  dimmed: { opacity: 0.65 },
});
