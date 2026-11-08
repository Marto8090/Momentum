import express from "express";

const app = express();
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535.");
}

app.get("/", (_request, response) => {
  response.json({ name: "Momentum API" });
});

app.listen(port, host, () => {
  console.log(`Momentum API listening on http://${host}:${port}`);
});
