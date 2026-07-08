import { createPostgresPool } from "../infrastructure/database/postgres/createPostgresPool.js";
import { runPostgresMigrations } from "../infrastructure/database/postgres/runPostgresMigrations.js";
import { env } from "../infrastructure/config/env.js";

const db = createPostgresPool(env.database);

try {
  console.info("Running database migrations...");

  await runPostgresMigrations(db);

  console.info("Database migrations completed.");
  process.exit(0);
} catch (error) {
  console.error("Database migration failed.", error);
  process.exit(1);
} finally {
  await db.end();
}
