import { useEffect, useRef, useState, type ComponentRef } from "react";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Lora_600SemiBold } from "@expo-google-fonts/lora/600SemiBold";
import { useFonts } from "expo-font";
import { ActivityIndicator, BackHandler, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  ActionButton,
  AppScreen,
  Brand,
  FormField,
  LinkButton,
  ScreenHeading,
  YourAccount,
  useAccountTheme,
  type AccountTheme,
  type Appearance,
} from "./account-ui";
import { authClient, type MomentumAuthClient } from "./auth-client";

export default function App() {
  const [appearance, setAppearance] = useState<Appearance>("dark");
  const theme = useAccountTheme(appearance);
  const [fontsLoaded, fontError] = useFonts({
    Lora_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      {!fontsLoaded && !fontError ? (
        <AppScreen theme={theme}>
          <ActivityIndicator accessibilityLabel="Loading Momentum" color={theme.accent} />
        </AppScreen>
      ) : authClient ? (
        <OwnerAccess
          client={authClient}
          theme={theme}
          appearance={appearance}
          onAppearanceChange={setAppearance}
        />
      ) : (
        <AppScreen theme={theme}>
          <Brand theme={theme} />
          <View style={styles.simplePage}>
            <ScreenHeading
              theme={theme}
              title="Connect to Momentum"
              description="Set the API address using EXPO_PUBLIC_API_URL and restart the app."
            />
          </View>
        </AppScreen>
      )}
    </SafeAreaProvider>
  );
}

type OwnerAccessProps = {
  client: MomentumAuthClient;
  theme: AccountTheme;
  appearance: Appearance;
  onAppearanceChange: (appearance: Appearance) => void;
};

function OwnerAccess({ client, ...props }: OwnerAccessProps) {
  const { data, error, isPending, refetch } = client.useSession();
  const { theme } = props;

  if (isPending || error) {
    return (
      <AppScreen theme={theme}>
        <Brand theme={theme} />
        <View style={styles.simplePage}>
          {isPending ? (
            <ActivityIndicator accessibilityLabel="Checking session" color={theme.accent} />
          ) : (
            <>
              <ScreenHeading
                theme={theme}
                title="Couldn't check your session"
                description="Check that Momentum is reachable and try again."
              />
              <ActionButton theme={theme} label="Try again" onPress={() => void refetch()} />
            </>
          )}
        </View>
      </AppScreen>
    );
  }

  if (data?.user) {
    const { id, displayUsername, username, name } = data.user;
    return (
      <SignedInArea
        key={id}
        client={client}
        ownerName={displayUsername || username || name}
        {...props}
      />
    );
  }

  return <SignInArea client={client} theme={theme} />;
}

function useBackToParent(onBack: (() => void) | undefined) {
  useEffect(() => {
    if (!onBack) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);
}

const accountPreviewMessage = "Account creation is coming later.";

function SignInArea({ client, theme }: Pick<OwnerAccessProps, "client" | "theme">) {
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [accountPreviewed, setAccountPreviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const passwordInput = useRef<ComponentRef<typeof TextInput>>(null);

  useBackToParent(showCreateAccount ? () => setShowCreateAccount(false) : undefined);

  async function signIn() {
    if (submitting.current || !username.trim() || !password) return;
    submitting.current = true;
    setBusy(true);
    setNotice("");
    setAccountPreviewed(false);

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

  if (showCreateAccount) {
    return (
      <CreateAccount
        theme={theme}
        onLogIn={() => setShowCreateAccount(false)}
        onCreateAccount={() => {
          setShowCreateAccount(false);
          setAccountPreviewed(true);
        }}
      />
    );
  }

  return (
    <AppScreen theme={theme}>
      <Brand theme={theme} />
      <View style={styles.signInPage}>
        <ScreenHeading theme={theme} title="Welcome back" description="Sign in to your private journal." />
        <View style={[styles.form, styles.signInForm]}>
          <FormField
            theme={theme}
            label="Username"
            placeholder="Your username"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect={false}
            editable={!busy}
            onChangeText={setUsername}
            onSubmitEditing={() => passwordInput.current?.focus()}
            returnKeyType="next"
            value={username}
          />
          <FormField
            theme={theme}
            label="Password"
            inputRef={passwordInput}
            placeholder="Your password"
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect={false}
            editable={!busy}
            onChangeText={setPassword}
            onSubmitEditing={signIn}
            returnKeyType="go"
            password
            value={password}
          />
        </View>
        <LinkButton theme={theme} label="Forgot password?" align="end" disabled />
        {notice ? <Notice theme={theme} message={notice} error /> : null}
        {accountPreviewed ? <Notice theme={theme} message={accountPreviewMessage} /> : null}
        <View style={styles.mainAction}>
          <ActionButton
            theme={theme}
            label={busy ? "Signing in…" : "Sign in"}
            disabled={busy || !username.trim() || !password}
            onPress={signIn}
          />
        </View>
        <View style={[styles.alternate, styles.signInAlternate]}>
          <Text style={[styles.helper, { color: theme.muted, fontFamily: theme.fonts.body }]}>New to Momentum?</Text>
          <LinkButton
            theme={theme}
            label="Create account"
            disabled={busy}
            onPress={() => {
              setPassword("");
              setNotice("");
              setAccountPreviewed(false);
              setShowCreateAccount(true);
            }}
          />
        </View>
      </View>
    </AppScreen>
  );
}

function CreateAccount({ theme, onLogIn, onCreateAccount }: {
  theme: AccountTheme;
  onLogIn: () => void;
  onCreateAccount: () => void;
}) {
  return (
    <AppScreen theme={theme}>
      <Brand theme={theme} />
      <View style={styles.createAccountPage}>
        <ScreenHeading theme={theme} title="Create your account" description="A private space for small steps." />
        <View style={[styles.form, styles.createAccountForm]}>
          <FormField
            theme={theme}
            label="Username"
            placeholder="Your username"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormField
            theme={theme}
            label="Email"
            placeholder="you@example.com"
            autoComplete="off"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormField
            theme={theme}
            label="Password"
            placeholder="Your password"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
            password
          />
          <FormField
            theme={theme}
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
            password
          />
        </View>
        <View style={styles.mainAction}>
          <ActionButton theme={theme} label="Create account" onPress={onCreateAccount} />
        </View>
        <View style={styles.alternate}>
          <Text style={[styles.helper, { color: theme.muted, fontFamily: theme.fonts.body }]}>Already have an account?</Text>
          <LinkButton theme={theme} label="Log in" onPress={onLogIn} />
        </View>
      </View>
    </AppScreen>
  );
}

function SignedInArea({ client, ownerName, theme, appearance, onAppearanceChange }: OwnerAccessProps & {
  ownerName: string;
}) {
  const [showAccount, setShowAccount] = useState(false);
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const submitting = useRef(false);

  useBackToParent(showAccount ? () => setShowAccount(false) : undefined);

  async function signOut() {
    if (submitting.current) return;
    submitting.current = true;
    setSigningOut(true);
    setNotice("");

    try {
      const result = await client.signOut();
      if (result.error) setNotice("Couldn't confirm sign-out with the server.");
    } catch {
      setNotice("Couldn't confirm sign-out with the server.");
    } finally {
      submitting.current = false;
      setSigningOut(false);
    }
  }

  if (showAccount) {
    return (
      <YourAccount
        theme={theme}
        ownerName={ownerName}
        appearance={appearance}
        onAppearanceChange={onAppearanceChange}
        onBack={() => setShowAccount(false)}
        onSignOut={signOut}
        signingOut={signingOut}
        notice={notice}
      />
    );
  }

  return (
    <AppScreen theme={theme}>
      <Brand theme={theme} />
      <View style={styles.simplePage}>
        <ScreenHeading theme={theme} title={`Hi, ${ownerName}`} description="You're signed in to your private journal." />
        {notice ? <Notice theme={theme} message={notice} error /> : null}
        <ActionButton theme={theme} label="Account" onPress={() => setShowAccount(true)} disabled={signingOut} />
        <ActionButton theme={theme} label={signingOut ? "Signing out…" : "Sign out"} onPress={signOut} disabled={signingOut} variant="outline" />
      </View>
    </AppScreen>
  );
}

function Notice({ theme, message, error = false }: { theme: AccountTheme; message: string; error?: boolean }) {
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.helper, { color: error ? theme.danger : theme.muted, fontFamily: theme.fonts.body }]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  signInPage: { gap: 12, marginTop: 60 },
  createAccountPage: { gap: 20, marginTop: 35 },
  simplePage: { gap: 16, marginTop: 44 },
  form: { gap: 27 },
  signInForm: { marginTop: 36 },
  createAccountForm: { marginTop: 27 },
  mainAction: { marginTop: 16 },
  alternate: { alignItems: "center", marginTop: 12 },
  signInAlternate: { marginTop: 20 },
  helper: { fontSize: 14, lineHeight: 21 },
});
