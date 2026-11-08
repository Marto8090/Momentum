import { readFile, readdir } from "node:fs/promises";
import { createDatabasePool } from "./database.ts";

const migrationsDirectory = new URL("../migrations/", import.meta.url);

async function migrate() {
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
    .sort();

  if (migrationFiles.length === 0) {
    throw new Error("No SQL migration files were found.");
  }

  const pool = createDatabasePool();

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      // Serialize migration runs so two processes cannot apply the same files.
      await client.query("SELECT pg_advisory_xact_lock(hashtext('momentum:migrations'))");
      await client.query(`
        CREATE TABLE IF NOT EXISTS momentum_schema_migrations (
          filename text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT now()
        )
      `);

      const { rows } = await client.query<{ filename: string }>(
        "SELECT filename FROM momentum_schema_migrations",
      );
      const applied = new Set(rows.map(({ filename }) => filename));
      const pending = migrationFiles.filter((filename) => !applied.has(filename));

      for (const filename of pending) {
        const sql = await readFile(new URL(filename, migrationsDirectory), "utf8");
        await client.query(sql);
        await client.query(
          "INSERT INTO momentum_schema_migrations (filename) VALUES ($1)",
          [filename],
        );
      }

      await client.query("COMMIT");
      console.log(pending.length ? `Applied migrations: ${pending.join(", ")}` : "Database is up to date.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

try {
  await migrate();
} catch (error) {
  console.error("Database migration failed.", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
