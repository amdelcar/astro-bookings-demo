import { describe, expect, it, vi } from "vitest";
import type { RocketRepository } from "../rocket-repository.js";
import { RocketService } from "./rocket.service.js";

describe("RocketService", () => {
  it("creates a rocket and delegates input validation to the repository", () => {
    const repository = {
      list: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockReturnValue({
        id: "rocket-1",
        name: "Atlas",
        range: "orbital",
        capacity: 5,
      }),
      update: vi.fn(),
      delete: vi.fn(),
    } satisfies RocketRepository;

    const service = new RocketService(repository);
    const rocket = service.create({ name: "Atlas", range: "orbital", capacity: 5 });

    expect(repository.create).toHaveBeenCalledWith({
      name: "Atlas",
      range: "orbital",
      capacity: 5,
    });
    expect(rocket).toEqual({
      id: "rocket-1",
      name: "Atlas",
      range: "orbital",
      capacity: 5,
    });
  });

  it("returns rockets filtered by range and minimum capacity", () => {
    const repository = {
      list: vi.fn().mockReturnValue([
        { id: "a", name: "Atlas", range: "orbital", capacity: 4 },
        { id: "b", name: "Nova", range: "orbital", capacity: 8 },
        { id: "c", name: "Ares", range: "mars", capacity: 9 },
      ]),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } satisfies RocketRepository;

    const service = new RocketService(repository);
    const rockets = service.list({ range: "orbital", minCapacity: 5 });

    expect(rockets).toEqual([{ id: "b", name: "Nova", range: "orbital", capacity: 8 }]);
  });
});
