# Launch Scheduling API Specification

Related issue: [#3](https://github.com/amdelcar/astro-bookings-demo/issues/3)

## Problem Description

- As a booking administrator, I want to schedule launches for specific rockets so that each launch is tied to a known rocket configuration.
- As a pricing manager, I want each launch to include a price and minimum passenger threshold so that launch viability can be enforced before sales begin.
- As a client of the booking API, I want launch creation requests to be validated against rocket capacity so that launches are not overbooked and invalid requests fail fast.

## Solution Overview

Provide a launch management API that stores launch records with a selected rocket, a launch date, a price, and a minimum passenger threshold. The system validates that the rocket exists, that its seat capacity can support the launch demand, and that all required values are present before a launch is created.

## Acceptance Criteria

- [ ] When a client submits a launch with a valid rocket id, a future date, a positive price, and a minimum passenger threshold within the rocket’s capacity, the system shall create the launch and return the stored record.
- [ ] When a client submits a launch for a rocket that does not exist, the system shall reject the request and return a not-found error.
- [ ] When a client submits a launch with a price of zero or less, the system shall reject the request and explain that the price must be positive.
- [ ] When a client submits a launch with a minimum passenger threshold that is greater than the rocket capacity, the system shall reject the request and indicate the valid threshold range.
- [ ] When a client submits a launch with a passenger count above the rocket's available seats, the system shall reject the request and explain the capacity limit.
- [ ] When a client requests the launch collection, the system shall return all valid launches associated with the configured rockets.
- [ ] When a client requests a specific launch by id, the system shall return that launch record; when the launch does not exist, the system shall return a not-found response.
- [ ] When a client submits a launch without required fields, the system shall reject the request and explain which fields are missing.

## Implementation Plan

1. Define the launch model and validation rules for rocket reference, date, pricing, threshold, and capacity constraints.
2. Add the launch repository and route handlers to list, create, read, and remove launch records in the same pattern as the existing rocket API.
3. Reuse rocket capacity metadata to validate that launch requirements never exceed the selected rocket’s seat limit.
4. Add validation and error handling for missing values, invalid rocket ids, invalid pricing, and capacity threshold mismatches.
5. Update the project documentation to describe the launch endpoints and expected request/response behavior.
