export const launchStatuses = [
  "scheduled",
  "active",
  "completed",
  "suspended",
  "cancelled",
] as const;

export type LaunchStatus = (typeof launchStatuses)[number];

export type Launch = {
  id: string;
  rocketId: string;
  launchDate: string;
  price: number;
  minPassengers: number;
  status: LaunchStatus;
};

export type LaunchFields = Omit<Launch, "id" | "status">;
