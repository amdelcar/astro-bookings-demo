# Agents Instructions

## Product Overview
AstroBookings is a backend API for managing rockets, launches, and customer
profiles for a rocket-launch booking demo. Rockets have capacity limits and
launch status lifecycles. Booking and payment features are planned.
This is a demo system for training purposes.

## Technical Implementation

### Tech Stack
- Language: **TypeScript 5.7** on **Node.js 20+**
- Framework: **Express 5**
- Database: **In-memory store** (no persistence)
- Security: **None** (demo only)
- Testing: **Node.js test runner** for HTTP/repository tests and **Vitest** for unit tests
- Logging: **Structured JSON console events**
- Version: **1.9.0** (tracked in package.json and CHANGELOG.md)

### Development workflow
```bash
# Set up the project
npm install

# Build/Compile the project
npm run build

# Run the project
npm run dev        # Development mode with watch
npm start          # Production mode

# Test the project
npm test              # Run configured HTTP and repository tests
npm run test:dev      # Run Vitest in watch mode
npm run test:unit     # Run unit tests once
npm run test:coverage # Run coverage report

# Deploy the project
# No deployment configured - demo only
```

### Folder structure
```text
.                         # Project root  
├── AGENTS.md             # This file with instructions for AI agents
├── .agents/              # Agent docs and skills
│   ├── PRD.md            # Product Requirements Document
│   ├── ADD.md            # Architectural Design Document
│   └── skills/           # Agent skills and templates
├── README.md             # The main human documentation file
├── CHANGELOG.md          # Version history and release notes
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .agents/specs/        # Feature specifications and implementation plans
├── src/                  # Source code
│   ├── app.ts            # Express app composition
│   ├── index.ts          # Server entry point
│   ├── customer.ts       # Customer data types
│   ├── customer-repository.ts
│   ├── customers.ts      # Customer API routes
│   ├── launch.ts         # Launch data types
│   ├── launch-repository.ts
│   ├── launches.ts       # Launch API routes
│   ├── rocket.ts         # Rocket data types
│   ├── rocket-repository.ts
│   ├── rockets.ts        # Rocket API routes
│   ├── routes/           # Express route handlers
│   │   └── customerRoutes.ts # Compatibility export for customer router
│   ├── services/         # Business logic and data stores
│   │   └── customer.service.ts
│   ├── types/            # Compatibility exports for domain types
│   ├── logger.ts         # Structured event logging
│   └── utils/
│       └── validation.ts # Shared input validation
└── tests/                # HTTP and repository test files
    ├── customer.spec.ts  # Legacy, unconfigured customer test prototype
    ├── logging.test.ts
    ├── rocket-repository.test.ts
    └── rockets.test.ts
```

### Architecture & Coding Standards
- **Type definitions**: Use `type` for data structures, `interface` for class contracts (per TypeScript instructions in .github/instructions/)
- **File naming**: `kebab-case.{pattern}.ts` (e.g., `rocket.service.ts`, `error-handler.ts`)
- **Exports**: Prefer named exports over default exports
- **Error handling**: Custom error classes (`AppError`, `ValidationError`) with structured error responses
- **Validation**: Centralized validation in utilities
- **Data storage**: In-memory stores for demo purposes
- **Logging**: Structured logging with levels (info, warn, error, debug) via LOG_LEVEL env var

## Environment
- Code and documentation must be in English.
- Chat responses must be in the language of the user prompt.
- Sacrifice grammar for conciseness in responses.
- This is a windows environment using git bash terminal.
- My default branch is `main`.
- Remote repository, with active issues, is hosted on GitHub :
  - [AlbertoBasaloAcademy / astro-bookings-demo](https://github.com/AlbertoBasaloAcademy/astro-bookings-demo)