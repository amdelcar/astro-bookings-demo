import { rocketRanges, type RocketRange, type RocketFields } from "../rocket.js";
import type { CustomerFields } from "../customer.js";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateCustomerEmail(value: unknown): string {
  if (typeof value !== "string") {
    throw new ValidationError("Email is required.");
  }

  const email = normalizeEmail(value);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Email must be a valid email address.");
  }

  if (email.length > 255) {
    throw new ValidationError("Email must be 255 characters or fewer.");
  }

  return email;
}

export function validateCustomerName(value: unknown): string {
  if (typeof value !== "string") {
    throw new ValidationError("Customer name is required.");
  }

  const name = value.trim();

  if (name.length < 2 || name.length > 100) {
    throw new ValidationError("Customer name must be between 2 and 100 characters.");
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9 .'-]*$/.test(name)) {
    throw new ValidationError(
      "Customer name can only contain letters, numbers, spaces, apostrophes, hyphens, and periods.",
    );
  }

  return name;
}

export function validateCustomerPhone(value: unknown): string {
  if (typeof value !== "string") {
    throw new ValidationError("Phone number is required.");
  }

  const phone = value.trim();
  const digits = phone.replace(/[^\d]/g, "");

  if (!/^\+[1-9]\d{7,14}$/.test(phone) && !/^\+[1-9][\d\s().-]{7,19}$/.test(phone)) {
    throw new ValidationError(
      "Phone number must be a valid international format, such as +1234567890.",
    );
  }

  if (digits.length < 8 || digits.length > 20) {
    throw new ValidationError("Phone number must contain between 8 and 20 digits.");
  }

  return phone;
}

export function validateCustomerInput(input: unknown): CustomerFields {
  if (!isRecord(input)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const record = input as Record<string, unknown>;

  return {
    email: validateCustomerEmail(record.email),
    name: validateCustomerName(record.name),
    phone: validateCustomerPhone(record.phone),
  };
}

export function validateCustomerUpdate(input: unknown): Partial<CustomerFields> {
  if (!isRecord(input)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const record = input as Record<string, unknown>;
  const hasEmail = Object.prototype.hasOwnProperty.call(record, "email");
  const hasName = Object.prototype.hasOwnProperty.call(record, "name");
  const hasPhone = Object.prototype.hasOwnProperty.call(record, "phone");

  if (!hasEmail && !hasName && !hasPhone) {
    throw new ValidationError("Provide at least one customer field to update.");
  }

  const updates: Partial<CustomerFields> = {};

  if (hasEmail) {
    updates.email = validateCustomerEmail(record.email);
  }

  if (hasName) {
    updates.name = validateCustomerName(record.name);
  }

  if (hasPhone) {
    updates.phone = validateCustomerPhone(record.phone);
  }

  return updates;
}

export function isEmailAvailable(
  repository: { findByEmail(email: string): unknown },
  email: string,
): boolean {
  return repository.findByEmail(normalizeEmail(email)) === undefined;
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
