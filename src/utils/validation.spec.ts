import { describe, expect, it } from "vitest";
import {
  ValidationError,
  validateCustomerEmail,
  validateCustomerName,
  validateCustomerPhone,
  validateRocketInput,
} from "./validation.js";

describe("validateRocketInput", () => {
  it("accepts valid inputs and trims the rocket name", () => {
    expect(
      validateRocketInput({ name: "  Atlas  ", range: "orbital", capacity: 5 }),
    ).toEqual({ name: "Atlas", range: "orbital", capacity: 5 });
  });

  it("rejects empty names", () => {
    expect(() =>
      validateRocketInput({ name: "   ", range: "orbital", capacity: 5 }),
    ).toThrowError(ValidationError);
    expect(() =>
      validateRocketInput({ name: "   ", range: "orbital", capacity: 5 }),
    ).toThrowError("Rocket name is required.");
  });

  it("rejects unsupported ranges", () => {
    expect(() =>
      validateRocketInput({ name: "Atlas", range: "lunar", capacity: 5 }),
    ).toThrowError(ValidationError);
    expect(() =>
      validateRocketInput({ name: "Atlas", range: "lunar", capacity: 5 }),
    ).toThrowError("Rocket range must be suborbital, orbital, moon, or mars.");
  });

  it("rejects invalid capacities outside the 1-10 range", () => {
    expect(() =>
      validateRocketInput({ name: "Atlas", range: "orbital", capacity: 11 }),
    ).toThrowError(ValidationError);
    expect(() =>
      validateRocketInput({ name: "Atlas", range: "orbital", capacity: 0 }),
    ).toThrowError("Rocket capacity must be an integer from 1 to 10.");
  });
});

describe("customer validation helpers", () => {
  it("accepts valid email, name, and international phone formats", () => {
    expect(validateCustomerEmail(" Test@Example.com ")).toBe("test@example.com");
    expect(validateCustomerName("  Ana Delgado  ")).toBe("Ana Delgado");
    expect(validateCustomerPhone("+34666777888")).toBe("+34666777888");
  });

  it("rejects invalid email, name, and phone formats", () => {
    expect(() => validateCustomerEmail("not-an-email")).toThrowError(
      "Email must be a valid email address.",
    );
    expect(() => validateCustomerName("A")).toThrowError(
      "Customer name must be between 2 and 100 characters.",
    );
    expect(() => validateCustomerPhone("12345")).toThrowError(
      "Phone number must be a valid international format, such as +1234567890.",
    );
  });
});
