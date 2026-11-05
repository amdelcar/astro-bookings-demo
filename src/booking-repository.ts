import { randomUUID } from "node:crypto";
import type { Booking, BookingFields } from "./booking.js";

export type ReservationResult =
  | { reserved: true; booking: Booking }
  | { reserved: false; availableSeats: number };

export interface BookingRepository {
  findById(id: string): Booking | undefined;
  listByCustomer(customerId: string): Booking[];
  listByLaunch(launchId: string): Booking[];
  getReservedSeatCount(launchId: string): number;
  reserve(fields: BookingFields, capacity: number): ReservationResult;
  updateStatus(id: string, status: Booking["status"]): Booking | undefined;
}

export class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings = new Map<string, Booking>();

  findById(id: string): Booking | undefined {
    const booking = this.bookings.get(id);
    return booking ? { ...booking } : undefined;
  }

  listByCustomer(customerId: string): Booking[] {
    return [...this.bookings.values()]
      .filter((booking) => booking.customerId === customerId)
      .map((booking) => ({ ...booking }));
  }

  listByLaunch(launchId: string): Booking[] {
    return [...this.bookings.values()]
      .filter((booking) => booking.launchId === launchId)
      .map((booking) => ({ ...booking }));
  }

  getReservedSeatCount(launchId: string): number {
    let reservedSeats = 0;
    for (const booking of this.bookings.values()) {
      if (booking.launchId === launchId && booking.status !== "cancelled") {
        reservedSeats += booking.seatCount;
      }
    }

    return reservedSeats;
  }

  reserve(fields: BookingFields, capacity: number): ReservationResult {
    const reservedSeats = this.getReservedSeatCount(fields.launchId);
    const availableSeats = Math.max(0, capacity - reservedSeats);

    if (fields.seatCount > availableSeats) {
      return { reserved: false, availableSeats };
    }

    const booking: Booking = {
      id: randomUUID(),
      ...fields,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(booking.id, booking);

    return { reserved: true, booking: { ...booking } };
  }

  updateStatus(id: string, status: Booking["status"]): Booking | undefined {
    const booking = this.bookings.get(id);
    if (!booking) {
      return undefined;
    }

    const updated = { ...booking, status };
    this.bookings.set(id, updated);
    return { ...updated };
  }
}
