import pino, { type LoggerOptions, type Logger as PinoLogger } from "pino";
import { env } from "../infrastructure/config/env.js";

const loggerOptions: LoggerOptions = {
  level: env.logger.level,

  base: {
    service: "miniorder-api",
    environment: env.environment,
  },

  redact: {
    paths: ["password", "token", "authorization", "headers.authorization"],
    censor: "[REDACTED]",
  },

  ...(env.environment === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
};

export const logger = pino(loggerOptions);

export type Logger = PinoLogger;
