import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/app.js";

const server = createApp().listen(0);
let baseUrl = "";

const serverStarted = new Promise<void>((resolve, reject) => {
  server.once("listening", resolve);
  server.once("error", reject);
});

before(async () => {
  await serverStarted;
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Test server did not bind to a TCP port.");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server.listening) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

type CustomerResponse = { id: string };
type RocketResponse = { id: string };
type LaunchResponse = { id: string; status: string };
type BookingResponse = {
  id: string;
  customerId: string;
  launchId: string;
  seatCount: number;
  perSeatPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

async function createCustomer(): Promise<CustomerResponse> {
  return postJson<CustomerResponse>("/customers", {
    email: `booking-${randomUUID()}@example.com`,
    name: "Booking Traveler",
    phone: "+12345678901",
  });
}

async function createLaunch(
  capacity: number,
  price = 250,
): Promise<LaunchResponse> {
  const rocket = await postJson<RocketResponse>("/rockets", {
    name: `Booking Rocket ${randomUUID()}`,
    range: "orbital",
    capacity,
  });

  return postJson<LaunchResponse>("/launches", {
    rocketId: rocket.id,
    launchDate: "2099-01-01T00:00:00.000Z",
    price,
    minPassengers: 1,
  });
}

test("creates a booking and returns it in booking and customer reads", async () => {
  const customer = await createCustomer();
  const launch = await createLaunch(4, 125);

  const availabilityBefore = await fetch(
    `${baseUrl}/launches/${launch.id}/availability`,
  );
  assert.equal(availabilityBefore.status, 200);
  assert.deepEqual(await availabilityBefore.json(), {
    launchId: launch.id,
    capacity: 4,
    reservedSeats: 0,
    availableSeats: 4,
    pricePerSeat: 125,
  });

  const createResponse = await fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId: customer.id,
      launchId: launch.id,
      seatCount: 2,
    }),
  });
  assert.equal(createResponse.status, 201);
  const booking = (await createResponse.json()) as BookingResponse;
  assert.ok(booking.id);
  assert.equal(booking.customerId, customer.id);
  assert.equal(booking.launchId, launch.id);
  assert.equal(booking.seatCount, 2);
  assert.equal(booking.perSeatPrice, 125);
  assert.equal(booking.totalPrice, 250);
  assert.equal(booking.status, "pending");
  assert.ok(booking.createdAt);

  const getResponse = await fetch(`${baseUrl}/bookings/${booking.id}`);
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), booking);

  const historyResponse = await fetch(
    `${baseUrl}/customers/${customer.id}/bookings`,
  );
  assert.equal(historyResponse.status, 200);
  assert.deepEqual(await historyResponse.json(), [booking]);

  const availabilityAfter = await fetch(
    `${baseUrl}/launches/${launch.id}/availability`,
  );
  assert.deepEqual(await availabilityAfter.json(), {
    launchId: launch.id,
    capacity: 4,
    reservedSeats: 2,
    availableSeats: 2,
    pricePerSeat: 125,
  });
});

test("rejects invalid requests and unknown customers or launches", async () => {
  const customer = await createCustomer();
  const launch = await createLaunch(2);
  const invalidBodies = [
    { customerId: customer.id, launchId: launch.id, seatCount: 0 },
    { customerId: customer.id, launchId: launch.id, seatCount: 1.5 },
    { customerId: customer.id, launchId: launch.id, seatCount: 3 },
  ];

  for (const body of invalidBodies) {
    const response = await fetch(`${baseUrl}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
  }

  const missingCustomer = await fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId: "missing-customer",
      launchId: launch.id,
      seatCount: 1,
    }),
  });
  assert.equal(missingCustomer.status, 404);

  const missingLaunch = await fetch(`${baseUrl}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId: customer.id,
      launchId: "missing-launch",
      seatCount: 1,
    }),
  });
  assert.equal(missingLaunch.status, 404);

  const availability = await fetch(
    `${baseUrl}/launches/${launch.id}/availability`,
  );
  assert.equal(
    ((await availability.json()) as { reservedSeats: number }).reservedSeats,
    0,
  );
});

test("serializes competing seat reservations without overbooking", async () => {
  const customer = await createCustomer();
  const launch = await createLaunch(3);

  const responses = await Promise.all(
    [2, 2].map((seatCount) =>
      fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          launchId: launch.id,
          seatCount,
        }),
      }),
    ),
  );

  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [201, 409],
  );

  const conflict = responses.find((response) => response.status === 409);
  assert.ok(conflict);
  assert.match((await conflict.json()).error, /1 seat/);

  const availability = await fetch(
    `${baseUrl}/launches/${launch.id}/availability`,
  );
  assert.deepEqual(await availability.json(), {
    launchId: launch.id,
    capacity: 3,
    reservedSeats: 2,
    availableSeats: 1,
    pricePerSeat: 250,
  });
});

test("returns not-found errors for missing booking, customer history, and launch", async () => {
  const responses = await Promise.all([
    fetch(`${baseUrl}/bookings/missing-booking`),
    fetch(`${baseUrl}/customers/missing-customer/bookings`),
    fetch(`${baseUrl}/launches/missing-launch/availability`),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status),
    [404, 404, 404],
  );
});
