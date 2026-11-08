import express from "express";
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

app.listen(port, host, () => {
  console.log(`Momentum API listening on http://${host}:${port}`);
});
