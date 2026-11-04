import { describe, expect, it } from "vitest";
import { ValidationError, validateRocketInput } from "./validation.js";

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
