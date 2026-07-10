import { Pool } from "pg";
import { logger } from "../../../shared/Logger.js";

type PostgresConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  ssl: boolean;
};

export const createPostgresPool = (config: PostgresConfig) => {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.name,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });

  pool.on("error", (error) => {
    logger.error(
      {
        error,
        code: "code" in error ? error.code : undefined,
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
      },
      "Unexpected PostgreSQL pool error",
    );
  });

  return pool;
};

export type PostgresPool = ReturnType<typeof createPostgresPool>;
