import express, { type RequestHandler } from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { clientIpHeader, createOwnerAuth } from "./auth.ts";
import { createDatabasePool } from "./database.ts";

const app = express();
const database = createDatabasePool({ query_timeout: 2500 });
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535.");
}

app.get("/", (_request, response) => {
  response.json({ name: "Momentum API" });
});

app.get("/health", async (_request, response) => {
  response.set("Cache-Control", "no-store");

  try {
    await database.query("SELECT 1");
    response.json({ status: "ok", database: "up" });
  } catch {
    response.status(503).json({ status: "unavailable", database: "down" });
  }
});

const auth = process.env.BETTER_AUTH_SECRET?.trim() ? createOwnerAuth(database) : undefined;
const authHandler = auth ? toNodeHandler(auth) : undefined;

const handleAuthRequest: RequestHandler = async (request, response) => {
  response.set("Cache-Control", "no-store");
  if (!authHandler) {
    response.status(503).json({ error: "Authentication is unavailable." });
    return;
  }
  request.headers[clientIpHeader] = request.socket.remoteAddress;
  await authHandler(request, response);
};

app.post(["/api/auth/sign-in/username", "/api/auth/sign-out"], handleAuthRequest);
app.get("/api/auth/get-session", handleAuthRequest);

app.get("/api/me", async (request, response) => {
  response.set("Cache-Control", "no-store");
  if (!auth) {
    response.status(503).json({ error: "Authentication is unavailable." });
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
      query: { disableRefresh: true },
    });
    if (!session) {
      response.status(401).json({ error: "Sign in to continue." });
      return;
    }
    response.json({
      id: session.user.id,
      email: session.user.email,
      username: session.user.displayUsername ?? session.user.username ?? null,
    });
  } catch {
    response.status(503).json({ error: "Authentication is unavailable." });
  }
});

app.listen(port, host, () => {
  console.log(`Momentum API listening on http://${host}:${port}`);
});
