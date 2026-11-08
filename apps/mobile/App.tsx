import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <Text accessibilityRole="header" style={styles.title}>
        Momentum
      </Text>
      <Text style={styles.description}>Make time for one small next step.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F6FC",
    padding: 24,
    gap: 10,
  },
  title: {
    color: "#292239",
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    color: "#534A62",
    fontSize: 17,
    textAlign: "center",
  },
});
