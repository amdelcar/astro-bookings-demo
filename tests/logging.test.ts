import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createApp } from "../src/app.js";
import { getErrorType, logEvent } from "../src/logger.js";

const originalConsoleLog = console.log;

afterEach(() => {
  console.log = originalConsoleLog;
});

test("logs request completion and validation outcomes without request payloads", async () => {
  const logs: string[] = [];
  console.log = (...args: unknown[]) => {
    logs.push(args.join(" "));
  };

  const app = createApp();
  const server = app.listen(0);
  const serverStarted = new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  try {
    await serverStarted;
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const successResponse = await fetch(`${baseUrl}/rockets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Aurora",
        range: "moon",
        capacity: 3,
      }),
    });
    assert.equal(successResponse.status, 201);

    const validationResponse = await fetch(`${baseUrl}/rockets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Broken",
        range: "invalid",
        capacity: 0,
      }),
    });
    assert.equal(validationResponse.status, 400);

    const formatted = logs.join("\n");
    assert.match(formatted, /"event":"request_completed"/);
    assert.match(formatted, /"method":"POST"/);
    assert.match(formatted, /"status":201/);
    assert.match(formatted, /"outcome":"success"/);
    assert.match(formatted, /"status":400/);
    assert.match(formatted, /"outcome":"validation_error"/);
    assert.doesNotMatch(formatted, /"body"/i);
    assert.doesNotMatch(formatted, /"name":"Aurora"/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
});

test("logs unexpected server errors with the request context", () => {
  const logs: string[] = [];
  console.log = (...args: unknown[]) => {
    logs.push(args.join(" "));
  };

  const error = new Error("Boom");
  logEvent("unexpected_error", {
    method: "GET",
    path: "/break",
    status: 500,
    errorType: getErrorType(error),
  });

  const formatted = logs.join("\n");
  assert.match(formatted, /"event":"unexpected_error"/);
  assert.match(formatted, /"method":"GET"/);
  assert.match(formatted, /"path":"\/break"/);
  assert.match(formatted, /"status":500/);
  assert.match(formatted, /"errorType":"Error"/);
});
