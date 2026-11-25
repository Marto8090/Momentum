import { useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Lora_600SemiBold } from "@expo-google-fonts/lora/600SemiBold";
import Feather from "@expo/vector-icons/Feather";
import { useFonts } from "expo-font";
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  AccountAvatar,
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
import { CreateStrategyScreen } from "./create-strategy-screen";
import { EntryDetailsScreen, EntryStrategyScreen, initialEntryDraft, type EntryDraft } from "./entry-screens";
import { HomeScreen } from "./home-screen";
import { getInsightsSummary, type InsightsPeriod, type InsightsView } from "./insights-data";
import { InsightsFooter, InsightsScreen } from "./insights-screen";
import { JournalEntryScreen, JournalScreen } from "./journal-screens";
import {
  pendingJournalEntry,
  recentJournalEntry,
  sampleJournalEntries,
  type JournalEntry,
} from "./journal-data";
import { ReflectionScreen } from "./reflection-screen";
import { sampleStrategies, type Strategy } from "./strategy-data";
import { StrategyDetailScreen } from "./strategy-detail";
import { StrategyLibraryFooter, StrategyLibraryScreen } from "./strategy-library";

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

const tabLabels = { home: "Home", journal: "Journal", strategies: "Strategies", insights: "Insights" };
type MainTab = keyof typeof tabLabels;
type StrategyDestination = { name: "strategy"; strategy: Strategy };
type EntryDestination = { name: "entry"; entry: JournalEntry; returnTo?: StrategyDestination };

type SignedInDestination =
  | { name: "account" }
  | { name: "create-strategy" }
  | StrategyDestination
  | EntryDestination
  | { name: "entry-form"; step: "details" | "strategy"; draft: EntryDraft; returnToEntry?: EntryDestination }
  | { name: "reflection"; entry: JournalEntry; returnToEntry?: EntryDestination };

