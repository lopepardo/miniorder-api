import fs from "node:fs/promises";
import path from "node:path";
import type { PostgresPool } from "./createPostgresPool.js";

export const runPostgresMigrations = async (pool: PostgresPool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const migrationsDir = path.resolve("db/migrations");
  const files = await fs.readdir(migrationsDir);

  const sqlFiles = files.filter((file) => file.endsWith(".sql")).sort();

  for (const file of sqlFiles) {
    const alreadyExecuted = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [file],
    );

    if (alreadyExecuted.rowCount && alreadyExecuted.rowCount > 0) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
};
