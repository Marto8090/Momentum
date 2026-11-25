import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const envFile = new URL(".env.development.local", import.meta.url);
const settings = existsSync(envFile) ? parseEnv(readFileSync(envFile, "utf8")) : {};
const targetKeys = new Map([
  ["--momentum-api=local", "MOMENTUM_LOCAL_API_URL"],
  ["--momentum-api=azure", "MOMENTUM_AZURE_API_URL"],
]);
const targetKey = targetKeys.get(process.argv[2]);

const savedUrl = targetKey
  ? settings[targetKey]
  : settings.EXPO_PUBLIC_API_URL ?? settings.MOMENTUM_LOCAL_API_URL;
const apiUrl = URL.parse(savedUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "");
const isApiUrl = apiUrl && ["http:", "https:"].includes(apiUrl.protocol) && !apiUrl.username && !apiUrl.password;

if (targetKey) {
  if (!savedUrl || !isApiUrl) {
    console.error(`Set ${targetKey} to a valid API URL in apps/mobile/.env.development.local.`);
    process.exit(1);
  }
  process.argv.splice(2, 1);
}

// Use the saved preview target even if the terminal still has an old value.
if (savedUrl !== undefined) {
  process.env.EXPO_PUBLIC_API_URL = savedUrl;
}

if (isApiUrl) {
  console.log(`Momentum API: ${apiUrl.origin}`);
}

process.argv.splice(2, 0, "start");
await import("expo/bin/cli");
