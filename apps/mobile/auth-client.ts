import { expoClient } from "@better-auth/expo/client";
import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

function getApiOrigin() {
  try {
    const url = new URL(process.env.EXPO_PUBLIC_API_URL ?? "");
    const supportedProtocol = url.protocol === "https:" || (__DEV__ && url.protocol === "http:");
    if (supportedProtocol && !url.username && !url.password) return url.origin;
  } catch {
    // The app shows setup guidance when the API address is missing or invalid.
  }
}

function createMomentumAuthClient(apiOrigin: string) {
  const storageOrigin = apiOrigin.replace(/[^a-zA-Z0-9.-]/g, (character) =>
    "_" + character.charCodeAt(0).toString(16),
  );

  return createAuthClient({
    baseURL: apiOrigin,
    fetchOptions: { timeout: 10_000 },
    plugins: [
      expoClient({
        scheme: "momentum",
        storage: SecureStore,
        storagePrefix: "momentum-" + storageOrigin,
        disableCache: true,
      }),
      usernameClient(),
    ],
  });
}

const apiOrigin = getApiOrigin();
export const authClient = apiOrigin ? createMomentumAuthClient(apiOrigin) : undefined;
export type MomentumAuthClient = ReturnType<typeof createMomentumAuthClient>;
