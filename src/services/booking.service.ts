import type {
  Booking,
  BookingFields,
  BookingRequest,
  LaunchAvailability,
} from "../booking.js";
import type { BookingRepository } from "../booking-repository.js";
import type { CustomerRepository } from "../customer-repository.js";
import type { LaunchRepository } from "../launch-repository.js";
import type { RocketRepository } from "../rocket-repository.js";
import { logEvent } from "../logger.js";
import { isRecord } from "../utils/validation.js";

type BookingInputValidation =
  | { valid: true; value: BookingRequest }
  | { valid: false; message: string };

export type CreateBookingResult =
  | { kind: "created"; booking: Booking }
  | { kind: "invalid"; message: string }
  | { kind: "not_found"; resource: "Customer" | "Launch" | "Rocket" }
  | { kind: "unavailable"; status: string }
  | { kind: "capacity_conflict"; availableSeats: number };

export type AvailabilityResult =
  | { kind: "available"; availability: LaunchAvailability }
  | { kind: "not_found"; resource: "Launch" | "Rocket" };

function validateBookingInput(input: unknown): BookingInputValidation {
  if (!isRecord(input)) {
    return { valid: false, message: "Request body must be a JSON object." };
  }

  const { customerId, launchId, seatCount } = input;
  if (typeof customerId !== "string" || customerId.trim().length === 0) {
    return { valid: false, message: "Customer ID is required." };
  }

  if (typeof launchId !== "string" || launchId.trim().length === 0) {
    return { valid: false, message: "Launch ID is required." };
  }

  if (
    typeof seatCount !== "number" ||
    !Number.isInteger(seatCount) ||
    seatCount <= 0
  ) {
    return {
      valid: false,
      message: "Seat count must be a positive integer.",
    };
  }

  return {
    valid: true,
    value: {
      customerId: customerId.trim(),
      launchId: launchId.trim(),
      seatCount,
    },
  };
}

export class BookingService {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly customers: CustomerRepository,
    private readonly launches: LaunchRepository,
    private readonly rockets: RocketRepository,
  ) {}

  create(input: unknown): CreateBookingResult {
    const validation = validateBookingInput(input);
    if (!validation.valid) {
      return { kind: "invalid", message: validation.message };
    }

    const { customerId, launchId, seatCount } = validation.value;
    const customer = this.customers.findById(customerId);
    if (!customer) {
      return { kind: "not_found", resource: "Customer" };
    }

    const launch = this.launches.findById(launchId);
    if (!launch) {
      return { kind: "not_found", resource: "Launch" };
    }

    if (launch.status !== "scheduled" && launch.status !== "active") {
      logEvent("booking_rejected", {
        launchId: launch.id,
        reason: "launch_not_bookable",
        launchStatus: launch.status,
      });
      return { kind: "unavailable", status: launch.status };
    }

    const rocket = this.rockets.findById(launch.rocketId);
    if (!rocket) {
      return { kind: "not_found", resource: "Rocket" };
    }

    if (seatCount > rocket.capacity) {
      return {
        kind: "invalid",
        message: `Seat count cannot exceed launch capacity (${rocket.capacity}).`,
      };
    }

    const fields: BookingFields = {
      customerId: customer.id,
      launchId: launch.id,
      seatCount,
      perSeatPrice: launch.price,
      totalPrice: launch.price * seatCount,
    };
    const reservation = this.bookings.reserve(fields, rocket.capacity);

    if (!reservation.reserved) {
      logEvent("booking_rejected", {
        launchId: launch.id,
        reason: "insufficient_seats",
        availableSeats: reservation.availableSeats,
      });
      return {
        kind: "capacity_conflict",
        availableSeats: reservation.availableSeats,
      };
    }

    logEvent("booking_created", {
      bookingId: reservation.booking.id,
      customerId: customer.id,
      launchId: launch.id,
      seatCount,
    });

    return { kind: "created", booking: reservation.booking };
  }

  getById(id: string): Booking | undefined {
    return this.bookings.findById(id);
  }

  listByCustomer(customerId: string): Booking[] | undefined {
    if (!this.customers.findById(customerId)) {
      return undefined;
    }

    return this.bookings.listByCustomer(customerId);
  }

  getAvailability(launchId: string): AvailabilityResult {
    const launch = this.launches.findById(launchId);
    if (!launch) {
      return { kind: "not_found", resource: "Launch" };
    }

    const rocket = this.rockets.findById(launch.rocketId);
    if (!rocket) {
      return { kind: "not_found", resource: "Rocket" };
    }

    const reservedSeats = this.bookings.getReservedSeatCount(launch.id);
    return {
      kind: "available",
      availability: {
        launchId: launch.id,
        capacity: rocket.capacity,
        reservedSeats,
        availableSeats: Math.max(0, rocket.capacity - reservedSeats),
        pricePerSeat: launch.price,
      },
    };
  }
}
