# Seat Booking and Reservation Specification
- **Type**: feat
- **Status**: Planned

## Problem Description

Customers need to reserve seats on launches without exceeding available rocket
capacity. Booking systems need current availability, a reliable reservation
record, and a clear total cost for each booking.

### User Stories

- As a **customer**, I want to reserve one or more seats on a launch so that I
  can travel with my party.
- As a **booking system**, I want to check launch availability and price so
  that I can offer customers accurate options.
- As a **customer**, I want to retrieve my bookings so that I can confirm my
  reservations.

## Solution Overview

### User/App interface

- `GET /launches/:id/availability` - Retrieve launch capacity, reserved seats,
  available seats, and per-seat price.
- `POST /bookings` - Reserve seats for a customer on a launch.
- `GET /bookings/:id` - Retrieve a booking.
- `GET /customers/:id/bookings` - List a customer's bookings.
- Booking requests contain `customerId`, `launchId`, and a positive integer
  `seatCount`.
- Successful creation returns `201` and a booking record containing its ID,
  customer and launch IDs, seat count, per-seat price, total price, and
  creation timestamp.
- Invalid requests return `400`; unknown customers, launches, or bookings
  return `404`; requests for unavailable seats return `409`.

### Model and logic

- Each booking associates one customer with one launch and reserves one or
  more seats.
- A launch accepts bookings only while it is open for booking; completed,
  suspended, or cancelled launches are not bookable.
- The requested seat count must not exceed the launch's current available
  seats.
- Total price is the launch's per-seat price multiplied by the requested seat
  count, in the same units as the launch price.
- A booking and its seat reservation are committed together. A failed
  reservation creates no booking and consumes no seats.
- Multiple bookings for a customer are supported. Payment processing,
  cancellation, and refunds are outside this feature.

### Persistence

- Customers, bookings, and launch seat reservations are held in memory.
- Availability reflects all successful bookings for a launch and is lost when
  the application restarts.

## Acceptance Criteria

- [ ] WHEN a client requests availability for an existing launch, THE System
  SHALL return its total capacity, reserved seat count, available seat count,
  and per-seat price.
- [ ] WHEN a client submits a valid booking for an existing customer and a
  launch open for booking with sufficient seats, THE System SHALL create one
  booking and return `201` with its identifiers, seat count, per-seat price,
  total price, and creation timestamp.
- [ ] WHEN a client submits a booking with a missing or unknown customer or
  launch, THE System SHALL return `404` and SHALL NOT create a booking or
  reserve seats.
- [ ] WHEN a client submits a booking with a seat count that is missing, not a
  positive integer, or larger than the launch capacity, THE System SHALL return
  `400` and SHALL NOT create a booking or reserve seats.
- [ ] WHEN a client requests more seats than are currently available, THE
  System SHALL return `409` with the available seat count and SHALL NOT create
  a booking or change availability.
- [ ] WHILE a launch is completed, suspended, or cancelled, WHEN a client
  submits a booking for that launch, THE System SHALL reject the booking and
  SHALL NOT reserve seats.
- [ ] WHEN multiple bookings compete for the remaining seats, THE System SHALL
  confirm only bookings whose combined seat counts do not exceed capacity and
  SHALL leave availability consistent with the confirmed bookings.
- [ ] WHEN a client requests an existing booking or a customer's booking
  history, THE System SHALL return the requested booking record or the
  customer's bookings; WHEN the requested customer or booking does not exist,
  THE System SHALL return `404`.

**Related PRD**: FR4 - Seat Booking and Reservation  
**Dependencies**: FR2 - Launch Scheduling and Management; FR3 - Customer
Registration and Profile Management  
**Priority**: High
