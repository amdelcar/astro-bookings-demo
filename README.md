# AstroBookings

AstroBookings is a backend API for offering bookings for rocket launches.




- Launches are scheduled for specific rockets with pricing and minimum passenger thresholds.
- Rockets have limited seats; launch requests are validated against rocket capacity.
- Customers are identified by  email and store name and phone details.
- Launch status lifecycle: scheduled -> confirmed -> successful, or cancellation/suspension paths.
- One customer can book multiple seats on a launch but cannot exceed the available seats.
- Customers are billed upon booking, and payments are processed through a mock gateway.

> [!WARNING]
> AstroBookings is a fictional training project.
> It is intentionally in-memory, unauthenticated, and not designed for production use.

## Development

Requires Node.js 20 or later.

```sh
npm install
npm run dev
```

The server listens on port `3000` by default; set `PORT` to use another port.
The `GET /health` endpoint returns `{"status":"ok"}`.
Build with `npm run build`, then run the compiled app with `npm start`.
Run `npm test` for the rocket API end-to-end checks, or `npm run typecheck` to
check types without emitting files.

## Logging

The service writes JSON log lines to stdout for key server events. Every log entry
includes a UTC `timestamp`, the `event` name, and any relevant metadata such as a
request method, route, response status, elapsed time, or resource ID. Request
bodies are never logged, so sensitive payload data stays out of the terminal.

Example log output:

```json
{"timestamp":"2026-11-02T01:04:15.000Z","event":"request_completed","method":"GET","path":"/health","status":200,"elapsedMs":5,"outcome":"success"}
```

This helps track application startup, request outcomes, and unexpected server
errors while keeping validation and not-found cases easy to differentiate from
failures.

## Rocket API

Rocket records are managed through a repository abstraction. The default
in-memory repository loses records when the server restarts.
The API router accepts a `RocketRepository` implementation to allow different
storage backends without changing request handling or validation.
Each rocket has a generated `id`, a non-empty `name`, a `range` (`suborbital`,
`orbital`, `moon`, or `mars`), and a `capacity` from 1 to 10 passengers.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/rockets` | List rockets |
| `POST` | `/rockets` | Create a rocket |
| `GET` | `/rockets/:id` | Retrieve a rocket |
| `PUT` | `/rockets/:id` | Replace a rocket |
| `PATCH` | `/rockets/:id` | Update rocket fields |
| `DELETE` | `/rockets/:id` | Remove a rocket |

Create a rocket with `POST /rockets` and a JSON body such as:

```json
{
  "name": "Odyssey",
  "range": "moon",
  "capacity": 6
}
```

Invalid rocket data receives a `400` response; requests for unknown rocket IDs
receive a `404` response.

- [Repository at GitHub](https://github.com/amdelcar/astro-bookings-demo)
- Default branch: `main`
- **Author**: [Ana Delgado]
