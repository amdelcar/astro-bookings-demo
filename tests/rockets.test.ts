import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
import { logEvent } from "../src/logger.js";
import type { Rocket, RocketRange } from "../src/rockets.js";

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

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

test("logs structured application events to the console", () => {
  const originalConsoleLog = console.log;
  const entries: string[] = [];

  console.log = (...args: unknown[]) => {
    entries.push(args.map((value) => String(value)).join(" "));
  };

  try {
    logEvent("server_started", { port: 3000, host: "localhost" });
    assert.equal(entries.length, 1);

    const entry = JSON.parse(entries[0]);
    assert.equal(entry.event, "server_started");
    assert.equal(entry.port, 3000);
    assert.equal(entry.host, "localhost");
    assert.ok(typeof entry.timestamp === "string");
    assert.match(entry.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    console.log = originalConsoleLog;
  }
});

test("logs HTTP outcomes without including request payloads", async () => {
  const originalConsoleLog = console.log;
  const entries: string[] = [];

  console.log = (...args: unknown[]) => {
    entries.push(args.map((value) => String(value)).join(" "));
  };

  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    assert.equal(healthResponse.status, 200);

    const invalidResponse = await fetch(`${baseUrl}/rockets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", range: "orbital", capacity: 2 }),
    });
    assert.equal(invalidResponse.status, 400);

    const parsedEntries = entries
      .map((entry) => JSON.parse(entry))
      .filter((entry) => typeof entry === "object" && entry !== null);

    assert.ok(
      parsedEntries.some(
        (entry) =>
          entry.event === "request_completed" &&
          entry.method === "GET" &&
          entry.path === "/health" &&
          entry.outcome === "success",
      ),
    );
    assert.ok(
      parsedEntries.some(
        (entry) =>
          entry.event === "request_completed" &&
          entry.method === "POST" &&
          entry.path === "/rockets" &&
          entry.outcome === "validation_error",
      ),
    );
    assert.ok(
      !entries.some((entry) =>
        /"body"|payload|requestBody/i.test(entry),
      ),
    );
  } finally {
    console.log = originalConsoleLog;
  }
});

test("creates valid rockets and lists supported ranges", async () => {
  const healthResponse = await fetch(`${baseUrl}/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await readJson<{ status: string }>(healthResponse), {
    status: "ok",
  });

  const initialList = await fetch(`${baseUrl}/rockets`);
  assert.equal(initialList.status, 200);
  assert.deepEqual(await readJson<Rocket[]>(initialList), []);

  const ranges: RocketRange[] = ["suborbital", "orbital", "moon", "mars"];
  const createdRockets: Rocket[] = [];

  for (const [index, range] of ranges.entries()) {
    const response = await fetch(`${baseUrl}/rockets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Rocket ${range}`,
        range,
        capacity: index + 1,
      }),
    });

    assert.equal(response.status, 201);
    const rocket = await readJson<Rocket>(response);
    assert.ok(rocket.id);
    assert.equal(rocket.name, `Rocket ${range}`);
    assert.equal(rocket.range, range);
    assert.equal(rocket.capacity, index + 1);
    createdRockets.push(rocket);
  }

  const listResponse = await fetch(`${baseUrl}/rockets`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await readJson<Rocket[]>(listResponse), createdRockets);
});

test("rejects missing or invalid rocket fields", async () => {
  const invalidBodies = [
    { range: "orbital", capacity: 2 },
    { name: "", range: "orbital", capacity: 2 },
    { name: "Invalid", range: "jupiter", capacity: 2 },
    { name: "Invalid", range: "moon", capacity: 0 },
    { name: "Invalid", range: "moon", capacity: 11 },
    { name: "Invalid", range: "moon", capacity: 1.5 },
  ];

  for (const body of invalidBodies) {
    const response = await fetch(`${baseUrl}/rockets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    assert.equal(response.status, 400);
    const error = await readJson<{ error: string }>(response);
    assert.ok(error.error.length > 0);
  }
});

test("retrieves, updates, and removes rockets", async () => {
  const createResponse = await fetch(`${baseUrl}/rockets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Update Candidate",
      range: "orbital",
      capacity: 4,
    }),
  });
  assert.equal(createResponse.status, 201);
  const created = await readJson<Rocket>(createResponse);

  const getResponse = await fetch(`${baseUrl}/rockets/${created.id}`);
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await readJson<Rocket>(getResponse), created);

  const missingResponse = await fetch(`${baseUrl}/rockets/unknown-id`);
  assert.equal(missingResponse.status, 404);

  const putResponse = await fetch(`${baseUrl}/rockets/${created.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Updated Rocket",
      range: "moon",
      capacity: 10,
    }),
  });
  assert.equal(putResponse.status, 200);
  const replaced = await readJson<Rocket>(putResponse);
  assert.deepEqual(replaced, {
    id: created.id,
    name: "Updated Rocket",
    range: "moon",
    capacity: 10,
  });

  const patchResponse = await fetch(`${baseUrl}/rockets/${created.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capacity: 3 }),
  });
  assert.equal(patchResponse.status, 200);
  assert.equal((await readJson<Rocket>(patchResponse)).capacity, 3);

  const deleteResponse = await fetch(`${baseUrl}/rockets/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(deleteResponse.status, 204);

  const deletedResponse = await fetch(`${baseUrl}/rockets/${created.id}`);
  assert.equal(deletedResponse.status, 404);
});
