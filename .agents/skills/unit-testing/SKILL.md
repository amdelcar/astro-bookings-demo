---
name: unit-testing
description: Guides fast, colocated Vitest coverage for business logic and validation code.
---

# Unit Testing

## When to write unit tests
- Write unit tests for services, utilities, and validation logic when the behavior is deterministic and independent from HTTP transport.
- Add a unit test when fixing a bug or covering a branching rule that is easy to regress.

## File naming and location
- Keep tests colocated as `*.spec.ts` next to the source file under `src/`.
- Prefer small and focused specs that exercise one behavior at a time.

## Test structure
- Use `describe()` and `it()` blocks to group scenarios by behavior.
- Follow arrange-act-assert: construct input, call the function, then assert the result.

## Mocking dependencies
- Use `vi.fn()` for repository methods or external services.
- Keep mocks narrow and assert the exact calls and arguments that matter.

## Running tests
- Use `npm run test:dev` during development for interactive watch mode.
- Use `npm run test:unit` for a single pass in CI or local verification.

## Coverage expectations
- Aim for meaningful coverage on service and utility logic, with a target above 80% for the most critical files.

```ts
const repository = { create: vi.fn() };
const service = new RocketService(repository as any);
service.create({ name: "Atlas", range: "orbital", capacity: 5 });
expect(repository.create).toHaveBeenCalledWith({ name: "Atlas", range: "orbital", capacity: 5 });
```

See the Vitest docs for advanced matchers, mocking patterns, and coverage configuration: https://vitest.dev/
