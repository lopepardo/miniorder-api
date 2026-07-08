import { pinoHttp } from "pino-http";

import { uuidGenerator } from "../../../shared/IdGenerator.js";
import { logger } from "../../../shared/Logger.js";

const REQUEST_ID_HEADER = "x-request-id";

export const httpLoggerMiddleware = pinoHttp({
  logger,

  genReqId: (request, response) => {
    const incomingRequestId = request.headers[REQUEST_ID_HEADER];

    const requestId = Array.isArray(incomingRequestId) ? incomingRequestId[0] : incomingRequestId;

    const traceId = requestId ?? uuidGenerator();

    response.setHeader("X-Request-Id", traceId);

    return traceId;
  },

  customProps: (request) => ({
    traceId: request.id,
  }),
});
