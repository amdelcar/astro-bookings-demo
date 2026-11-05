# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2026-11-05

### Added

- Customer management API for registration, retrieval by ID or email, profile
  updates, deletion, and filtered/paginated listing.
- Customer validation for unique normalized email addresses, names, and
  international phone numbers.
- Customer API documentation and unit tests for customer service behavior.

## [1.8.0] - 2026-11-03

### Added

- Launch scheduling API with launch creation, retrieval, and deletion routes.
- Validation for launch pricing, future dates, and minimum passenger thresholds
  against rocket capacity.
- Documentation for the launch endpoint in the project README.

## [1.7.0] - 2026-11-03

### Added

- Structured console logging for server startup, completed requests, rocket
  lifecycle events, and unexpected errors without logging request payloads.
- README documentation describing the logging output and development commands.

## [1.6.0] - 2026-10-21

### Added

- Rocket management API with create, list, retrieve, replace, update, and delete operations.
- Validation for rocket names, supported ranges, and passenger capacities.
- End-to-end tests covering rocket API acceptance criteria.
- README instructions and endpoint reference for the rocket API.
