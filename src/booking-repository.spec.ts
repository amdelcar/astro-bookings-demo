import { describe, expect, it } from "vitest";
import { InMemoryBookingRepository } from "./booking-repository.js";

describe("InMemoryBookingRepository", () => {
  it("reserves seats and returns booking copies", () => {
    const repository = new InMemoryBookingRepository();
    const result = repository.reserve(
      {
        customerId: "customer-1",
        launchId: "launch-1",
        seatCount: 2,
        perSeatPrice: 125,
        totalPrice: 250,
      },
      3,
    );

    expect(result.reserved).toBe(true);
    if (!result.reserved) {
      return;
    }

    expect(result.booking).toMatchObject({
      customerId: "customer-1",
      launchId: "launch-1",
      seatCount: 2,
      perSeatPrice: 125,
      totalPrice: 250,
      status: "pending",
    });
    expect(repository.getReservedSeatCount("launch-1")).toBe(2);
    expect(repository.findById(result.booking.id)).toEqual(result.booking);
    expect(repository.listByCustomer("customer-1")).toEqual([result.booking]);
  });

  it("does not create a booking when the launch has insufficient seats", () => {
    const repository = new InMemoryBookingRepository();
    const first = repository.reserve(
      {
        customerId: "customer-1",
        launchId: "launch-1",
        seatCount: 2,
        perSeatPrice: 100,
        totalPrice: 200,
      },
      3,
    );
    expect(first.reserved).toBe(true);

    const second = repository.reserve(
      {
        customerId: "customer-2",
        launchId: "launch-1",
        seatCount: 2,
        perSeatPrice: 100,
        totalPrice: 200,
      },
      3,
    );

    expect(second).toEqual({ reserved: false, availableSeats: 1 });
    expect(repository.listByLaunch("launch-1")).toHaveLength(1);
    expect(repository.getReservedSeatCount("launch-1")).toBe(2);
  });

  it("counts pending and confirmed bookings, but releases cancelled bookings", () => {
    const repository = new InMemoryBookingRepository();
    const reservation = repository.reserve(
      {
        customerId: "customer-1",
        launchId: "launch-1",
        seatCount: 2,
        perSeatPrice: 100,
        totalPrice: 200,
      },
      2,
    );
    expect(reservation.reserved).toBe(true);
    if (!reservation.reserved) {
      return;
    }

    repository.updateStatus(reservation.booking.id, "confirmed");
    expect(repository.getReservedSeatCount("launch-1")).toBe(2);

    repository.updateStatus(reservation.booking.id, "cancelled");
    expect(repository.getReservedSeatCount("launch-1")).toBe(0);
  });
});
