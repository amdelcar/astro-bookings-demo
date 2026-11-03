import { randomUUID } from "node:crypto";
import type { Launch, LaunchFields } from "./launch.js";

export interface LaunchRepository {
  list(): Launch[];
  findById(id: string): Launch | undefined;
  create(fields: LaunchFields): Launch;
  delete(id: string): boolean;
}

export class InMemoryLaunchRepository implements LaunchRepository {
  private readonly launches = new Map<string, Launch>();

  list(): Launch[] {
    return [...this.launches.values()].map((launch) => ({ ...launch }));
  }

  findById(id: string): Launch | undefined {
    const launch = this.launches.get(id);
    return launch ? { ...launch } : undefined;
  }

  create(fields: LaunchFields): Launch {
    const launch = { id: randomUUID(), ...fields };
    this.launches.set(launch.id, launch);
    return { ...launch };
  }

  delete(id: string): boolean {
    return this.launches.delete(id);
  }
}