function SignedInArea({ client, ownerName, theme, appearance, onAppearanceChange }: OwnerAccessProps & {
  ownerName: string;
}) {
  const [tab, setTab] = useState<MainTab>("home");
  const [destination, setDestination] = useState<SignedInDestination | null>(null);
  const [strategyQuery, setStrategyQuery] = useState("");
  const [savedStrategiesOnly, setSavedStrategiesOnly] = useState(false);
  const [insightsPeriod, setInsightsPeriod] = useState<InsightsPeriod>("7-days");
  const [insightsView, setInsightsView] = useState<InsightsView>("patterns");
  const [notice, setNotice] = useState("");
  const [previewNotice, setPreviewNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const submitting = useRef(false);

  const backLabel = tabLabels[tab];

  const goBack = useCallback(() => {
    setDestination((current) => {
      if (current?.name === "entry-form" && current.step === "strategy") {
        return { ...current, step: "details" };
      }
      if (current?.name === "entry-form" || current?.name === "reflection") {
        return current.returnToEntry ?? null;
      }
      return current?.name === "entry" ? current.returnTo ?? null : null;
    });
  }, []);

  useBackToParent(destination ? goBack : tab !== "home" ? () => selectTab("home") : undefined);

  function selectTab(nextTab: MainTab) {
    setPreviewNotice("");
    setTab(nextTab);
  }

  function openEntry(id: string, returnTo?: StrategyDestination) {
    const entry = sampleJournalEntries.find((sample) => sample.id === id);
    if (entry) {
      setPreviewNotice("");
      setDestination({ name: "entry", entry, returnTo });
    }
  }

  function openStrategy(strategy: Strategy) {
    setPreviewNotice("");
    setDestination({ name: "strategy", strategy });
  }

  function openCreateStrategy() {
    setPreviewNotice("");
    setDestination({ name: "create-strategy" });
  }

  function openEntryPreview() {
    setPreviewNotice("");
    setDestination({ name: "entry-form", step: "details", draft: initialEntryDraft });
  }

  function openEditPreview(returnToEntry: EntryDestination) {
    const { entry } = returnToEntry;
    setPreviewNotice("");
    setDestination({
      name: "entry-form",
      step: "details",
      returnToEntry,
      draft: {
        task: entry.title,
        difficulty: entry.blocker,
        activity: entry.whatIDidInstead ?? "",
        strategy: entry.strategy ?? "",
      },
    });
  }

  function changeDraft(draft: EntryDraft) {
    setDestination((current) => current?.name === "entry-form" ? { ...current, draft } : current);
  }

  function openReflection(entry: JournalEntry, returnToEntry?: EntryDestination) {
    setPreviewNotice("");
    setDestination({ name: "reflection", entry, returnToEntry });
  }

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

  if (destination?.name === "account") {
    return (
      <YourAccount
        theme={theme}
        ownerName={ownerName}
        appearance={appearance}
        onAppearanceChange={onAppearanceChange}
        onBack={goBack}
        onSignOut={signOut}
        signingOut={signingOut}
        notice={notice}
      />
    );
  }

  if (destination?.name === "entry") {
    return (
      <JournalEntryScreen
        theme={theme}
        entry={destination.entry}
        backLabel={destination.returnTo ? "Strategy details" : backLabel}
        onBack={goBack}
        onEdit={() => openEditPreview(destination)}
        onReflect={() => openReflection(destination.entry, destination)}
        notice={previewNotice ? <Notice theme={theme} message={previewNotice} /> : null}
      />
    );
  }

  if (destination?.name === "strategy") {
    return (
      <StrategyDetailScreen
        theme={theme}
        strategy={destination.strategy}
        backLabel={backLabel}
        onBack={goBack}
        onOpenEntry={(id) => openEntry(id, destination)}
      />
    );
  }

  if (destination?.name === "create-strategy") {
    return (
      <CreateStrategyScreen
        theme={theme}
        onBack={goBack}
        onFinish={() => {
          setPreviewNotice("Saving strategies is coming later.");
          setDestination(null);
        }}
      />
    );
  }

  if (destination?.name === "entry-form") {
    const { returnToEntry } = destination;
    const mode = returnToEntry ? "edit" : "add";

    if (destination.step === "strategy") {
      return (
        <EntryStrategyScreen
          theme={theme}
          draft={destination.draft}
          mode={mode}
          onDraftChange={changeDraft}
          onBack={goBack}
          onFinish={() => {
            setPreviewNotice(returnToEntry ? "Saving entry changes is coming later." : "Entry saving is coming later.");
            setDestination(returnToEntry ?? null);
          }}
        />
      );
    }

    return (
      <EntryDetailsScreen
        theme={theme}
        draft={destination.draft}
        mode={mode}
        onDraftChange={changeDraft}
        backLabel={returnToEntry ? "Journal entry" : backLabel}
        onBack={goBack}
        onContinue={() => {
          setDestination((current) => current?.name === "entry-form" ? { ...current, step: "strategy" } : current);
        }}
      />
    );
  }

  if (destination?.name === "reflection") {
    return (
      <ReflectionScreen
        theme={theme}
        entry={destination.entry}
        backLabel={destination.returnToEntry ? "Entry" : backLabel}
        onBack={goBack}
        onFinish={() => {
          setPreviewNotice("Reflection saving is coming later.");
          setDestination(destination.returnToEntry ?? null);
        }}
      />
    );
  }

  return (
    <AppScreen
      theme={theme}
      contentContainerStyle={styles.tabContent}
      footer={
        <View>
          {tab === "journal" ? (
            <View style={styles.journalAction}>
              <ActionButton theme={theme} label="Add an entry" icon="edit-2" onPress={openEntryPreview} />
            </View>
          ) : null}
          {tab === "strategies" ? <StrategyLibraryFooter theme={theme} onAddStrategy={openCreateStrategy} /> : null}
          {tab === "insights" ? <InsightsFooter theme={theme} view={insightsView} /> : null}
          <MainTabs theme={theme} currentTab={tab} onTabChange={selectTab} />
        </View>
      }
    >
      <View style={styles.tabHeader}>
        <Brand theme={theme} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          accessibilityState={{ disabled: signingOut }}
          disabled={signingOut}
          onPress={() => {
            setPreviewNotice("");
            setDestination({ name: "account" });
          }}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <AccountAvatar theme={theme} ownerName={ownerName} compact />
        </Pressable>
      </View>
      {notice ? <Notice theme={theme} message={notice} error /> : null}
      {previewNotice ? <Notice theme={theme} message={previewNotice} /> : null}
      {tab === "home" ? (
        <HomeScreen
          theme={theme}
          ownerName={ownerName}
          recentEntry={recentJournalEntry}
          pendingEntry={pendingJournalEntry}
          onOpenEntry={openEntry}
          onAddEntry={openEntryPreview}
          onReflect={() => openReflection(pendingJournalEntry)}
        />
      ) : tab === "journal" ? (
        <JournalScreen theme={theme} entries={sampleJournalEntries} onOpenEntry={openEntry} />
      ) : tab === "strategies" ? (
        <StrategyLibraryScreen
          theme={theme}
          strategies={sampleStrategies}
          query={strategyQuery}
          savedOnly={savedStrategiesOnly}
          onQueryChange={setStrategyQuery}
          onSavedOnlyChange={setSavedStrategiesOnly}
          onOpenStrategy={openStrategy}
        />
      ) : (
        <InsightsScreen
          theme={theme}
          summary={getInsightsSummary(insightsPeriod)}
          period={insightsPeriod}
          view={insightsView}
          onPeriodChange={setInsightsPeriod}
          onViewChange={setInsightsView}
          onOpenStrategy={openStrategy}
        />
      )}
    </AppScreen>
  );
}

const mainTabs = [
  { id: "home", label: tabLabels.home, icon: "home" },
  { id: "journal", label: tabLabels.journal, icon: "book" },
  { id: "strategies", label: tabLabels.strategies, icon: "sun" },
  { id: "insights", label: tabLabels.insights, icon: "bar-chart-2" },
] as const;

function MainTabs({ theme, currentTab, onTabChange }: {
  theme: AccountTheme;
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={[styles.tabBar, { borderColor: theme.border }]}>
      {mainTabs.map(({ id, label, icon }) => {
        const selected = currentTab === id;
        const color = selected ? theme.accent : theme.muted;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            key={id}
            onPress={() => onTabChange(id)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Feather accessible={false} name={icon} size={20} color={color} />
            <Text style={[styles.tabLabel, { color, fontFamily: theme.fonts.semibold }]}>{label}</Text>
            <View
              style={[styles.tabIndicator, { backgroundColor: selected ? theme.accent : "transparent" }]}
            />
          </Pressable>
        );
      })}
    </View>
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
  tabContent: { paddingBottom: 14 },
  tabHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 12 },
  journalAction: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 14 },
  tabBar: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12 },
  tab: { flex: 1, minHeight: 68, alignItems: "center", justifyContent: "center", gap: 4, padding: 4 },
  tabLabel: { fontSize: 11, lineHeight: 15, textAlign: "center" },
  tabIndicator: { width: 4, height: 4, borderRadius: 2 },
  pressed: { opacity: 0.75 },
});
