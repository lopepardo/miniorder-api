import { Pool } from "pg";

type PostgresConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  ssl: boolean;
};

export const createPostgresPool = (config: PostgresConfig) => {
  return new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.name,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });
};

export type PostgresPool = ReturnType<typeof createPostgresPool>;
