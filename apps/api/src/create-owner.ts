import { input, password } from "@inquirer/prompts";
import { createOwnerAuth } from "./auth.ts";
import { createDatabasePool } from "./database.ts";

async function createOwner() {
  const database = createDatabasePool();
  try {
    // Only this local process enables provisioning. The HTTP API keeps sign-up disabled.
    const auth = createOwnerAuth(database, true);
    const email = (await input({ message: "Owner email:" })).trim().toLowerCase();
    const client = await database.connect();

    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext('momentum:owner-setup'))");
      const { rows } = await client.query<{ id: string; email: string; username: string | null }>(
        'SELECT id, email, username FROM "user" LIMIT 2',
      );
      const [owner] = rows;

      if (owner && (rows.length > 1 || owner.email !== email)) {
        throw new Error("The database already has an owner account.");
      }

      if (owner?.username) {
        await client.query("COMMIT");
        console.log("This owner account already has a username.");
        return;
      }

      const username = (await input({
        message: "Owner username:",
        validate: (value) => /^[a-zA-Z0-9_.]{3,30}$/.test(value.trim())
          || "Use 3 to 30 letters, numbers, underscores, or periods.",
      })).trim();

      if (owner) {
        await client.query(
          'UPDATE "user" SET username = $1, "displayUsername" = $2, "updatedAt" = now() WHERE id = $3',
          [username.toLowerCase(), username, owner.id],
        );
        await client.query("COMMIT");
        console.log("Username added to the existing owner account.");
        return;
      }

      const ownerPassword = await password({
        message: "Owner password (at least 15 characters):",
        mask: "*",
        validate: (value) => value.length >= 15 && value.length <= 128
          ? true
          : "Use 15 to 128 characters.",
      });
      const confirmation = await password({ message: "Confirm password:", mask: "*" });
      if (confirmation !== ownerPassword) {
        throw new Error("The passwords did not match.");
      }

      await auth.api.signUpEmail({
        body: { name: username, username, displayUsername: username, email, password: ownerPassword },
      });
      await client.query("COMMIT");
      console.log("Owner account created.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await database.end();
  }
}

try {
  await createOwner();
} catch (error) {
  console.error("Owner setup failed.", error instanceof Error ? error.message : "Unknown error.");
  process.exitCode = 1;
}
