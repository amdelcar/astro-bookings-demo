import express, { type ErrorRequestHandler, type Express } from "express";
import { getErrorType, logEvent } from "./logger.js";
import { createRocketsRouter } from "./rockets.js";

export function createApp(): Express {
  const app = express();

  app.use((request, response, next) => {
    const startedAt = Date.now();
    const requestPath = request.path;

    response.on("finish", () => {
      const status = response.statusCode;
      const outcome =
        status === 400
          ? "validation_error"
          : status === 404
            ? "not_found"
            : status >= 500
              ? "server_error"
              : "success";

      logEvent("request_completed", {
        method: request.method,
        path: requestPath,
        status,
        elapsedMs: Date.now() - startedAt,
        outcome,
      });
    });

    next();
  });

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/rockets", createRocketsRouter());

  const logErrors: ErrorRequestHandler = (error, request, _response, next) => {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    logEvent(status >= 500 ? "unexpected_error" : "request_error", {
      method: request.method,
      path: request.path,
      status,
      errorType: getErrorType(error),
    });
    next(error);
  };
  app.use(logErrors);

  return app;
}
