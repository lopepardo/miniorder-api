import type { ErrorRequestHandler } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../../../shared/AppError.js";

export const errorMiddleware: ErrorRequestHandler = (error, request, response, _next) => {
  request.log.error(error);
  if (error instanceof ZodError) {
    response.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data.",
        details: z.flattenError(error).fieldErrors,
        traceId: request.id,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        traceId: request.id,
      },
    });
    return;
  }

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error.",
      traceId: request.id,
    },
  });
};
