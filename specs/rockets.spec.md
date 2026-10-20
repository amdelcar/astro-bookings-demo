# Rocket Management API Specification

## Problem Description

- As a booking administrator, I want to create and maintain rocket records so that launches can be associated with rockets of known range and passenger capacity.
- As a booking administrator, I want to retrieve rocket records so that I can review which rockets are available for launch planning.
- As a client of the booking API, I want invalid rocket data to be rejected so that rocket records remain consistent.

## Solution Overview

Provide an API for creating, viewing, updating, and removing rockets. Each rocket has a name, a range, and a passenger capacity. The API validates these values when a rocket is created or changed and makes valid rocket records available for retrieval.

## Acceptance Criteria

- [ ] When a client submits a rocket with a name, a supported range, and a capacity from 1 to 10 passengers, the system shall create the rocket and return its record.
- [ ] When a client submits a rocket without a name or with an empty name, the system shall reject the request and explain that the name is required.
- [ ] When a client submits a rocket with a range other than `suborbital`, `orbital`, `moon`, or `mars`, the system shall reject the request and identify the supported range values.
- [ ] When a client submits a rocket with a capacity that is not an integer from 1 to 10, the system shall reject the request and explain the valid capacity limits.
- [ ] When a client requests the rocket collection, the system shall return the rocket records available to the application.
- [ ] When a client requests an existing rocket, the system shall return that rocket's record; when the rocket does not exist, the system shall return a not-found response.
- [ ] When a client submits valid changes for an existing rocket, the system shall update that rocket and return its updated record.
- [ ] When a client requests removal of an existing rocket, the system shall remove it; subsequent retrieval of that rocket shall return a not-found response.
