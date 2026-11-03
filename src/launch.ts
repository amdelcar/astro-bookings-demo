export type Launch = {
  id: string;
  rocketId: string;
  launchDate: string;
  price: number;
  minPassengers: number;
};

export type LaunchFields = Omit<Launch, "id">;
