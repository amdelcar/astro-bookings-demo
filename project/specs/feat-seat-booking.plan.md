# Implementation Plan for Seat Booking

## Step 1: Define the Booking Model
Define booking data using the existing TypeScript domain and repository
conventions.
- [x] Add booking types for IDs, seat count, per-seat price, total price, and
  creation timestamp.
- [x] Use a booking status that distinguishes a reserved seat from a
  payment-confirmed booking; align later payment transitions with FR5.
- [x] Record the launch's per-seat price on each booking so its total remains
  reproducible if launch pricing changes.
- [x] Update the ER model with booking attributes, relationships, and
  reservation rules.

## Step 2: Implement the In-Memory Booking Repository
Create a repository that owns booking records and enforces atomic seat
reservation.
- [x] Add an in-memory repository with create, find-by-ID, list-by-customer,
  and launch reservation operations.
- [x] Make reservation one synchronous repository operation that checks
  remaining capacity and inserts the booking together.
- [x] Calculate reserved seats from all bookings that currently hold seats.
- [x] Return a capacity conflict without inserting a record when insufficient
  seats remain.

## Step 3: Add Booking Business Logic
Validate and coordinate customer, launch, price, and capacity rules.
- [x] Validate that the request is an object containing a customer ID, launch
  ID, and positive integer seat count.
- [x] Verify referenced customers and launches exist before attempting
  reservation.
- [x] Reject launches that are completed, suspended, or cancelled; add or reuse
  only the launch lifecycle support required by FR6.
- [x] Calculate total price from the launch price and requested seat count,
  then delegate reservation to the atomic repository operation.

## Step 4: Expose Booking and Availability Endpoints
Wire the booking service into the Express application and existing launch and
customer routes.
- [x] Create one shared booking repository in the application and inject the
  same booking service dependencies into the booking, launch, and customer
  routes.
- [x] Add `POST /bookings` and `GET /bookings/:id` endpoints.
- [x] Add `GET /customers/:id/bookings` for booking history.
- [x] Add `GET /launches/:id/availability` with capacity, reserved seats,
  available seats, and per-seat price.
- [x] Return `201` for reservations, `200` for reads, `400` for invalid input,
  `404` for missing resources, and `409` for insufficient availability.
- [x] Log booking creation and conflicts without logging request bodies.

## Step 5: Verify Domain and API Behavior
Cover business rules, integrations, and acceptance criteria with automated
tests.
- [x] Add Vitest unit tests for validation, price calculation, not-found cases,
  launch eligibility, and repository reservation behavior.
- [x] Add API tests for availability, create, retrieve, customer history, and
  expected error responses.
- [x] Test competing reservations and assert total reserved seats
  never exceed rocket capacity.
- [x] Assert failed requests create no booking and do not reduce availability.
- [x] Include the new API test file in the configured `npm test` command.

## Step 6: Document and Validate the Feature
Keep public API and project records aligned with the implementation.
- [x] Document booking request/response fields, endpoint behavior, and error
  codes in the README.
- [x] Update the FR4 specification and PRD status when implementation is
  complete and verified.
- [x] Run the build, unit tests, and configured API test suite.
