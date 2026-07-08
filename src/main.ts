import { buildContainer } from "./composition/container.js";
import { env } from "./infrastructure/config/env.js";
import { createApp } from "./infrastructure/http/createApp.js";
import { logger } from "./shared/Logger.js";

const bootstrap = async () => {
  const container = await buildContainer(env);
  const app = createApp(container);

  app.listen(env.server.port, () => {
    logger.info(
      {
        port: env.server.port,
        url: `http://localhost:${env.server.port}`,
      },
      "MiniOrder API running",
    );
  });
};

bootstrap().catch((error) => {
  logger.error(error, "Failed to start MiniOrder API");
  process.exit(1);
});
