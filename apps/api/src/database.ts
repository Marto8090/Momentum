import { Pool, type PoolConfig } from "pg";

export function createDatabasePool(options: Pick<PoolConfig, "query_timeout"> = {}) {
  const host = process.env.POSTGRES_HOST?.trim() || "127.0.0.1";
  const localDatabase = ["127.0.0.1", "localhost", "::1"].includes(host);
  const port = Number(process.env.POSTGRES_PORT || (localDatabase ? 5433 : 5432));

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("POSTGRES_PORT must be an integer from 1 to 65535.");
  }

  const pool = new Pool({
    host,
    port,
    user: process.env.POSTGRES_USER || "momentum",
    database: "momentum",
    password: process.env.POSTGRES_PASSWORD,
    ssl: localDatabase ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: 2000,
    ...options,
  });

  pool.on("error", () => {
    console.error("An idle PostgreSQL connection was lost.");
  });

  return pool;
}
