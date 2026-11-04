import type { Rocket, RocketRange } from "../rocket.js";
import type { RocketRepository } from "../rocket-repository.js";
import { validateRocketInput } from "../utils/validation.js";

export type RocketQuery = {
  range?: RocketRange;
  minCapacity?: number;
};

export class RocketService {
  constructor(private readonly repository: RocketRepository) {}

  create(input: unknown): Rocket {
    return this.repository.create(validateRocketInput(input));
  }

  list(query: RocketQuery = {}): Rocket[] {
    const rockets = this.repository.list();

    return rockets.filter((rocket) => {
      if (query.range && rocket.range !== query.range) {
        return false;
      }

      if (
        typeof query.minCapacity === "number" &&
        rocket.capacity < query.minCapacity
      ) {
        return false;
      }

      return true;
    });
  }

  getById(id: string): Rocket | undefined {
    return this.repository.findById(id);
  }
}
