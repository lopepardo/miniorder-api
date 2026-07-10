import type { Server } from "node:http";
import { buildContainer } from "./composition/container.js";
import { env } from "./infrastructure/config/env.js";
import { createApp } from "./infrastructure/http/createApp.js";
import { logger } from "./shared/Logger.js";

const bootstrap = async () => {
  const container = await buildContainer(env);
  const app = createApp(container);

  const server = app.listen(env.server.port, () => {
    logger.info(
      {
        port: env.server.port,
        url: `http://localhost:${env.server.port}`,
      },
      "MiniOrder API running",
    );
  });

  let isShuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, "Shutting down MiniOrder API");

    try {
      await closeHttpServer(server);
      await container.close();

      logger.info({ signal }, "MiniOrder API shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error({ signal, error }, "MiniOrder API shutdown failed");
      process.exit(1);
    }
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
};

const closeHttpServer = (server: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      reject(new Error("HTTP server shutdown timeout"));
    }, 10_000);

    server.close((error) => {
      clearTimeout(timeout);

      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

bootstrap().catch((error) => {
  logger.error(error, "Failed to start MiniOrder API");
  process.exit(1);
});
