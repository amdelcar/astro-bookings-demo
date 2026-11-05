import { describe, expect, it } from "vitest";
import { InMemoryBookingRepository } from "../booking-repository.js";
import { InMemoryCustomerRepository } from "../customer-repository.js";
import { InMemoryLaunchRepository } from "../launch-repository.js";
import { InMemoryRocketRepository } from "../rocket-repository.js";
import { BookingService } from "./booking.service.js";

function createFixture(capacity = 4) {
  const bookings = new InMemoryBookingRepository();
  const customers = new InMemoryCustomerRepository();
  const launches = new InMemoryLaunchRepository();
  const rockets = new InMemoryRocketRepository();
  const customer = customers.create({
    email: "traveler@example.com",
    name: "Test Traveler",
    phone: "+12345678901",
  });
  const rocket = rockets.create({
    name: "Booking Rocket",
    range: "orbital",
    capacity,
  });
  const launch = launches.create({
    rocketId: rocket.id,
    launchDate: "2099-01-01T00:00:00.000Z",
    price: 250,
    minPassengers: 1,
  });

  return {
    bookings,
    customers,
    launches,
    rockets,
    customer,
    launch,
    rocket,
    service: new BookingService(bookings, customers, launches, rockets),
  };
}

describe("BookingService", () => {
  it("creates a booking with a price snapshot and updates availability", () => {
    const { customer, launch, service } = createFixture();

    const result = service.create({
      customerId: customer.id,
      launchId: launch.id,
      seatCount: 2,
    });

    expect(result.kind).toBe("created");
    if (result.kind !== "created") {
      return;
    }

    expect(result.booking).toMatchObject({
      customerId: customer.id,
      launchId: launch.id,
      seatCount: 2,
      perSeatPrice: 250,
      totalPrice: 500,
      status: "pending",
    });
    expect(result.booking.createdAt).toBeInstanceOf(Date);
    expect(service.getAvailability(launch.id)).toEqual({
      kind: "available",
      availability: {
        launchId: launch.id,
        capacity: 4,
        reservedSeats: 2,
        availableSeats: 2,
        pricePerSeat: 250,
      },
    });
  });

  it.each([
    undefined,
    null,
    {},
    { customerId: "customer", launchId: "launch", seatCount: 0 },
    { customerId: "customer", launchId: "launch", seatCount: 1.5 },
  ])("rejects invalid booking input: %o", (input) => {
    const { service, bookings } = createFixture();
    expect(service.create(input).kind).toBe("invalid");
    expect(bookings.listByLaunch("launch")).toEqual([]);
  });

  it("distinguishes total-capacity validation from remaining-seat conflicts", () => {
    const { customer, launch, service } = createFixture(2);

    expect(
      service.create({
        customerId: customer.id,
        launchId: launch.id,
        seatCount: 3,
      }),
    ).toMatchObject({ kind: "invalid" });

    service.create({
      customerId: customer.id,
      launchId: launch.id,
      seatCount: 1,
    });
    expect(
      service.create({
        customerId: customer.id,
        launchId: launch.id,
        seatCount: 2,
      }),
    ).toEqual({ kind: "capacity_conflict", availableSeats: 1 });
  });

  it("returns not-found results without writing bookings", () => {
    const { customer, launch, service, bookings } = createFixture();

    expect(
      service.create({
        customerId: "missing",
        launchId: launch.id,
        seatCount: 1,
      }),
    ).toEqual({ kind: "not_found", resource: "Customer" });
    expect(
      service.create({
        customerId: customer.id,
        launchId: "missing",
        seatCount: 1,
      }),
    ).toEqual({ kind: "not_found", resource: "Launch" });
    expect(bookings.listByLaunch(launch.id)).toEqual([]);
    expect(service.listByCustomer("missing")).toBeUndefined();
  });

  it.each(["completed", "suspended", "cancelled"] as const)(
    "rejects a launch with status %s",
    (status) => {
      const { customer, launch, launches, service, bookings } = createFixture();
      launches.updateStatus(launch.id, status);

      expect(
        service.create({
          customerId: customer.id,
          launchId: launch.id,
          seatCount: 1,
        }),
      ).toEqual({ kind: "unavailable", status });
      expect(bookings.listByLaunch(launch.id)).toEqual([]);
    },
  );

  it("allows bookings while a launch is active", () => {
    const { customer, launch, launches, service } = createFixture();
    launches.updateStatus(launch.id, "active");

    expect(
      service.create({
        customerId: customer.id,
        launchId: launch.id,
        seatCount: 1,
      }).kind,
    ).toBe("created");
  });
});
