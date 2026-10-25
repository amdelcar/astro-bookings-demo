import { randomUUID } from "node:crypto";
import { Router, type RequestHandler, type Response } from "express";

const rocketRanges = ["suborbital", "orbital", "moon", "mars"] as const;

export type RocketRange = (typeof rocketRanges)[number];

export interface Rocket {
  id: string;
  name: string;
  range: RocketRange;
  capacity: number;
}

type RocketFields = Omit<Rocket, "id">;
type RocketChanges = Partial<RocketFields>;
type ErrorResponse = { error: string };
type ApiResponse = Rocket | Rocket[] | ErrorResponse;
type RouteParams = Record<string, string>;
type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRocketRange(value: unknown): value is RocketRange {
  return typeof value === "string" && rocketRanges.includes(value as RocketRange);
}

function validateRocketFields(
  input: unknown,
  allowPartial = false,
): ValidationResult<RocketChanges> {
  if (!isRecord(input)) {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const fields: RocketChanges = {};
  const hasName = Object.prototype.hasOwnProperty.call(input, "name");
  const hasRange = Object.prototype.hasOwnProperty.call(input, "range");
  const hasCapacity = Object.prototype.hasOwnProperty.call(input, "capacity");

  if (allowPartial && !hasName && !hasRange && !hasCapacity) {
    return { valid: false, error: "Provide at least one rocket field to update." };
  }

  if (!allowPartial || hasName) {
    const name = input.name;
    if (typeof name !== "string" || name.trim().length === 0) {
      return { valid: false, error: "Rocket name is required." };
    }
    fields.name = name.trim();
  }

  if (!allowPartial || hasRange) {
    if (!isRocketRange(input.range)) {
      return {
        valid: false,
        error: "Rocket range must be suborbital, orbital, moon, or mars.",
      };
    }
    fields.range = input.range;
  }

  if (!allowPartial || hasCapacity) {
    const capacity = input.capacity;
    if (
      typeof capacity !== "number" ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 10
    ) {
      return {
        valid: false,
        error: "Rocket capacity must be an integer from 1 to 10.",
      };
    }
    fields.capacity = capacity;
  }

  return { valid: true, value: fields };
}

function readRocketPayload(
  fields: RocketChanges,
  allowPartial = false,
): ValidationResult<RocketFields> {
  const { name, range, capacity } = fields;

  if (!allowPartial && (name === undefined || range === undefined || capacity === undefined)) {
    return { valid: false, error: "Name, range, and capacity are required." };
  }

  if (name === undefined || range === undefined || capacity === undefined) {
    return { valid: false, error: "Name, range, and capacity are required." };
  }

  return { valid: true, value: { name, range, capacity } };
}

function sendError(
  response: Response<ApiResponse>,
  status: number,
  message: string,
): void {
  response.status(status).json({ error: message });
}

export function createRocketsRouter(): ReturnType<typeof Router> {
  const rockets = new Map<string, Rocket>();
  const router = Router();

  const listRockets: RequestHandler<RouteParams, ApiResponse, unknown> = (
    _request,
    response,
  ) => {
    response.json([...rockets.values()]);
  };

  const createRocket: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const result = validateRocketFields(request.body);
    if (!result.valid) {
      sendError(response, 400, result.error);
      return;
    }

    const payload = readRocketPayload(result.value);
    if (!payload.valid) {
      sendError(response, 400, payload.error);
      return;
    }

    const rocket: Rocket = {
      id: randomUUID(),
      ...payload.value,
    };
    rockets.set(rocket.id, rocket);
    response.status(201).json(rocket);
  };

  const getRocket: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const rocket = rockets.get(request.params.id);
    if (!rocket) {
      sendError(response, 404, "Rocket not found.");
      return;
    }

    response.json(rocket);
  };

  const updateRocket: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const rocket = rockets.get(request.params.id);
    if (!rocket) {
      sendError(response, 404, "Rocket not found.");
      return;
    }

    const result = validateRocketFields(request.body);
    if (!result.valid) {
      sendError(response, 400, result.error);
      return;
    }

    const payload = readRocketPayload(result.value);
    if (!payload.valid) {
      sendError(response, 400, payload.error);
      return;
    }

    const updatedRocket: Rocket = { id: rocket.id, ...payload.value };
    rockets.set(updatedRocket.id, updatedRocket);
    response.json(updatedRocket);
  };

  const patchRocket: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    const rocket = rockets.get(request.params.id);
    if (!rocket) {
      sendError(response, 404, "Rocket not found.");
      return;
    }

    const result = validateRocketFields(request.body, true);
    if (!result.valid) {
      sendError(response, 400, result.error);
      return;
    }

    const payload = readRocketPayload({ ...rocket, ...result.value }, true);
    if (!payload.valid) {
      sendError(response, 400, payload.error);
      return;
    }

    const updatedRocket: Rocket = { ...rocket, ...payload.value };
    rockets.set(updatedRocket.id, updatedRocket);
    response.json(updatedRocket);
  };

  const deleteRocket: RequestHandler<RouteParams, ApiResponse, unknown> = (
    request,
    response,
  ) => {
    if (!rockets.delete(request.params.id)) {
      sendError(response, 404, "Rocket not found.");
      return;
    }

    response.status(204).send();
  };

  router.get("/", listRockets);
  router.post("/", createRocket);
  router.get("/:id", getRocket);
  router.put("/:id", updateRocket);
  router.patch("/:id", patchRocket);
  router.delete("/:id", deleteRocket);

  return router;
}
