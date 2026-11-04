import { rocketRanges, type RocketRange, type RocketFields } from "../rocket.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateRocketInput(input: unknown): RocketFields {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const record = input as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : undefined;
  const range = record.range;
  const capacity = record.capacity;

  if (!name || name.length === 0) {
    throw new ValidationError("Rocket name is required.");
  }

  if (typeof range !== "string" || !rocketRanges.includes(range as RocketRange)) {
    throw new ValidationError(
      "Rocket range must be suborbital, orbital, moon, or mars.",
    );
  }

  if (
    typeof capacity !== "number" ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 10
  ) {
    throw new ValidationError("Rocket capacity must be an integer from 1 to 10.");
  }

  return {
    name,
    range: range as RocketRange,
    capacity,
  };
}
