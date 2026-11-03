import { Router, type RequestHandler, type Response } from "express";
import { logEvent } from "./logger.js";
import { InMemoryLaunchRepository, type LaunchRepository } from "./launch-repository.js";
import type { Launch, LaunchFields } from "./launch.js";
import {
  InMemoryRocketRepository,
  type RocketRepository,
} from "./rocket-repository.js";

export type { Launch } from "./launch.js";
type ErrorResponse = { error: string };
type ApiResponse = Launch | Launch[] | ErrorResponse;
type RouteParams = Record<string, string>;
type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringField(
  record: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return undefined;
}

function readNumberField(
  record: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function isFutureIsoDate(value: string): boolean {
  if (!value || Number.isNaN(Date.parse(value))) {
    return false;
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.getTime() > Date.now();
}

function validateLaunchFields(input: unknown): ValidationResult<LaunchFields> {
  if (!isRecord(input)) {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const rocketId = readStringField(input, "rocketId", "rocket_id");
  const launchDate = readStringField(input, "launchDate", "date", "launch_date");
  const price = readNumberField(input, "price");
  const minPassengers = readNumberField(
    input,
    "minPassengers",
    "minimumPassengers",
    "minimum_passengers",
  );

  if (typeof rocketId !== "string" || rocketId.trim().length === 0) {
    return { valid: false, error: "Launch rocketId is required." };
  }

  if (typeof launchDate !== "string" || !isFutureIsoDate(launchDate)) {
    return {
      valid: false,
      error: "Launch date must be a valid future ISO date.",
    };
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return { valid: false, error: "Launch price must be a positive number." };
  }

  if (
    typeof minPassengers !== "number" ||
    !Number.isInteger(minPassengers) ||
    minPassengers < 1
  ) {
    return {
      valid: false,
      error: "Minimum passenger threshold must be an integer greater than zero.",
    };
  }

  return {
    valid: true,
    value: {
      rocketId: rocketId.trim(),
      launchDate,
      price,
      minPassengers,
    },
  };
}

function sendError(
  response: Response<ApiResponse>,
  status: number,
  message: string,
): void {
  response.status(status).json({ error: message });
}

export function createLaunchesRouter(
  repository: LaunchRepository = new InMemoryLaunchRepository(),
  rocketRepository: RocketRepository = new InMemoryRocketRepository(),
): ReturnType<typeof Router> {
  const router = Router();

  const listLaunches: RequestHandler<RouteParams, ApiResponse, unknown> = (
    _request,
    response,
  ) => {
    response.json(repository.list());
  };

  const createLaunch: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const validation = validateLaunchFields(request.body);
    if (!validation.valid) {
      sendError(response, 400, validation.error);
      return;
    }

    const rocket = rocketRepository.findById(validation.value.rocketId);
    if (!rocket) {
      sendError(response, 404, "Rocket not found.");
      return;
    }

    if (validation.value.minPassengers > rocket.capacity) {
      sendError(
        response,
        400,
        "Minimum passenger threshold cannot exceed rocket capacity.",
      );
      return;
    }

    const launch = repository.create(validation.value);
    logEvent("launch_created", {
      launchId: launch.id,
      rocketId: launch.rocketId,
    });
    response.status(201).json(launch);
  };

  const getLaunch: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const launch = repository.findById(request.params.id);
    if (!launch) {
      sendError(response, 404, "Launch not found.");
      return;
    }

    response.json(launch);
  };

  const deleteLaunch: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const launchId = request.params.id;
    if (!repository.delete(launchId)) {
      sendError(response, 404, "Launch not found.");
      return;
    }

    logEvent("launch_deleted", { launchId });
    response.status(204).send();
  };

  router.get("/", listLaunches);
  router.post("/", createLaunch);
  router.get("/:id", getLaunch);
  router.delete("/:id", deleteLaunch);

  return router;
}
