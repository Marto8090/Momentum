import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, formCsrfMiddleware } from "better-auth/api";
import { username } from "better-auth/plugins/username";
import type { Pool } from "pg";

export const clientIpHeader = "x-momentum-client-ip";

export function createOwnerAuth(database: Pool, allowOwnerSetup = false) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("Set BETTER_AUTH_SECRET in .env to a random value of at least 32 characters.");
  }

  const expoOrigin = process.env.MOMENTUM_EXPO_ORIGIN?.trim();
  const baseURL = process.env.BETTER_AUTH_URL || `http://127.0.0.1:${process.env.PORT ?? 3001}`;

  return betterAuth({
    appName: "Momentum",
    baseURL,
    secret,
    database,
    trustedOrigins: expoOrigin ? ["momentum://", expoOrigin] : ["momentum://"],
    plugins: [expo(), username()],
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path === "/sign-in/username") {
          await formCsrfMiddleware(context);
        }
      }),
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowOwnerSetup,
      autoSignIn: false,
      minPasswordLength: 15,
    },
    session: { cookieCache: { enabled: false } },
    advanced: { ipAddress: { ipAddressHeaders: [clientIpHeader] } },
    rateLimit: { enabled: true, storage: "database" },
  });
}
