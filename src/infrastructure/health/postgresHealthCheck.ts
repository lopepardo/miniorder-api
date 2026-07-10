import type { Pool } from "pg";

export const makePostgresHealthCheck = (pool: Pool) => {
  return {
    checkDatabase: async (): Promise<void> => {
      await pool.query("SELECT 1");
    },
  };
};
