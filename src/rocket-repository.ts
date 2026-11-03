import { randomUUID } from "node:crypto";
import type { Rocket, RocketFields } from "./rocket.js";

export interface RocketRepository {
  list(): Rocket[];
  findById(id: string): Rocket | undefined;
  create(fields: RocketFields): Rocket;
  update(id: string, fields: RocketFields): Rocket | undefined;
  delete(id: string): boolean;
}

export class InMemoryRocketRepository implements RocketRepository {
  private readonly rockets = new Map<string, Rocket>();

  list(): Rocket[] {
    return [...this.rockets.values()].map((rocket) => ({ ...rocket }));
  }

  findById(id: string): Rocket | undefined {
    const rocket = this.rockets.get(id);
    return rocket ? { ...rocket } : undefined;
  }

  create(fields: RocketFields): Rocket {
    const rocket = { id: randomUUID(), ...fields };
    this.rockets.set(rocket.id, rocket);
    return { ...rocket };
  }

  update(id: string, fields: RocketFields): Rocket | undefined {
    if (!this.rockets.has(id)) {
      return undefined;
    }

    const rocket = { id, ...fields };
    this.rockets.set(id, rocket);
    return { ...rocket };
  }

  delete(id: string): boolean {
    return this.rockets.delete(id);
  }
}
