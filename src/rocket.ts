export const rocketRanges = ["suborbital", "orbital", "moon", "mars"] as const;

export type RocketRange = (typeof rocketRanges)[number];

export type Rocket = {
  id: string;
  name: string;
  range: RocketRange;
  capacity: number;
}

export type RocketFields = Omit<Rocket, "id">;
