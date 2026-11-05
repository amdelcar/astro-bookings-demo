export const bookingStatuses = ["pending", "confirmed", "cancelled"] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

export type Booking = {
  id: string;
  launchId: string;
  customerId: string;
  seatCount: number;
  perSeatPrice: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
};

export type BookingFields = Pick<
  Booking,
  "launchId" | "customerId" | "seatCount" | "perSeatPrice" | "totalPrice"
>;

export type BookingRequest = Pick<
  Booking,
  "launchId" | "customerId" | "seatCount"
>;

export type LaunchAvailability = {
  launchId: string;
  capacity: number;
  reservedSeats: number;
  availableSeats: number;
  pricePerSeat: number;
};
