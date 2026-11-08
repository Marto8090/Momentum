import { Pool, type PoolConfig } from "pg";

export function createDatabasePool(options: Pick<PoolConfig, "query_timeout"> = {}) {
  const port = Number(process.env.POSTGRES_PORT || 5433);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("POSTGRES_PORT must be an integer from 1 to 65535.");
  }

  const pool = new Pool({
    host: "127.0.0.1",
    port,
    user: "momentum",
    database: "momentum",
    password: process.env.POSTGRES_PASSWORD,
    connectionTimeoutMillis: 2000,
    ...options,
  });

  pool.on("error", () => {
    console.error("An idle PostgreSQL connection was lost.");
  });

  return pool;
}
