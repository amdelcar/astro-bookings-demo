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
Run `npm run typecheck` to check types without emitting files.

- [Repository at GitHub](https://github.com/AlbertoBasaloAcademy/astro-bookings-demo)
- Default branch: `main`
- **Author**: [Alberto Basalo](https://albertobasalo.dev)
