import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const envFile = new URL(".env.development.local", import.meta.url);

if (existsSync(envFile)) {
  const settings = parseEnv(readFileSync(envFile, "utf8"));
  const apiUrl = settings.EXPO_PUBLIC_API_URL;

  // Use the saved preview target even if the terminal still has an old value.
  if (apiUrl !== undefined) {
    process.env.EXPO_PUBLIC_API_URL = apiUrl;
  }
}

const apiUrl = URL.parse(process.env.EXPO_PUBLIC_API_URL ?? "");
if (apiUrl?.protocol === "http:" || apiUrl?.protocol === "https:") {
  console.log(`Momentum API: ${apiUrl.origin}`);
}

process.argv.splice(2, 0, "start");
await import("expo/bin/cli");
