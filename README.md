# AstroBookings

AstroBookings is a backend API for managing rockets, launches, and customer
profiles for a rocket-launch booking demo.

- Launches are scheduled for specific rockets with pricing and minimum passenger thresholds.
- Rockets have limited seats; launch requests are validated against rocket capacity.
- Customer profiles contain a unique email address, name, and international phone number.
- Launch status lifecycle: scheduled -> confirmed -> successful, or cancellation/suspension paths.

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
Run `npm test` for the configured HTTP and repository tests, `npm run test:unit`
for the Vitest unit suite, or `npm run typecheck` to check types without
emitting files.

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

## Launch API

Launches are scheduled for a specific rocket and include a launch date, a price,
and a minimum passenger threshold. The router validates these values against the
selected rocket's capacity before accepting the launch.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/launches` | List launches |
| `POST` | `/launches` | Create a launch |
| `GET` | `/launches/:id` | Retrieve a launch |
| `DELETE` | `/launches/:id` | Remove a launch |

Create a launch with `POST /launches` and a JSON body such as:

```json
{
  "rocketId": "<rocket-id>",
  "launchDate": "2027-02-14T18:00:00.000Z",
  "price": 2500,
  "minPassengers": 4
}
```

Launch creation fails with `400` for invalid data and `404` when the referenced
rocket does not exist. New launches start with `scheduled` status.

## Customer API

Customer records are kept in memory and are lost when the server restarts.
Emails are trimmed, normalized to lowercase, and unique. Email cannot be
changed after registration. Names must contain 2-100 supported characters and
phone numbers must use an international `+` format.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/customers` | List customers; supports `email` and `name` filters |
| `POST` | `/customers` | Register a customer |
| `GET` | `/customers/:id` | Retrieve a customer |
| `GET` | `/customers/email/:email` | Find a customer by email |
| `PUT` | `/customers/:id` | Update a customer's name and/or phone |
| `DELETE` | `/customers/:id` | Remove a customer |

Register a customer with `POST /customers` and a JSON body such as:

```json
{
  "email": "alex@example.com",
  "name": "Alex Morgan",
  "phone": "+1234567890"
}
```

Successful registration returns `201` with the customer record, including its
generated UUID and timestamps. Listing without pagination parameters returns
an array. Supplying `page` or `limit` returns an object with `items`, `page`,
`limit`, and `total`; for example, `GET /customers?page=1&limit=10`. Invalid
input and duplicate emails return `400`; unknown customer IDs or emails return
`404`. Errors use a JSON object with an `error` message.

## Booking API

Bookings reserve seats on scheduled or active launches. Each successful
reservation holds seats immediately, including while its payment is pending.
Booking data and seat availability are stored in memory and reset on restart.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/launches/:id/availability` | Return capacity, reserved and available seats, and price per seat |
| `POST` | `/bookings` | Reserve seats for a customer on a launch |
| `GET` | `/bookings/:id` | Retrieve a booking |
| `GET` | `/customers/:id/bookings` | List a customer's bookings |

Create a booking with `POST /bookings` and a JSON body such as:

```json
{
  "customerId": "<customer-id>",
  "launchId": "<launch-id>",
  "seatCount": 2
}
```

Successful reservations return `201` with the booking status, seat count,
captured per-seat price, total price, and creation timestamp. Invalid seat
counts return `400`, missing customers, launches, or bookings return `404`,
and launches that are not bookable or have insufficient remaining seats return
`409`. Reservations are created atomically, so rejected requests do not
consume seats. Payment processing is not part of this API.

- [Repository at GitHub](https://github.com/amdelcar/astro-bookings-demo)
- Default branch: `main`
- **Author**: [Ana Delgado]
