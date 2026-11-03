import assert from "node:assert/strict";
import { test } from "node:test";
import type { RocketFields } from "../src/rocket.js";
import { InMemoryRocketRepository } from "../src/rocket-repository.js";

test("stores, retrieves, updates, and deletes rockets", () => {
  const repository = new InMemoryRocketRepository();
  const fields: RocketFields = {
    name: "Odyssey",
    range: "moon",
    capacity: 6,
  };

  assert.deepEqual(repository.list(), []);
  const created = repository.create(fields);
  assert.ok(created.id);
  assert.deepEqual(repository.findById(created.id), created);
  assert.deepEqual(repository.list(), [created]);

  const updated = repository.update(created.id, {
    name: "Odyssey II",
    range: "mars",
    capacity: 8,
  });
  assert.deepEqual(updated, {
    id: created.id,
    name: "Odyssey II",
    range: "mars",
    capacity: 8,
  });
  assert.equal(repository.update("missing", fields), undefined);

  assert.equal(repository.delete(created.id), true);
  assert.equal(repository.delete(created.id), false);
  assert.equal(repository.findById(created.id), undefined);
  assert.deepEqual(repository.list(), []);
});
